import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { REMINDERS, ReminderId } from '@/store/reminders';

// Local notification scheduling — Sora Dev Handoff §5 + Sora Notifications
// UI.dc.html. Pushes speak in the story's future-you voice, never
// app-marketing voice; proof, not pressure; max 3/day. The day-5 trial
// reminder is a contractual product promise (QA gate §6).
//
// No-ops on web (expo-notifications has no web scheduler).

const RITUAL_COPY: Record<ReminderId, { title: string; body: string }> = {
  morning: {
    title: 'Sora',
    body: 'Future you left a note about the morning you chose — 40 seconds, before the day starts.',
  },
  moment: {
    title: 'Sora',
    body: "Today's Moment is ready — new, on time, 03:12.",
  },
  evening: {
    title: 'Sora',
    body: 'Three minutes of release before sleep, then log three things you noticed.',
  },
};

const TRIAL_REMINDER_ID = 'trial-day-5';

export async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

// Reschedule the enabled daily rituals from scratch (idempotent).
export async function syncRitualReminders(rem: Record<ReminderId, boolean>): Promise<void> {
  if (Platform.OS === 'web') return;
  if (!(await ensurePermission())) return;

  // Clear existing ritual schedules, then re-add the enabled ones.
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => typeof n.identifier === 'string' && n.identifier.startsWith('ritual-'))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );

  for (const r of REMINDERS) {
    if (!rem[r.id]) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: `ritual-${r.id}`,
      content: RITUAL_COPY[r.id],
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: r.hour,
        minute: r.minute,
      },
    });
  }
}

// Day-5 trial reminder — fires ~2 days before the 7-day trial ends. A late or
// missing reminder breaks the entire trust positioning, so this is a P-level
// promise, not a nicety.
export async function scheduleTrialReminder(trialStartedAt: string): Promise<void> {
  if (Platform.OS === 'web') return;
  if (!(await ensurePermission())) return;

  await Notifications.cancelScheduledNotificationAsync(TRIAL_REMINDER_ID).catch(() => {});

  const fireAt = new Date(trialStartedAt);
  fireAt.setDate(fireAt.getDate() + 5); // day 5 of 7
  fireAt.setHours(10, 0, 0, 0);
  if (fireAt.getTime() <= Date.now()) return; // window passed — nothing to schedule

  await Notifications.scheduleNotificationAsync({
    identifier: TRIAL_REMINDER_ID,
    content: {
      title: 'Sora',
      body: 'As promised: your trial ends in 2 days. No surprises — choose what happens next, or cancel in two taps.',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
  });
}
