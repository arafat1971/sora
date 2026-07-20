# Handoff: Sora — Manifestation App (full MVP)

## Overview
Sora is a manifestation app whose differentiator is a closed evidence loop: personalized audio "stories" set in the user's real life → user logs "signs" that the story is coming true → signs are written into the next story. Retention is driven by a daily one-tap "seal" ritual with variable rewards; monetization is a trust-first 7-day trial anchored to an annual plan.

This bundle is the complete design for the MVP plus growth surfaces, with an implementation-priority order at the end.

## About the Design Files
The `.dc.html` files in this bundle are **design references created in HTML** — interactive prototypes showing intended look and behavior, NOT production code to copy. Your task is to **recreate these designs in your target framework**. Open any `.dc.html` file directly in a browser to interact with it (keep `support.js` and `ios-frame.jsx` next to them). All styles are inline in the HTML, so every exact value (color, padding, radius, font size) is readable in the file itself — treat the files as the source of truth wherever this README summarizes.

### Framework recommendation (for a solo builder using Claude Code)
**React Native + Expo** over Flutter:
- Claude is strongest in TypeScript/React; you'll get better generated code, faster.
- Expo gives you push notifications, IAP (via RevenueCat SDK), audio playback (`expo-av`), widgets (via config plugins), and OTA updates without native build pain.
- The design uses soft gradients, blur, and a floating tab bar — all straightforward with `expo-linear-gradient`, `expo-blur`, and a custom tab bar.
Start: `npx create-expo-app sora --template tabs`, then add RevenueCat, expo-av, expo-notifications. Build screen-by-screen against the HTML references.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy, and interactions are final. Recreate pixel-perfectly. All app screens are designed at 390–402pt width (iPhone). The beige "desk" background and annotation text AROUND each phone in the files is presentation chrome — do not build it; only the phone contents.

## Design Tokens

Colors:
- Ink (body text): `#2e2440`
- Headline ink: `#3b2d54`
- Muted text: `rgba(46,36,64,0.55)` — captions/labels use 0.45–0.6 alphas of the same ink
- Primary (buttons, active states, links): `#503a6b` (hover/pressed `#6b4a8c`)
- Amber (streaks, section eyebrows): `#c98d3f`, text-on-light variant `#a8712c`
- Green (positive/signs): `#3e7d5a`
- Screen background: linear-gradient 175deg, `#f7f0ee` → `#eee0e4` (55%) → `#e2d8e8`
- Hero/card gradient (paywall story card, gift pass, plan hero): 180deg `#d8ab9e` → `#b18ba8` (52%) → `#6f5d8e`
- Dark scene (lock screen, night): `#2a2140` → `#4a3a66` → `#8a6a8e`
- The Orb (recurring brand element): radial-gradient circle at 32% 28%, `#fff8ef` → `#f6d9c8` (30%) → `#dcc4ec` (60%) → `#a9b8ee`

Typography:
- Headlines/emotional copy: **Newsreader** (Google Fonts), italic, weight 450–500. Sizes: screen title 28px, hero lines 25–30px, card titles 15.5–20px.
- Body/UI: system sans (SF Pro on iOS). Body 13–14px, captions 11–12px.
- Eyebrow labels: 10.5–11px, weight 600, letter-spacing 2.2–2.6px, uppercase, muted ink.

Surfaces & shape:
- Cards: `rgba(255,255,255,0.5)` fill, 1px `rgba(255,255,255,0.45)` border, radius 20–26px. Many lists are flat "editorial" rows instead: no card, 1px bottom hairline `rgba(46,36,64,0.08–0.1)`.
- Floating tab bar: 64px tall pill (radius 32), `rgba(255,255,255,0.62)` + blur(18px), 16px side margins, 24px from bottom. Active tab: `rgba(80,58,107,0.12)` pill, primary-color icon/label. 5 tabs: Home · Affirm · Vision · Progress · Profile (Journal is a text link, not a tab).
- Primary buttons: full-radius pills, `#503a6b` fill, white 14–15.5px/650 text, shadow `0 5–8px 14–22px rgba(80,58,107,0.2–0.24)`.
- Shadows on hero cards: `0 12px 32px rgba(70,50,100,0.13)`.
- Spacing rhythm: 22–28px screen padding; 30–36px between sections; sections open with an uppercase eyebrow label.

Motion:
- `fadeUp`: opacity 0→1 + translateY(10px→0), 0.4–0.55s ease, staggered 0.1–0.3s on screen entry.
- `glowPulse` (seal button idle): box-shadow ring 0→10px fading, 2.4s infinite.
- `revealIn`: scale 0.96→1 + fade, 0.4s (reward reveal).
- `breathe` (orb): scale 1→1.055, 4–5s infinite.
- Emotional pacing everywhere: 0.4–0.8s transitions, never snappy.

## Screens / Views

Reference file per screen; every measurement is in the file's inline styles.

1. **Onboarding — `Sora Prototype.dc.html` (start of flow) + `Sora Quiz Onboarding UI.dc.html`**
   16 mixed steps, one question per screen, thin progress bar + back chevron on top. Question text types on (typewriter + cursor). Step types: typed input (pill input + circular submit arrow), tap-quiz (full-width hairline rows with a small dot, auto-advance on tap), mirror interstitial (breathing orb + line that reads the user's answer back + "Keep going"), belief-stats interstitial, chips (multi for life areas, single+free-text for home), voice picker with audio preview rows. Quiz answers become memory facts. Ends in a 3-message "personalizing" screen (~4s) → paywall.

2. **Paywall — in `Sora Prototype.dc.html` + `Sora Paywall v2.dc.html`**
   "Your first story is ready, {name}." → story-behind-glass card (hero gradient, orb, first line of THEIR story, locked) → 1-5-7 honesty timeline (Today unlock / Day-5 reminder / Day-7 billed) → weekly vs annual plan cards, ANNUAL pre-selected with "MOST CHOOSE THIS" badge; weekly $6.99/wk, annual $49.99/yr ("$0.96/week"). Footnote and timeline billing line follow the selection. CTA "Start 7 days free". "Cancel in two taps" is printed copy — keep it.

3. **Home — in `Sora Prototype.dc.html`**
   Greeting, live wins ticker, manifest composer + trending chips, Today's Moment story card + countdown, rituals row, future-self letter, Manifesting-now goal list (+ new-goal sheet), recently played, library link.

4. **Story player — in `Sora Prototype.dc.html` (overlay)**
   Breathing orb, karaoke caption (words warm as spoken), scrubber, speed/loop, voice sheet (change re-renders ALL stories), Modify sheet (regenerates + "Rewritten" badge), share. End-of-story "It is done" seal → log a sign or share. Mini-player pill (58px dark pill above tab bar) when backgrounded.

5. **Affirm — `Sora Affirm UI.dc.html`**
   Swipeable numbered card deck (drag + chevrons), per-card backdrop tint, favorite hearts, spoken audio, sleep-whisper moon mode (favorites loop 8hrs).

6. **Progress — `Sora Progress UI v3.dc.html`** (canonical; also merged in prototype)
   Top: "DAY n OF 14" + streak label. Seal ritual: 120px orb-gradient circle button "HOLD TODAY" with glowPulse → on tap becomes checkmark + "TODAY SORA NOTICED" variable reward line (4+ rotating insights, "Read another" re-roll). Streak strip of 7 dots between hairlines. Then flat editorial sections: Goal momentum (title + status chip SURGING/STEADY/WARMING UP + 2px progress line amber→mauve + sessions/signs counts), Signs timeline (green dot rows), Investment row ("Add one detail from today" + plus button). Seal state resets at local midnight.

7. **Log a Sign — `Sora Log a Sign UI.dc.html`**
   Bottom-sheet entry (what happened, which goal) → confirmation that it's "written into tomorrow's story."

8. **Vision / Journal / Profile — in `Sora Prototype.dc.html`**
   Vision: board + proof wall + Circle link. Journal: gratitude + signs segments. Profile: editable Memory list (deleting a fact excludes it from next generation), basics, voice + name pronunciation, My People, daily rhythm (reminders + widgets), referral card, subscription management.

9. **Circle — `Sora Circle UI.dc.html`** — anonymized community proof wall (post-MVP).

10. **Referral — `Sora Referral UI.dc.html`**
    "Gift 7 Days" pass: hero-gradient gift card carrying sender's first name + "NO CARD NEEDED", send CTA, 3 perk rows, sent-gift status list (WAITING amber / ON HER PLAN green). Both sides earn a month on subscribe.

11. **Widgets — `Sora Widgets UI.dc.html`**
    Lock-screen inline widget (today's story line, rotates at dawn), small home widget (affirmation + "DAY n · HELD"), medium widget (streak dots + one-tap HOLD seal deep-linking into Progress). Small = free tier, medium = paid.

12. **Notifications — `Sora Notifications UI.dc.html`** — four lock-screen moments in future-you voice + copy rules.

## Interactions & Behavior
- Quiz options and chips auto-advance; typed steps advance on Enter or arrow button.
- Seal tap: instant state change + reward reveal (revealIn, 0.15s stagger); reward text randomizes from a pool referencing the user's actual data.
- Plan cards: 1.5px border `#503a6b` + `rgba(80,58,107,0.08)` fill when selected.
- Affirm deck: horizontal drag with spring-back, swipe threshold advances card.
- All overlays are bottom sheets (radius 28 top corners, `#fbf5ee` fill, drag handle) except player/letter/welcome which are full-screen.
- Toasts: brief confirmations for referral copy, trial cancel, etc.

## State Management
Client state: onboarding answers, selected plan, seal/streak state, current story + playback position, favorites, sign drafts. Server truth: users, memory_facts, goals, stories, affirmations, journal_entries, streaks, subscriptions (RevenueCat webhooks). **Full data model, LLM→TTS generation pipeline, QA gates, and analytics event list are in `Sora Dev Handoff.dc.html` — open it in a browser and implement §3–§7 as written.**

## Assets
No image assets. The orb, gradients, and all iconography are code (CSS gradients + inline SVG paths — copy the `d` attributes from the files). Font: Newsreader from Google Fonts (bundle it in-app).

## Files
- `Sora Prototype.dc.html` — full wired flow: onboarding → paywall → 5-tab app + all overlays (primary reference)
- `Sora Quiz Onboarding UI.dc.html`, `Sora Paywall v2.dc.html`, `Sora Affirm UI.dc.html`, `Sora Progress UI v3.dc.html`, `Sora Log a Sign UI.dc.html`, `Sora Share Card UI.dc.html`, `Sora Circle UI.dc.html`, `Sora Notifications UI.dc.html`, `Sora Referral UI.dc.html`, `Sora Widgets UI.dc.html` — canonical per-surface designs
- `Sora Dev Handoff.dc.html` — architecture, data model, pipeline, QA gates, analytics
- `Sora Launch Roadmap.dc.html` — phases, gates, milestones
- `support.js`, `ios-frame.jsx` — runtime for viewing the files; ignore for implementation

## Build order (MVP scope — weeks 4–12 of the roadmap)
1. Story pipeline prototype FIRST (LLM → ElevenLabs → playable audio) — no UI until this gives chills
2. Onboarding (16 steps) → personalizing → paywall (RevenueCat, annual default)
3. Home (trimmed: greeting, Today's Moment, goals) + player
4. Progress (seal ritual + streak) + Log a Sign
5. Affirm deck + small widget + notifications
6. CUT from v1: Circle, referral, Android, medium widget, share cards
