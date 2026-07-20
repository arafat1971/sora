# Sora backend (Supabase)

Implements Sora Dev Handoff.dc.html §3 (data model) and §4 (generation
pipeline). The client stays thin — all story/affirmation generation is
server-side.

## Setup

```sh
supabase init            # if not linked yet
supabase link --project-ref <ref>
supabase db push         # applies migrations/0001_init.sql

# Secrets — server-side only, never in the app bundle
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set ELEVENLABS_API_KEY=...
supabase secrets set ELEVENLABS_VOICE_NOVA=... ELEVENLABS_VOICE_WREN=... \
  ELEVENLABS_VOICE_ATLAS=... ELEVENLABS_VOICE_MARA=...

supabase functions deploy generate-story
```

Client env (`.env`, gitignored — see `.env.example`):

```
EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## Today's Moment cron (§4)

Per-user job at local 9:00am: schedule an hourly pg_cron tick that selects
users whose local time just passed 09:00 (`users.tz`) and don't have a
`daily_moment` story for their local today, then invokes the edge function
for each via `pg_net`:

```sql
select cron.schedule('daily-moments', '0 * * * *', $$
  select net.http_post(
    url := '<project-url>/functions/v1/generate-story',
    headers := jsonb_build_object('Authorization', 'Bearer ' || service_key, 'Content-Type', 'application/json'),
    body := jsonb_build_object('mode', 'daily_moment', 'user_id', u.id)
  )
  from public.users u
  where to_char(now() at time zone u.tz, 'HH24') = '09'
    and not exists (
      select 1 from public.stories s
      where s.user_id = u.id and s.kind = 'daily_moment'
        and (s.created_at at time zone u.tz)::date = (now() at time zone u.tz)::date
    );
$$);
```

A late daily story is a P1 (QA gate §6) — test DST boundaries in every
supported timezone.

## QA gates covered by the pipeline (§6)

- Deleted memory facts (`active = false` or row removed) are excluded from
  the very next generation — context assembly filters on `active`.
- Modify diff-checks against the original and the per-user `script_hash`
  unique index; a duplicate script regenerates once, then errors loudly.
- Voice change re-renders lazily: the client requests regeneration on next
  play when `stories.voice_id != users.voice_id`.
- TTS/storage failures return explicit error states — audio never fails
  silently; every play path in the client shows an error + retry.

## Analytics (§7)

Event names live in `lib/analytics.ts` (client) and the function logs
`story_generated(kind, latency_ms)`. Wire to Amplitude/PostHog +
RevenueCat webhooks. North-star: signs logged per user per week.
