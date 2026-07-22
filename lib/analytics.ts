// Belief-funnel analytics events — Sora Dev Handoff.dc.html §7, verbatim.
// Console stub until Amplitude/PostHog is wired. North-star metric:
// signs logged per user per week.

type Events = {
  onboarding_step_completed: { step: number };
  quiz_answer: { step: number; value: string };
  paywall_viewed: Record<string, never>;
  plan_selected: { plan: 'weekly' | 'annual' };
  trial_started: { plan: 'weekly' | 'annual' };
  trial_reminder_shown: Record<string, never>;
  trial_converted: { plan: 'weekly' | 'annual' };
  story_generated: { kind: string; latency_ms: number };
  story_played: { pct_completed: number };
  story_sealed_viewed: Record<string, never>;
  sign_logged: { source: 'seal' | 'journal' };
  win_logged: Record<string, never>;
  share_card_opened: Record<string, never>;
  share_completed: { channel: string; card_type: string };
  belief_plan_viewed: { day: number };
  progress_seal_tapped: { day: number };
  referral_sent: Record<string, never>;
  referral_redeemed: Record<string, never>;
  widget_added: { kind: string; surface: string };
  voice_changed: { to: string };
  voice_cloned: Record<string, never>;
  memory_fact_deleted: Record<string, never>;
};

export function track<E extends keyof Events>(event: E, props: Events[E]): void {
  if (__DEV__) {
    console.log(`[analytics] ${event}`, props);
  }
  // TODO: forward to Amplitude/PostHog once configured.
}
