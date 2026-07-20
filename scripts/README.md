# Verification loop tooling

Screenshot the running app and the `.dc.html` references headlessly so screens
can be compared side by side (CLAUDE.md §Verification loop).

Setup (once per environment):

```sh
cd scripts
npm install          # playwright-core
npm run fetch-libs   # packs react/react-dom/babel UMDs the .dc.html runtime needs
```

Usage:

```sh
# 1. App: run `npx expo start --web --port 8090` in the repo root, then
node scripts/app-shot.js http://localhost:8090 /tmp/app.png

# 2. Reference: serve the repo root (`python3 -m http.server 8099`), then
node scripts/ref-shot.js 'http://localhost:8099/Sora%20Prototype.dc.html' /tmp/ref.png 'The app'
```

The third argument to `ref-shot.js` is optional button text to click after load
(e.g. the prototype's "The app" / "Paywall" / "Onboarding" jump buttons, or a
tab label). Both scripts render at 390×844 pt, 2× scale. `ref-shot.js` serves
the unpkg React/Babel requests from the locally packed copies because the
sandbox proxy blocks unpkg.
