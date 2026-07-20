import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Daily-rhythm reminders + trial timeline (Sora Prototype.dc.html Reminders
// sheet; Sora Notifications UI.dc.html cadence). The day-5 trial reminder is
// a product promise — see lib/notifications.ts.

export type ReminderId = 'morning' | 'moment' | 'evening';

export const REMINDERS: {
  id: ReminderId;
  t: string;
  d: string;
  time: string;
  hour: number;
  minute: number;
}[] = [
  { id: 'morning', t: 'Morning ritual', d: 'Rise into the day you chose', time: '7:15am', hour: 7, minute: 15 },
  { id: 'moment', t: "Today's Moment", d: 'The second your new story lands', time: '9:00am', hour: 9, minute: 0 },
  { id: 'evening', t: 'Wind-down + gratitude', d: 'Release the day, log three things', time: '9:30pm', hour: 21, minute: 30 },
];

type RemindersState = {
  rem: Record<ReminderId, boolean>;
  trialStartedAt: string | null; // ISO — set when the trial begins
  toggle: (id: ReminderId) => void;
  startTrial: () => void;
};

export const useReminders = create<RemindersState>()(
  persist(
    (set, get) => ({
      rem: { morning: true, moment: true, evening: false },
      trialStartedAt: null,
      toggle: (id) => set({ rem: { ...get().rem, [id]: !get().rem[id] } }),
      startTrial: () => set({ trialStartedAt: new Date().toISOString() }),
    }),
    {
      name: 'sora-reminders',
      storage: createJSONStorage(() =>
        typeof window === 'undefined'
          ? { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} }
          : AsyncStorage,
      ),
      partialize: ({ toggle, startTrial, ...data }) => data,
    },
  ),
);

export const remindersOnCount = (rem: Record<ReminderId, boolean>) =>
  Object.values(rem).filter(Boolean).length;
