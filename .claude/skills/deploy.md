---
name: deploy
description: How to deploy the web app (Vercel/Netlify) and build mobile via EAS
---

# Deploy

## Web (static site)

Build config is pre-set at the repo root:

- **Vercel:** Create `vercel.json` at root:
  ```json
  {
    "buildCommand": "npm run web:build",
    "outputDirectory": "apps/web/dist",
    "framework": null
  }
  ```
  Deploy: `vercel` (or push to the linked repo)

- **Netlify:** Create `netlify.toml` at root:
  ```toml
  [build]
    command = "npm run web:build"
    publish = "apps/web/dist"
  ```
  Deploy: `netlify deploy --prod` or push to the linked repo

### Environment Variables (Vercel/Netlify)

Add these in the hosting provider's dashboard (or CLI):

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_NVIDIA_NIM_URL=https://integrate.api.nvidia.com/v1/chat/completions
VITE_NVIDIA_NIM_API_KEY=xxx
```

### Local Production Build

Verify before deploying:

```bash
npm run web:build   # typecheck + Vite build -> apps/web/dist
```

Test the production build locally:

```bash
cd apps/web
npx vite preview    # serves the dist/ folder
```

---

## Mobile (EAS Build)

```bash
cd apps/mobile
npx eas build --platform android   # Android AAB
npx eas build --platform ios       # iOS IPA
npx eas build --platform all       # both
```

Requires an Expo account and `eas.json` configured at `apps/mobile/`.

**First-time setup:**

```bash
npx eas login
npx eas build:configure
```

**Distribute:**

- **Internal testing:** EAS distributes via a shareable link after build completes
- **App Store/Play Store:** Submit the built artifacts via `npx eas submit`

---

## Pre-Deploy Checklist

1. **Run all quality checks:**
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   ```

2. **Manual test web app:**
   - Test wheel interaction in all three languages (EN, ZH, JA)
   - Test AI chat: send a query, verify RAG retrieval + NVIDIA NIM response
   - Test split layout: resize browser to portrait/landscape, confirm correct orientation

3. **Manual test mobile app:**
   - Test in Expo Go (or simulator) before building production binary
   - Verify wheel gesture, selection, reveal flow in all three languages

4. **Verify environment variables are set** in Vercel/Netlify dashboard for production.

---

## Post-Deploy Verification

- **Web:** Visit the deployed URL, open browser DevTools, check for console errors
- **Mobile:** Install the built app on a physical device, test offline behavior (wheel works, chat requires network)
