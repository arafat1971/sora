import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Daily seal ritual state (Sora Progress UI v3.dc.html). The seal "resets at
// local midnight": sealed-ness is derived by comparing the stored local date
// key to today's, so it expires on its own when the date rolls over.

export function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const REWARDS = [
  "You've opened Sora before 8am four days straight — belief is becoming a reflex, not an effort.",
  'Your last two signs both mention the flat. The story is converging on one address.',
  "You replayed Tuesday's story three times. That scene matters — tomorrow leans into it.",
  "Members who log a sign by day 6 are 3× more likely to write 'it happened.' You did it on day 4.",
];

type SealState = {
  sealedDate: string | null;
  investedDate: string | null;
  rewardIdx: number;
  streak: number;
  planDay: number;
  hydrated: boolean;
  seal: () => void;
  reroll: () => void;
  invest: () => void;
};

export const useSeal = create<SealState>()(
  persist(
    (set, get) => ({
      sealedDate: null,
      investedDate: null,
      rewardIdx: 0,
      // Demo values from the reference (streak 6, day 6 of 14) until the
      // backend drives them (Dev Handoff §3).
      streak: 6,
      planDay: 6,
      hydrated: false,
      seal: () => {
        const today = localDateKey();
        if (get().sealedDate === today) return;
        set({
          sealedDate: today,
          streak: get().streak + 1,
          rewardIdx: Math.floor(Math.random() * REWARDS.length),
        });
      },
      reroll: () => set({ rewardIdx: (get().rewardIdx + 1) % REWARDS.length }),
      invest: () => set({ investedDate: localDateKey() }),
    }),
    {
      name: 'sora-seal',
      storage: createJSONStorage(() =>
        typeof window === 'undefined'
          ? { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} }
          : AsyncStorage,
      ),
      partialize: ({ seal, reroll, invest, hydrated, ...data }) => data,
      onRehydrateStorage: () => () => {
        useSeal.setState({ hydrated: true });
      },
    },
  ),
);

// Selectors — sealed/invested state expires at local midnight automatically.
export const isSealedToday = (s: SealState) => s.sealedDate === localDateKey();
export const isInvestedToday = (s: SealState) => s.investedDate === localDateKey();
