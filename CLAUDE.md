# CLAUDE.md — Iron Bear waitlist site

This is the public waitlist site for Iron Bear (the coaching platform).
Single-page Vite + React + TypeScript app, deployed to Vercel or Netlify,
backed by a tiny Supabase project that stores both the waitlist signups
and the self-hosted telemetry events.

This file is the source of truth for anyone — human or AI agent — entering
the repo.

---

## What this is (and isn't)

**Is**: a hype-forward, conversion-focused waitlist landing page with two
audiences (coaches, individual lifters), a 3-step form (role → email/name →
hype question), graceful Supabase failure handling, and 100% self-hosted
telemetry into Supabase.

**Isn't**: the Iron Bear app. The app lives at `/home/daniel/repos/ironbear`
(Flutter + Firebase). This site reuses the brand mascots and tokens but is
otherwise independent.

---

## Quick start

```bash
cd /home/daniel/repos/ironbear-site
cp .env.example .env.local       # then fill in your Supabase URL + anon key
npm install
npm run dev                      # http://localhost:5173
```

To build for production:

```bash
npm run build                    # outputs to dist/
npm run preview                  # serve dist/ locally
```

Type check only:

```bash
npm run typecheck
```

---

## Architecture map

```
ironbear-site/
  CLAUDE.md                       ← this file
  README.md                       ← thin pointer to CLAUDE.md
  index.html                      ← HTML entry, Google Fonts, OG tags
  package.json
  vite.config.ts
  tsconfig.json
  .env.example                    ← copy to .env.local
  schema/
    supabase.sql                  ← runnable in Supabase SQL editor
  public/
    mascots/                      ← 13 PNGs, copied from ironbear/design/images/
  src/
    main.tsx                      ← React entry; applies theme before paint
    App.tsx                       ← composes sections, wires role state
    styles/
      tokens.css                  ← --ib-* tokens (light + dark)
      app.css                     ← page-level layout, components, animations
    sections/                     ← page sections, top-to-bottom
      TopBar.tsx
      Hero.tsx
      TwoPaths.tsx
      Hype.tsx
      HowItWorks.tsx
      Waitlist.tsx                ← 3-step form, success/error views
      FAQ.tsx
      Footer.tsx
    components/                   ← reusable UI primitives
      Logo.tsx
      Mascot.tsx
      RoleToggle.tsx
      LiveCount.tsx
      Counter.tsx                 ← scroll-triggered number ticker
      Marquee.tsx
      BarbellGrid.tsx             ← inline-SVG hero backdrop
      ConfettiKettlebells.tsx
      StepDots.tsx
      ErrorBoundary.tsx
      ThemeToggle.tsx
    lib/                          ← framework-free logic
      supabase.ts                 ← singleton client + healthcheck
      telemetry.ts                ← session, batched event queue, auto-instrument
      retryQueue.ts               ← localStorage queue for failed inserts
      utm.ts                      ← UTM + referrer capture
      device.ts                   ← mobile/desktop heuristic
      uuid.ts
    hooks/
      useFormTelemetry.ts
      useScrollDepth.ts
      useReducedMotion.ts
      useInView.ts
    data/
      quotes.ts                   ← hype ticker quotes (mocked)
      stats.ts                    ← hype strip numbers (mocked)
    schema-types/
      waitlist.ts                 ← Zod schemas + Role type
```

**Boundaries**:
- `lib/` is framework-free TypeScript. Don't import React there.
- `hooks/` and `components/` may import `lib/`.
- `sections/` import everything below them.
- `data/` is content. Edit freely; it ships at build time.

---

## Design tokens (the only colors and types you should use)

All colors live in `src/styles/tokens.css` as `--ib-*` custom properties.
**Don't put raw hex values in components.** If a token doesn't exist for what
you need, add it to `tokens.css` first.

### Light theme

| Token | Hex | Use |
|---|---|---|
| `--ib-bg` | `#F7F5F1` | Page background — warm parchment |
| `--ib-surface` | `#FFFFFF` | Cards |
| `--ib-surface-2` | `#FAF8F4` | Subtle alt surface |
| `--ib-surface-3` | `#EEEAE2` | Mascot frame, role-toggle track |
| `--ib-text` | `#17120C` | Heading ink |
| `--ib-text-muted` | `#5C5244` | Body |
| `--ib-text-soft` | `#8B7E6D` | Captions, helper text |
| `--ib-border` | `#E5DFD3` | Hairlines |
| `--ib-border-2` | `#CFC7B8` | Slightly stronger borders |
| `--ib-primary` | `#F59221` | All CTAs, links, focus rings |
| `--ib-primary-2` | `#FFA940` | Highlight gradient stop |
| `--ib-primary-ink` | `#1A1005` | Ink on primary |
| `--ib-primary-soft` | `rgba(245,146,33,0.12)` | Tint, chip background |
| `--ib-success` | `#2FB573` | Validation OK chips |
| `--ib-danger` | `#D9523B` | Validation errors |
| `--ib-navy` | `#1E2A3A` | Hype strip background |
| `--ib-gold` | `#E5B04B` | Celebrations only |

### Dark theme — premium graphite
Triggered by `data-ib-theme="dark"` on `<html>` (set by `ThemeToggle`).
Surfaces: `#0B0C0E / #14161A / #1B1E23 / #24282F`.
Text: `#F2F4F7 / #A6ADB8 / #6E7480`.
Borders: `#262A31 / #3A3F48`.

### Typography

| Use | Family | Weight | Size |
|---|---|---|---|
| Hero display | Inter | 900 | `clamp(46px, 8.4vw, 96px)` |
| Section title | Inter | 800 | `clamp(30px, 4vw, 52px)` |
| Body | Inter | 400/500 | 15–18px |
| Eyebrow | Roboto Mono | 700 | 11px tracked |
| Numerals (counters, queue, stats) | Roboto Mono | 800 | tabular-nums |

Fonts load from Google Fonts in `index.html`.

### Motion

- Routine transitions: 220–320ms ease-out.
- Spring (Framer Motion): `{ stiffness: 260, damping: 24 }` for the role
  toggle and form step transitions.
- `prefers-reduced-motion: reduce` strips: hero stagger, mascot breathing,
  plate orbit, floating chips, marquee, confetti, hype quote rotation,
  number counters, role-pill spring.

---

## Component contract

| File | Purpose | Notable props |
|---|---|---|
| `Logo` | Brand logo, badge + wordmark with a primary "B" underline | `size?`, `showWordmark?` |
| `Mascot` | Wraps `<img>` with lazy-load + sizing | `src`, `size?` |
| `RoleToggle` | Pill-style role chooser with shared-element spring | `value`, `onChange` |
| `LiveCount` | Hero "n coaches · m lifters" line, sourced from `v_waitlist_counts` | — |
| `Counter` | Scroll-triggered number ticker | `to`, `format?`, `durationMs?` |
| `Marquee` | Infinite horizontal text scroller | `items` |
| `BarbellGrid` | Inline-SVG repeating barbell pattern | — |
| `ConfettiKettlebells` | 30 emoji confetti, fires on success | `fire` |
| `StepDots` | Form step indicator | `current`, `total` |
| `ErrorBoundary` | Section-scoped error boundary with custom fallback | `fallback`, `children` |
| `ThemeToggle` | Light/dark switcher; persists to `localStorage('ib-theme')` | — |

---

## Telemetry contract

All events go to the Supabase `events` table. Every metric the team needs
is **derived in SQL** from the raw event stream — clients never compute or
emit derived metrics like conversion rate.

### Events emitted

| Event | When | Properties |
|---|---|---|
| `visit` | First mount of a session | `path`, `referrer`, `utm`, `device`, `viewport_w/h` |
| `scroll_depth` | Crossing 25 / 50 / 75 / 100% of page height | `depth` |
| `cta_click` | Click on `[data-track="cta:<id>"]` | `cta_id`, `count_in_session` |
| `repeated_cta` | 2nd+ click of same CTA in session | `cta_id`, `count_in_session` |
| `form_started` | First focus on any form field | `role` (if known) |
| `form_step` | Step transition | `from_step`, `to_step` |
| `form_field_focus` | Field focus | `field` |
| `form_field_blur` | Field blur | `field`, `value_length`, `valid` |
| `form_field_change` | Debounced change | `field`, `value_length` |
| `form_abandoned` | `pagehide` after start, before submit | `last_step`, `ms_in_form` |
| `form_submitted` | Successful Supabase insert | `role`, `time_to_submit_ms` |
| `form_submit_error` | Insert failed | `reason` |

### PII rule (non-negotiable)

- The raw email is **only** stored in `waitlist`. Never in `events`.
- `form_field_change` and `form_field_blur` record `value_length`, never the value.
- UTM and referrer values are truncated (≤200 chars) before being stored.

### Adding a new event

1. Add the event name to the `EventName` union in `src/lib/telemetry.ts`.
2. Call `track('your_event', { ... })` from the relevant hook/component.
3. Document it in this table.

For a new clickable CTA, just add `data-track="cta:<unique-id>"` to the
element — the global click handler in `telemetry.ts` picks it up
automatically and computes `count_in_session` and `repeated_cta`.

### Transport

Events queue in memory, flush every 2s in batches of up to 25 via `fetch`
with `keepalive: true`. On `pagehide` / `visibilitychange:hidden` we flush
once more. **Telemetry must never block UX**: if a flush fails it's dropped.

---

## Reliability contract (waitlist insert)

Submitting the waitlist form must never crash the page or leave the user
hanging. The contract:

1. Insert call is wrapped in `withTimeout(p, 8000)`.
2. On success → success view.
3. On failure (network, Supabase down, timeout, render-time error) → the
   payload is `enqueue()`d to `localStorage` and the form swaps to the
   "Signups are taking a breather" warning view. The page never collapses.
4. On next mount, `flushPending()` retries silently. Duplicates are absorbed
   by the Supabase unique-email constraint (error code `23505`).
5. A healthcheck on mount preemptively renders the warning if Supabase is
   unreachable — saves a wasted submit attempt.
6. The whole `<Waitlist />` form is wrapped in an `<ErrorBoundary>` with a
   fallback that mirrors the warning view, so a render crash also degrades
   gracefully.

The retry queue lives at `localStorage['iron-bear-waitlist-pending']` as an
array of `WaitlistPayload`s. It's manually inspectable in DevTools.

---

## Supabase setup — full step-by-step

This site needs exactly two tables and one public-readable view. The full
schema (idempotent) lives at `schema/supabase.sql`.

### Step 1. Create a Supabase project
1. Go to https://supabase.com → **New project**.
2. Name it (e.g., `ironbear-site`). Pick a region close to your audience.
3. Save the database password in your password manager.
4. Wait ~1 minute for provisioning.

### Step 2. Get the project URL and anon key
1. In the project dashboard → **Project Settings → API**.
2. Copy the **Project URL** and the **anon / public** key.
3. *Never* commit the **service_role** key — it bypasses RLS.

### Step 3. Run the schema
1. Dashboard → **SQL Editor → New query**.
2. Paste the entire contents of `schema/supabase.sql`.
3. Click **Run**.
4. The script is idempotent; safe to run again after edits.

What that creates:
- `waitlist` table (email, role, optional first name, hype answer, UTMs, device, time-to-submit).
- `events` table (session_id, event_name, properties JSONB, UTM, viewport, device).
- Indexes on hot lookup columns.
- RLS enabled on both tables. **Anon-role policy: insert only**, no select / update / delete.
- Public view `v_waitlist_counts` (aggregated counts per role, exposed to anon so the hero can show "n coaches · m lifters" without leaking PII).
- Read-only analytics views (`v_funnel`, `v_conversion`, `v_drop_off`, `v_repeated_cta`, `v_device_split`, `v_scroll_depth`, `v_utm_quality`) — readable in the SQL editor or via service_role, **not** granted to anon.

### Step 4. Wire the env vars
```bash
cd /home/daniel/repos/ironbear-site
cp .env.example .env.local
```
Edit `.env.local`:
```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```
Restart `npm run dev` after changing env vars (Vite only reads them on boot).

### Step 5. Verify
1. `npm run dev` and open the page.
2. In Supabase → **Table editor → events** — refresh; you should see a `visit` row within seconds.
3. Submit the form with a junk email; refresh **waitlist** — your row should appear.
4. Refresh **events** again; you should see `form_started`, `form_field_focus`, `form_submitted`, etc.
5. Crucially: check that `events.properties` for `form_field_change` / `_blur` events has `value_length` — and **no** raw email value.

### Step 6. (Optional) Personal admin & service_role usage
- Add yourself as an admin in **Authentication → Users** if you want to use Studio's row-level features.
- Use the `service_role` key only from a server-side script you control (e.g. a one-off Node script to email the waitlist). Never put it in the frontend.

### Step 7. Useful queries

```sql
-- Conversion + completion + CTR + drop-off (one row)
select * from public.v_conversion;

-- Time to submit (median, in ms)
select percentile_cont(0.5) within group (order by (properties->>'time_to_submit_ms')::int) as median_ms
from public.events where event_name = 'form_submitted';

-- Drop-off by step
select * from public.v_drop_off;

-- Repeated CTA (UX issue indicator)
select * from public.v_repeated_cta;

-- Device split (visitors)
select * from public.v_device_split;

-- Scroll depth funnel
select * from public.v_scroll_depth;

-- UTM quality (visitors vs conversions per source)
select * from public.v_utm_quality;

-- Latest 50 signups
select created_at, role, email, hype_answer, utm_source from public.waitlist
order by created_at desc limit 50;
```

---

## Build & deploy

### Vercel
1. Push `ironbear-site` to GitHub.
2. https://vercel.com → **New Project** → import the repo.
3. Framework preset: **Vite**. Build command: `npm run build`. Output: `dist`.
4. Add env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
5. Deploy.
6. (Optional) Custom domain: **Settings → Domains** → add `ironbear.app` (or whatever) and follow the DNS instructions.

### Netlify
1. Push to GitHub.
2. https://app.netlify.com → **Add new site → Import existing project**.
3. Build command: `npm run build`. Publish directory: `dist`.
4. Add env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
5. Deploy.

Both platforms auto-set up SPA routing for Vite by default; no `_redirects` needed since this is a single-page app served from `/`.

---

## Tweaking the design

| What you want to change | Where |
|---|---|
| Hero copy | `src/sections/Hero.tsx` (`linesText`, sub copy) |
| Hero CTAs | `src/sections/Hero.tsx` (the `.ib-hero-ctas` div) |
| Mascot in hero | `src/sections/Hero.tsx` (the `<img class="ib-hero-mascot">`) |
| Marquee lift names | `src/sections/Hero.tsx` (`LIFTS` const) |
| Two-path card copy | `src/sections/TwoPaths.tsx` |
| Hype numbers | `src/data/stats.ts` |
| Rotating quotes | `src/data/quotes.ts` |
| FAQ items | `src/sections/FAQ.tsx` (`ITEMS` const) |
| Footer copy | `src/sections/Footer.tsx` |
| Colors / type | `src/styles/tokens.css` |
| Layout / spacing / animations | `src/styles/app.css` |
| Form options (coach clients / individual goals) | `src/schema-types/waitlist.ts` |

---

## Privacy & PII

- Raw email is only ever stored in `waitlist` — never in `events`.
- `form_field_change` / `form_field_blur` record `value_length`, never values.
- The `events` table's RLS policy is **insert-only** for anon — clients can never read events back.
- The `waitlist` RLS policy is **insert-only** for anon — clients can never list emails.
- `v_waitlist_counts` exposes only aggregate counts to anon. No row-level data.
- Add a `<meta name="robots" content="noindex">` on any future privacy/terms pages.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `events` table empty in dev | Env vars missing or `.env.local` not reloaded — restart `npm run dev`. |
| Form submits "succeed" but no row appears | RLS policy missing — re-run `schema/supabase.sql`. |
| `23505` errors in console | That's the unique-email constraint — already handled as a friendly "you're already on the list". |
| Hero count stays at fallback | `v_waitlist_counts` not granted to anon. Run the schema again. |
| Funky fonts on first paint | Google Fonts blocked / slow — page still renders, no action needed. |
| Hot reload broke after editing tokens | Vite caches CSS imports aggressively; hard refresh (Cmd-Shift-R). |

---

## Maintenance

- Re-run `schema/supabase.sql` any time it changes — it's idempotent.
- Keep mascot copies in `public/mascots/` in sync with the main repo if Iron Bear redraws them: `cp /home/daniel/repos/ironbear/design/images/ironbear_*.png public/mascots/`.
- This project has zero coupling to the main `ironbear` repo at runtime; it can move to its own remote at any time.
