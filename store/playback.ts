import { useEffect } from 'react';
import { create } from 'zustand';

// Session-only playback state for the story player (Sora Prototype.dc.html).
// Real audio arrives with the ElevenLabs pipeline; progress is simulated at
// the prototype's rate until then.

export const STORY_DURATION = '03:12';
export const STORY_SECONDS = 192;
export const SPEEDS = [1, 1.25, 1.5, 0.75];

export const DEFAULT_TITLE = 'A quiet morning inside your own sunlit flat';
export const DEFAULT_CAPTION = 'The kettle exhales, and you do too.';
export const CUSTOM_CAPTION = "Close your eyes. You're already there.";

type PlaybackState = {
  title: string;
  isCustom: boolean;
  modified: boolean;
  playing: boolean;
  prog: number; // 0–100
  loop: boolean;
  speedIdx: number;
  fav: boolean;
  reading: boolean;
  open: (title?: string) => void;
  modify: (title: string) => void;
  togglePlay: () => void;
  setProg: (p: number) => void;
  toggleLoop: () => void;
  cycleSpeed: () => void;
  toggleFav: () => void;
  toggleRead: () => void;
  seek: (deltaPct: number) => void;
};

export const usePlayback = create<PlaybackState>()((set, get) => ({
  title: DEFAULT_TITLE,
  isCustom: false,
  modified: false,
  playing: false,
  prog: 14, // prototype resume point
  loop: false,
  speedIdx: 0,
  fav: true,
  reading: false,
  open: (title) =>
    set({
      title: title ?? DEFAULT_TITLE,
      isCustom: title != null,
      modified: false,
      playing: true,
      prog: title != null ? 0 : get().prog >= 100 ? 0 : get().prog,
      reading: false,
    }),
  // Modify re-renders the story: new title, restart, "Rewritten" badge.
  modify: (title) => set({ title, modified: true, prog: 0, playing: true, reading: false }),
  togglePlay: () => set({ playing: !get().playing }),
  setProg: (prog) => set({ prog }),
  toggleLoop: () => set({ loop: !get().loop }),
  cycleSpeed: () => set({ speedIdx: (get().speedIdx + 1) % SPEEDS.length }),
  toggleFav: () => set({ fav: !get().fav }),
  toggleRead: () => set({ reading: !get().reading }),
  seek: (deltaPct) => set({ prog: Math.min(100, Math.max(0, get().prog + deltaPct)) }),
}));

// Prototype tick: +0.55%·speed per 550ms while playing. Mounted once at the
// app shell so progress advances whether the player is foreground (full
// screen) or backgrounded (mini-player).
export function usePlaybackTick() {
  const playing = usePlayback((s) => s.playing);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const { prog, loop, speedIdx, setProg } = usePlayback.getState();
      let p = prog + 0.55 * SPEEDS[speedIdx];
      if (p >= 100) {
        if (loop) p = 0;
        else {
          usePlayback.setState({ prog: 100, playing: false });
          return;
        }
      }
      setProg(p);
    }, 550);
    return () => clearInterval(id);
  }, [playing]);
}
