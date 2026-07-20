// Sora design tokens — source of truth: design_handoff_sora_app/*.dc.html
// Screens import from here only; no color/spacing literals in screen files.

export const colors = {
  ink: '#2e2440',
  headline: '#3b2d54',
  muted: 'rgba(46,36,64,0.55)',
  mutedSoft: 'rgba(46,36,64,0.45)',
  primary: '#503a6b',
  primaryPressed: '#6b4a8c',
  amber: '#c98d3f',
  amberText: '#a8712c',
  green: '#3e7d5a',
  sheet: '#fbf5ee',
  hairline: 'rgba(46,36,64,0.09)',
  cardFill: 'rgba(255,255,255,0.5)',
  cardBorder: 'rgba(255,255,255,0.45)',
  white: '#ffffff',
} as const;

// CSS: linear-gradient(175deg, …) — stops at 0 / 0.55 / 1
export const gradients = {
  screen: {
    colors: ['#f7f0ee', '#eee0e4', '#e2d8e8'] as const,
    locations: [0, 0.55, 1] as const,
  },
  // 180deg — paywall story card, gift pass, plan hero; stops 0 / 0.52 / 1
  hero: {
    colors: ['#d8ab9e', '#b18ba8', '#6f5d8e'] as const,
    locations: [0, 0.52, 1] as const,
  },
  dark: {
    colors: ['#2a2140', '#4a3a66', '#8a6a8e'] as const,
    locations: [0, 0.5, 1] as const,
  },
  // The Orb — radial circle at 32% 28%; stops 0 / 0.30 / 0.60 / 1
  orb: {
    colors: ['#fff8ef', '#f6d9c8', '#dcc4ec', '#a9b8ee'] as const,
    locations: [0, 0.3, 0.6, 1] as const,
  },
} as const;

export const fonts = {
  // Headlines & emotional copy — Newsreader italic, weight 450–500
  serifItalic: 'Newsreader_500Medium_Italic',
  serifItalicLight: 'Newsreader_400Regular_Italic',
  serifMedium: 'Newsreader_500Medium', // upright — stat numerals, plan prices
  serif: 'Newsreader_400Regular', // upright body — story text, letter
  // Body/UI is system sans (SF Pro on iOS): leave fontFamily unset.
} as const;

export const type = {
  screenTitle: { fontFamily: fonts.serifItalic, fontSize: 28, color: colors.ink },
  eyebrow: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 2.4,
    textTransform: 'uppercase' as const,
    color: colors.muted,
  },
} as const;

export const shape = {
  cardRadius: 22, // range 20–26 per surface — check the reference file
  sheetRadius: 28,
  pill: 999,
} as const;

export const spacing = {
  screenX: 22, // prototype screens: padding 66px 22px 130px
  screenTop: 66,
  screenBottom: 130, // clears the floating tab bar
  section: 32,
} as const;

export const shadows = {
  primaryButton: {
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 6,
  },
  heroCard: {
    shadowColor: 'rgba(70,50,100,1)',
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 32,
    elevation: 8,
  },
  tabBar: {
    shadowColor: 'rgba(80,58,107,1)',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 32,
    elevation: 10,
  },
} as const;

export const motion = {
  fadeUp: { duration: 480, translateY: 10, staggerMs: 120 },
  glowPulse: { duration: 2400, ringPx: 10 },
  revealIn: { duration: 400, scaleFrom: 0.96 },
  breathe: { duration: 4500, scaleTo: 1.055 },
} as const;
