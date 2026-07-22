import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Journal entries + proof-wall wins (Sora Prototype.dc.html demo data as the
// starting state; server truth arrives with the backend).

type Win = { t: string; d: string };

type JournalState = {
  gratitudes: string[];
  evid: string[];
  wins: Win[];
  addGratitude: (text: string) => void;
  addEvid: (text: string) => void;
  addWin: (text: string) => void;
};

export const useJournal = create<JournalState>()(
  persist(
    (set, get) => ({
      gratitudes: [
        'My health, holding steady',
        'Quiet mornings with coffee before the world wakes up',
      ],
      evid: [
        "A stranger complimented the studio's portfolio — felt like a sign",
        'The landlord emailed back first, for once',
      ],
      wins: [
        { t: 'Got the callback for the studio collab', d: 'Apr 12' },
        { t: 'Found the flat with the bay window', d: 'Mar 30' },
      ],
      addGratitude: (text) => set({ gratitudes: [text, ...get().gratitudes] }),
      addEvid: (text) => set({ evid: [text, ...get().evid] }),
      addWin: (text) => set({ wins: [{ t: text, d: 'Today' }, ...get().wins] }),
    }),
    {
      name: 'sora-journal',
      storage: createJSONStorage(() =>
        typeof window === 'undefined'
          ? { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} }
          : AsyncStorage,
      ),
      partialize: ({ addGratitude, addEvid, addWin, ...data }) => data,
    },
  ),
);
