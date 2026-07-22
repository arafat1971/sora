import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Profile data: Sora's memory facts and My People (Sora Prototype.dc.html).
// Deleting a memory fact must exclude it from the next story generation
// (QA gate), so this persists.

type Person = { name: string; rel: string };

type ProfileState = {
  memory: string[];
  people: Person[];
  deleteMemory: (index: number) => void;
  addMemory: (text: string) => void;
  addPerson: (name: string, rel: string) => void;
};

export const useProfile = create<ProfileState>()(
  persist(
    (set, get) => ({
      memory: [
        'You prefer iced lattes over hot coffee',
        'Your mom is your anchor',
        "You're building a design studio of your own",
        'Peaceful mornings matter more to you than money',
      ],
      people: [{ name: 'Mom', rel: 'My anchor' }],
      deleteMemory: (index) => set({ memory: get().memory.filter((_, i) => i !== index) }),
      addMemory: (text) => set({ memory: [...get().memory, text] }),
      addPerson: (name, rel) =>
        set({ people: [...get().people, { name, rel: rel || 'Someone who matters' }] }),
    }),
    {
      name: 'sora-profile',
      storage: createJSONStorage(() =>
        typeof window === 'undefined'
          ? { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} }
          : AsyncStorage,
      ),
      partialize: ({ deleteMemory, addMemory, addPerson, ...data }) => data,
    },
  ),
);
