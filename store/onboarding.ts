import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Answers become memory facts for story generation (Dev Handoff §3).
export type OnboardingAnswers = {
  name: string;
  city: string;
  want: string;
  wantAge: string; // quiz
  doubt: string; // quiz
  work: string;
  why: string;
  struggle: string;
  ritual: string; // quiz
  success: string;
  areas: string[]; // multi chips
  people: string;
  home: string; // chip pick
  homeText: string; // free-text override — "Your words always win."
  voice: string;
};

type OnboardingState = OnboardingAnswers & {
  completed: boolean;
  hydrated: boolean;
  setAnswer: <K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => void;
  toggleArea: (area: string) => void;
  complete: () => void;
  reset: () => void;
};

// Expo Router statically renders routes in Node, where AsyncStorage's web
// backend (window.localStorage) doesn't exist — no-op storage on the server.
const noopStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

const initialAnswers: OnboardingAnswers = {
  name: '',
  city: '',
  want: '',
  wantAge: '',
  doubt: '',
  work: '',
  why: '',
  struggle: '',
  ritual: '',
  success: '',
  areas: [],
  people: '',
  home: '',
  homeText: '',
  voice: 'Nova',
};

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialAnswers,
      completed: false,
      hydrated: false,
      setAnswer: (key, value) => set({ [key]: value }),
      toggleArea: (area) => {
        const { areas } = get();
        set({
          areas: areas.includes(area) ? areas.filter((a) => a !== area) : [...areas, area],
        });
      },
      complete: () => set({ completed: true }),
      reset: () => set({ ...initialAnswers, completed: false }),
    }),
    {
      name: 'sora-onboarding',
      storage: createJSONStorage(() =>
        typeof window === 'undefined' ? noopStorage : AsyncStorage,
      ),
      partialize: ({ setAnswer, toggleArea, complete, reset, hydrated, ...data }) => data,
      onRehydrateStorage: () => () => {
        useOnboarding.setState({ hydrated: true });
      },
    },
  ),
);
