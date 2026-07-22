import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Affirmation deck state (Sora Affirm UI.dc.html). Favorites feed the
// sleep-whisper playlist, so they persist.

export const AFFIRMATIONS = [
  "I already live in the flat with the window seat — my body just hasn't caught up yet.",
  'Calm is my default. Deadlines move around me, not through me.',
  'The studio pays my rent because people pay for what only I can make.',
  'I notice signs because I expect them. Expecting them is the practice.',
  "The version of me who has it all is not a stranger. She's a schedule.",
  'What I want is already en route. My job today is to stay recognizable to it.',
  'I am the kind of person good news looks for first.',
];

type AffirmState = {
  favs: Record<number, boolean>;
  sleep: boolean;
  toggleFav: (idx: number) => void;
  toggleSleep: () => void;
};

export const useAffirm = create<AffirmState>()(
  persist(
    (set, get) => ({
      favs: {},
      sleep: false,
      toggleFav: (idx) => set({ favs: { ...get().favs, [idx]: !get().favs[idx] } }),
      toggleSleep: () => set({ sleep: !get().sleep }),
    }),
    {
      name: 'sora-affirm',
      storage: createJSONStorage(() =>
        typeof window === 'undefined'
          ? { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} }
          : AsyncStorage,
      ),
      partialize: ({ toggleFav, toggleSleep, ...data }) => data,
    },
  ),
);
