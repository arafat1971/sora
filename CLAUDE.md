# Sora — Claude Code project rules

Sora is a manifestation app: personalized audio stories set in the user's real
life → user logs "signs" → signs feed the next story. React Native + Expo
(SDK 57, expo-router). The complete design handoff lives in
`design_handoff_sora_app/` — read its `README.md` before building anything.

## The one rule that overrides everything

Every screen must match its `.dc.html` reference file **pixel-for-pixel at
390pt width**. The HTML files are the source of truth: all styles are inline,
so every exact color, padding, radius, and font size is readable in the file
itself. Never invent colors, spacing, or copy — everything is in the handoff.
Do not "improve" the design; copy, colors, and spacing are final. The beige
"desk" background and annotations around each phone in the HTML files are
presentation chrome — build only the phone contents.

Reference file per screen is listed in `design_handoff_sora_app/README.md`
§"Screens / Views". Always open the named reference before coding a screen.

## Design tokens — `constants/theme.ts` (single source, no literals in screens)

```ts
export const colors = {
  ink: '#2e2440',            // body text
  headline: '#3b2d54',       // headline ink
  muted: 'rgba(46,36,64,0.55)',   // captions/labels use 0.45–0.6 alphas of ink
  primary: '#503a6b',        // buttons, active states, links
  primaryPressed: '#6b4a8c',
  amber: '#c98d3f',          // streaks, section eyebrows
  amberText: '#a8712c',      // amber text-on-light
  green: '#3e7d5a',          // positive / signs
  sheet: '#fbf5ee',          // bottom-sheet fill
  hairline: 'rgba(46,36,64,0.09)',        // editorial row dividers (0.08–0.1)
  cardFill: 'rgba(255,255,255,0.5)',
  cardBorder: 'rgba(255,255,255,0.45)',
};

export const gradients = {
  // 175deg — every standard screen background
  screen: ['#f7f0ee', '#eee0e4', '#e2d8e8'],        // stops 0 / 0.55 / 1
  // 180deg — paywall story card, gift pass, plan hero
  hero: ['#d8ab9e', '#b18ba8', '#6f5d8e'],          // stops 0 / 0.52 / 1
  // dark scene: lock screen, night
  dark: ['#2a2140', '#4a3a66', '#8a6a8e'],
  // The Orb (radial, circle at 32% 28%)
  orb: ['#fff8ef', '#f6d9c8', '#dcc4ec', '#a9b8ee'], // stops 0 / 0.30 / 0.60 / 1
};

export const type = {
  // Headlines & emotional copy: Newsreader ITALIC (Google font, bundled),
  // weight 450–500 → use Newsreader_500Medium_Italic.
  // Body/UI: system sans (SF Pro on iOS) — omit fontFamily.
  screenTitle: 28,      // Newsreader italic
  heroLine: [25, 30],   // Newsreader italic
  cardTitle: [15.5, 20],// Newsreader italic
  body: [13, 14],
  caption: [11, 12],
  eyebrow: { size: 11, weight: '600', letterSpacing: 2.4, uppercase: true }, // 10.5–11 / ls 2.2–2.6, muted ink
};

export const shape = {
  cardRadius: 22,        // cards 20–26
  sheetRadius: 28,       // bottom-sheet top corners, fill colors.sheet
  card: 'cardFill bg + 1px cardBorder',   // OR flat editorial rows: no card, 1px bottom hairline
  buttonShadow: '0 6px 18px rgba(80,58,107,0.22)',  // range 5–8px y, 14–22px blur, .2–.24
  heroShadow: '0 12px 32px rgba(70,50,100,0.13)',
};

export const spacing = {
  screenX: 24,           // screen padding 22–28
  section: 32,           // 30–36 between sections; sections open with an eyebrow
};

export const motion = {
  fadeUp:   { duration: 480, translateY: 10, stagger: [100, 300] }, // 0.4–0.55s ease, screen entry
  glowPulse:{ duration: 2400, ring: 10 },   // seal button idle, infinite
  revealIn: { duration: 400, scaleFrom: 0.96 },                     // reward reveal
  breathe:  { duration: 4500, scaleTo: 1.055 },                     // orb, infinite
  // Emotional pacing everywhere: 0.4–0.8s transitions, never snappy.
};
```

Tab bar (shell): floating 64px-tall pill, radius 32, `rgba(255,255,255,0.62)`
+ blur(18), 16px side margins, 24px from bottom. Active tab =
`rgba(80,58,107,0.12)` pill with primary icon/label. Exactly 5 tabs:
**Home · Affirm · Vision · Progress · Profile** (Journal is a text link, NOT a
tab). Primary buttons: full-radius pills, primary fill, white 14–15.5px/650.

## File structure

```
app/
  _layout.tsx            # root stack: fonts (Newsreader), onboarding gate, overlays
  (tabs)/_layout.tsx     # custom floating tab bar
  (tabs)/index.tsx       # Home
  (tabs)/affirm.tsx      # Affirm deck
  (tabs)/vision.tsx      # Vision board
  (tabs)/progress.tsx    # Progress (seal ritual)
  (tabs)/profile.tsx     # Profile
  onboarding.tsx         # 16-step flow → personalizing → paywall
  paywall.tsx
  player.tsx             # full-screen story player overlay
components/              # Orb, Screen (gradient bg), Eyebrow, PillButton, sheets…
constants/theme.ts       # ALL tokens above — screens import from here only
store/                   # zustand stores: onboarding answers, seal/streak, playback, favorites
lib/                     # api clients (Claude, ElevenLabs via Supabase edge fn), purchases stub
```

## Behavioral rules

- One screen per session; always name the reference `.dc.html` file.
- Quiz options/chips auto-advance; typed steps advance on Enter/arrow.
- All overlays are bottom sheets (radius 28, `#fbf5ee`, drag handle) except
  player / letter / welcome, which are full-screen.
- Seal state resets at **local midnight**. Paywall: annual pre-selected,
  weekly $6.99/wk, annual $49.99/yr ("$0.96/week"), CTA "Start 7 days free",
  "Cancel in two taps" copy stays.
- No image assets: orb, gradients, icons are code (gradients + inline SVG —
  copy `d` attributes from the HTML files).
- Keys/secrets (Anthropic, ElevenLabs, RevenueCat, Supabase) go in `.env`
  (gitignored), read via `process.env.EXPO_PUBLIC_*` or server-side. Never in
  code, never committed.
- Purchases behind a `usePurchases()` hook stub until RevenueCat is wired.
- Backend spec (data model, story pipeline, QA gates, analytics) is in
  `design_handoff_sora_app/Sora Dev Handoff.dc.html` §3–§7.

## Verification loop (every screen)

1. `npx expo start --web` (or device), screenshot at 390pt width.
2. Open the matching `.dc.html` reference in a browser; compare side by side.
3. Fix differences until it matches; then `git add -A && git commit`.

## QA gates before ship (Dev Handoff §6)

Late daily story = P1 · voice change applies to old stories · deleted memory
facts vanish from next generation · day-5 trial reminder fires · cancel works
in two taps.
