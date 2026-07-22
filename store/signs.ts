import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Logged signs — the core loop's input (Sora Log a Sign UI.dc.html). Kind
// chips feed the taxonomy for per-goal momentum (Dev Handoff §3).

export const SIGN_KINDS = [
  '✳ Coincidence',
  'Something arrived',
  'A feeling shifted',
  'Someone said it',
  'Progress I made',
];

export const SIGN_GOALS = [
  'The flat with the window seat',
  "Calm that doesn't crack",
  'The studio paying my rent',
];

export type Sign = { text: string; kind: number; goal: number; at: string };

type SignsState = {
  signs: Sign[];
  // Demo history from the references (Progress lists earlier signs); the
  // first logged sign is #4, matching the reference default.
  baseCount: number;
  log: (sign: Omit<Sign, 'at'>) => number; // returns the sign number
};

export const useSigns = create<SignsState>()(
  persist(
    (set, get) => ({
      signs: [],
      baseCount: 3,
      log: (sign) => {
        const signs = [...get().signs, { ...sign, at: new Date().toISOString() }];
        set({ signs });
        return get().baseCount + signs.length;
      },
    }),
    {
      name: 'sora-signs',
      storage: createJSONStorage(() =>
        typeof window === 'undefined'
          ? { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} }
          : AsyncStorage,
      ),
      partialize: ({ log, ...data }) => data,
    },
  ),
);
