import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Manifesting-now goals (Home) — each goal is its own story thread
// (Sora Prototype.dc.html). Demo seed until the backend drives them.

export type Goal = { t: string; n: string; p: number };

export const GOAL_AREAS = ['Love', 'Career', 'Money', 'Health', 'Inner peace', 'Freedom'];

type GoalsState = {
  goals: Goal[];
  addGoal: (title: string) => void;
};

export const useGoals = create<GoalsState>()(
  persist(
    (set, get) => ({
      goals: [
        { t: 'Inner peace that stays', n: '7 stories', p: 64 },
        { t: 'The studio takes off', n: '5 stories', p: 40 },
        { t: 'A home that feels like me', n: '4 stories', p: 28 },
      ],
      addGoal: (title) =>
        set({ goals: [{ t: title, n: '1 story tonight', p: 4 }, ...get().goals] }),
    }),
    {
      name: 'sora-goals',
      storage: createJSONStorage(() =>
        typeof window === 'undefined'
          ? { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} }
          : AsyncStorage,
      ),
      partialize: ({ addGoal, ...data }) => data,
    },
  ),
);
