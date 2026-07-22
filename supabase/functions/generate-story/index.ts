// Sora story-generation pipeline — Sora Dev Handoff.dc.html §4.
// context (active memory_facts + newest signs + goal rotation) → Claude →
// ElevenLabs TTS → MP3 cached in storage → stories row.
//
// Modes:
//   daily_moment      — cron job per user at local 9:00am (or on demand)
//   visions           — compose_text → 3 vision variants in one call
//   on_demand         — full script for a picked vision (title + angle)
//   modify            — original script + change note → rewrite (must differ)
//
// Secrets (supabase secrets set …): ANTHROPIC_API_KEY, ELEVENLABS_API_KEY.
// Deploy: supabase functions deploy generate-story

import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient } from 'npm:@supabase/supabase-js@2';

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });
const ELEVENLABS_KEY = Deno.env.get('ELEVENLABS_API_KEY');

// Stock narrator voices → ElevenLabs voice IDs (fill with real IDs; 'Your
// voice' resolves to the user's instant-clone voice_id stored on users).
const VOICE_IDS: Record<string, string> = {
  Nova: Deno.env.get('ELEVENLABS_VOICE_NOVA') ?? '',
  Wren: Deno.env.get('ELEVENLABS_VOICE_WREN') ?? '',
  Atlas: Deno.env.get('ELEVENLABS_VOICE_ATLAS') ?? '',
  Mara: Deno.env.get('ELEVENLABS_VOICE_MARA') ?? '',
};

type GenerateRequest = {
  mode: 'daily_moment' | 'visions' | 'on_demand' | 'modify';
  compose_text?: string; // visions / on_demand
  vision_title?: string; // on_demand
  story_id?: string; // modify
  change_note?: string; // modify
};

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
    );

    // Caller identity from the JWT — RLS-equivalent scoping for every query.
    const {
      data: { user: authUser },
    } = await createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
    ).auth.getUser();
    if (!authUser) return json({ error: 'unauthenticated' }, 401);
    const userId = authUser.id;

    const body = (await req.json()) as GenerateRequest;
    const t0 = Date.now();

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (!profile) return json({ error: 'no profile' }, 404);

    // ── Assemble context: active memory facts + newest signs + goal rotation
    const [{ data: facts }, { data: signs }, { data: goals }] = await Promise.all([
      supabase
        .from('memory_facts')
        .select('kind, text')
        .eq('user_id', userId)
        .eq('active', true), // deleted facts vanish from the very next generation (QA gate)
      supabase
        .from('journal_entries')
        .select('text, created_at')
        .eq('user_id', userId)
        .eq('kind', 'sign')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('goals')
        .select('id, title, area')
        .eq('user_id', userId)
        .eq('status', 'active'),
    ]);

    // Rotate across goals so no goal is ignored (complaint #1): pick the
    // active goal with the least-recent story.
    let goal: { id: string; title: string; area: string | null } | null = null;
    if (goals && goals.length > 0) {
      const { data: lastStories } = await supabase
        .from('stories')
        .select('goal_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      const lastByGoal = new Map<string, string>();
      for (const s of lastStories ?? []) {
        if (s.goal_id && !lastByGoal.has(s.goal_id)) lastByGoal.set(s.goal_id, s.created_at);
      }
      goal = [...goals].sort(
        (a, b) => (lastByGoal.get(a.id) ?? '').localeCompare(lastByGoal.get(b.id) ?? ''),
      )[0];
    }

    const context = [
      `Name: ${profile.name}${profile.name_phonetic ? ` (pronounced ${profile.name_phonetic})` : ''}`,
      `City: ${profile.city ?? 'unknown'}`,
      goal ? `Tonight's goal: ${goal.title}${goal.area ? ` (${goal.area})` : ''}` : '',
      facts?.length
        ? `Memory facts:\n${facts.map((f) => `- [${f.kind}] ${f.text}`).join('\n')}`
        : '',
      signs?.length
        ? `Recent signs the user logged (weave the newest into the plot):\n${signs
            .map((s) => `- ${s.text}`)
            .join('\n')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const system = `You write Sora manifestation stories: second-person, present-tense, ~450 words (about 3 minutes narrated), set concretely in the user's real life using their memory facts. Emotional pacing is gentle and unhurried — never salesy, never generic. Signs the user logged are treated as things that already happened; the story opens after the newest one. Never invent facts that contradict memory. Output only the story text (no title, no preamble).`;

    // ── Mode: visions — 3 variants in one call (title + angle), structured
    if (body.mode === 'visions') {
      const response = await anthropic.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: 2048,
        thinking: { type: 'adaptive' },
        system,
        output_config: {
          format: {
            type: 'json_schema',
            schema: {
              type: 'object',
              properties: {
                visions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      angle: { type: 'string' },
                    },
                    required: ['title', 'angle'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['visions'],
              additionalProperties: false,
            },
          },
        },
        messages: [
          {
            role: 'user',
            content: `${context}\n\nThe user wants to manifest: "${body.compose_text}". Propose exactly 3 distinct vision variants (evocative title + one-line angle) for a story about this.`,
          },
        ],
      });
      if (response.stop_reason === 'refusal') return json({ error: 'refused' }, 422);
      const text = response.content.find((b) => b.type === 'text');
      return json({ visions: JSON.parse(text?.type === 'text' ? text.text : '{}').visions });
    }

    // ── Script generation (daily_moment / on_demand / modify)
    let userPrompt: string;
    let kind: 'daily_moment' | 'on_demand' = 'daily_moment';
    let originalScript: string | null = null;
    let storyRow: { id: string; title: string; script_text: string } | null = null;

    if (body.mode === 'modify') {
      const { data: original } = await supabase
        .from('stories')
        .select('id, title, script_text')
        .eq('id', body.story_id)
        .eq('user_id', userId)
        .single();
      if (!original) return json({ error: 'story not found' }, 404);
      storyRow = original;
      originalScript = original.script_text;
      kind = 'on_demand';
      userPrompt = `${context}\n\nRewrite this story according to the user's change. It must be a visibly different script — new scenes and sentences, not light edits.\n\nOriginal story:\n${original.script_text}\n\nUser's change: "${body.change_note}"`;
    } else if (body.mode === 'on_demand') {
      kind = 'on_demand';
      userPrompt = `${context}\n\nWrite the full story for this chosen vision: "${body.vision_title}" (the user's desire: "${body.compose_text}").`;
    } else {
      userPrompt = `${context}\n\nWrite today's Moment — the daily story for tonight's goal.`;
    }

    let script = '';
    // Never reuse a script hash; regenerate once on collision.
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await anthropic.messages.create({
        model: 'claude-opus-4-8',
        max_tokens: 4096,
        thinking: { type: 'adaptive' },
        system,
        messages: [
          {
            role: 'user',
            content:
              attempt === 0
                ? userPrompt
                : `${userPrompt}\n\n(Please write a fresh, different telling this time.)`,
          },
        ],
      });
      if (response.stop_reason === 'refusal') return json({ error: 'refused' }, 422);
      const block = response.content.find((b) => b.type === 'text');
      script = block?.type === 'text' ? block.text.trim() : '';
      const hash = await sha256(script);
      const { data: dup } = await supabase
        .from('stories')
        .select('id')
        .eq('user_id', userId)
        .eq('script_hash', hash)
        .maybeSingle();
      // Modify must visibly differ — diff-check before serving (QA gate).
      const tooSimilar = originalScript !== null && script === originalScript.trim();
      if (!dup && !tooSimilar) break;
      if (attempt === 1) return json({ error: 'could not produce a distinct script' }, 500);
    }

    // ── TTS: ElevenLabs → MP3 in storage
    const voiceName = profile.voice_id as string;
    const elevenVoiceId =
      voiceName === 'Your voice' ? profile.clone_voice_id : VOICE_IDS[voiceName];
    let audioUrl: string | null = null;
    if (ELEVENLABS_KEY && elevenVoiceId) {
      const ttsRes = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`,
        {
          method: 'POST',
          headers: { 'xi-api-key': ELEVENLABS_KEY, 'content-type': 'application/json' },
          body: JSON.stringify({
            text: script,
            model_id: 'eleven_multilingual_v2',
            voice_settings: { stability: 0.55, similarity_boost: 0.8 },
          }),
        },
      );
      if (!ttsRes.ok) {
        // Audio never fails silently (QA gate) — surface the error state.
        return json({ error: 'tts_failed', detail: await ttsRes.text() }, 502);
      }
      const mp3 = new Uint8Array(await ttsRes.arrayBuffer());
      const path = `${userId}/${crypto.randomUUID()}.mp3`;
      const { error: upErr } = await supabase.storage
        .from('story-audio')
        .upload(path, mp3, { contentType: 'audio/mpeg' });
      if (upErr) return json({ error: 'storage_failed', detail: upErr.message }, 502);
      audioUrl = supabase.storage.from('story-audio').getPublicUrl(path).data.publicUrl;
    }

    // ── Persist
    const title =
      body.mode === 'modify'
        ? storyRow!.title
        : (body.vision_title ?? script.split('\n')[0].slice(0, 80));
    const hash = await sha256(script);
    const { data: inserted, error: insErr } = await supabase
      .from('stories')
      .insert({
        user_id: userId,
        goal_id: goal?.id ?? null,
        title,
        script_text: script,
        script_hash: hash,
        audio_url: audioUrl,
        voice_id: voiceName,
        kind,
      })
      .select('id')
      .single();
    if (insErr) return json({ error: insErr.message }, 500);

    // story_generated(kind, latency_ms) — Dev Handoff §7
    console.log(
      JSON.stringify({ event: 'story_generated', kind, latency_ms: Date.now() - t0 }),
    );

    return json({
      story_id: inserted.id,
      title,
      script_text: script,
      audio_url: audioUrl,
      modified: body.mode === 'modify',
    });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
