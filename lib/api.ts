// Client for the generate-story edge function (supabase/functions/).
// Falls back to the demo story when Supabase env isn't configured, so the
// app keeps working before the backend is wired.

import { DEFAULT_TITLE } from '@/store/playback';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const backendConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export type Vision = { title: string; angle: string };

export type GeneratedStory = {
  story_id: string;
  title: string;
  script_text: string;
  audio_url: string | null;
  modified: boolean;
};

type GenerateBody =
  | { mode: 'daily_moment' }
  | { mode: 'visions'; compose_text: string }
  | { mode: 'on_demand'; compose_text: string; vision_title: string }
  | { mode: 'modify'; story_id: string; change_note: string };

async function callGenerate<T>(body: GenerateBody, accessToken: string): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-story`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    // Audio/story generation never fails silently (QA gate §6).
    const detail = await res.text();
    throw new Error(`generate-story ${res.status}: ${detail}`);
  }
  return (await res.json()) as T;
}

export async function generateVisions(
  composeText: string,
  accessToken: string,
): Promise<Vision[]> {
  if (!backendConfigured) {
    // Demo variants from the prototype until the backend is configured.
    return [
      { title: `The morning “${composeText}” was simply my life`, angle: 'Wake into it, already true' },
      { title: 'Six months on, it feels ordinary — in the best way', angle: 'The after, lived in' },
      { title: 'The moment I realized it had already begun', angle: 'The first undeniable sign' },
    ];
  }
  const { visions } = await callGenerate<{ visions: Vision[] }>(
    { mode: 'visions', compose_text: composeText },
    accessToken,
  );
  return visions;
}

export async function generateStory(
  body: GenerateBody,
  accessToken: string,
): Promise<GeneratedStory> {
  if (!backendConfigured) {
    return {
      story_id: 'demo',
      title: DEFAULT_TITLE,
      script_text: '',
      audio_url: null,
      modified: body.mode === 'modify',
    };
  }
  return callGenerate<GeneratedStory>(body, accessToken);
}
