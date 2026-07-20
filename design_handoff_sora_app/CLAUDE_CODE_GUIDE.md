# Build Sora with Claude Code — step by step

## 0. Setup (once, ~15 min)
1. Install: Node 20+, Git, Xcode (Mac) or just Expo Go app on your phone.
2. Install Claude Code: `npm install -g @anthropic-ai/claude-code`
3. Create the app:
   ```
   npx create-expo-app sora --template tabs
   cd sora
   ```
4. Copy this whole `design_handoff_sora_app/` folder into the repo root.
5. Start Claude Code inside the repo: `claude`

## 1. First prompt — set the ground rules
Paste this as your first message:

> Read design_handoff_sora_app/README.md fully. This is a React Native + Expo app.
> Create a CLAUDE.md capturing: the design tokens (colors, type, spacing, motion) as a theme.ts file spec, the file structure you'll use, and the rule that every screen must match the HTML reference files pixel-for-pixel at 390pt width. Newsreader italic for headlines, system sans for body. Never invent colors or copy — everything is in the handoff.

This makes every future session start with the rules loaded.

## 2. Build in this order (one prompt per step, test between each)
1. **Theme + shell**: "Build theme.ts from CLAUDE.md and the floating 5-tab bar (Home, Affirm, Vision, Progress, Profile) exactly as described in the README's Design Tokens section."
2. **Onboarding**: "Implement the 16-step onboarding from Sora Prototype.dc.html + Sora Quiz Onboarding UI.dc.html: typed steps, tap-quiz steps, mirror interstitials, personalizing screen. Store answers in a local store (zustand)."
3. **Paywall**: "Implement the paywall per Sora Paywall v2.dc.html — annual pre-selected, honesty timeline. Stub purchases behind a usePurchases() hook; we'll wire RevenueCat later."
4. **Progress tab**: "Implement Sora Progress UI v3.dc.html: seal ritual with glowPulse, variable reward, streak strip, goal momentum, signs timeline. Seal resets at local midnight."
5. **Player + Home**, then **Affirm deck**, then **Log a Sign**.
6. **Backend**: "Read §3–§4 of Sora Dev Handoff.dc.html (open it in a browser and paste the schema). Build a Supabase schema + an edge function that generates a story: context from memory_facts + signs → Claude API → ElevenLabs → store MP3 URL." (Do the pipeline EARLY — it's the make-or-break.)
7. **Wire RevenueCat**, notifications, small widget last.

## 3. The verification loop (do this every step)
- Run `npx expo start`, open on your phone.
- Open the matching .dc.html file in your browser next to it.
- Screenshot both, tell Claude Code: "Here's my screen vs the reference — fix these differences" (paste screenshots; Claude Code reads images).
- Commit when it matches: `git add -A && git commit -m "progress screen"`. Commit often — vibe coding without commits is gambling.

## 4. Prompting tips for this project
- One screen per session. Say `/clear` between screens so context stays sharp.
- Always name the reference file: "match Sora Affirm UI.dc.html" beats "make it pretty."
- When something looks off, paste the exact inline style from the HTML file — it's the truth.
- Don't let it "improve" the design. The copy, colors, and spacing are final.
- Keys/secrets (Anthropic, ElevenLabs, RevenueCat) go in .env, never in code — tell Claude Code this once and it'll respect it.

## 5. QA gates before you ship (from Sora Dev Handoff.dc.html §6)
Late daily story = P1. Voice change applies to old stories. Deleted memory facts vanish from next generation. Day-5 trial reminder fires. Cancel works in two taps. Test all five before TestFlight.
