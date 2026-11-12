# Repository Architecture
- React 18 single-page application built with Vite 6 and React Router 7; this is not a Next.js App/Pages Router project.
- Styling uses hand-written global and component CSS. No Tailwind, Lucide, or TypeScript is configured; charts use Recharts.
- Deployment target: Vercel static hosting with clean-URL prerendered public routes, a noindex client-only shell for private paths, Node serverless API functions, and a daily Cron.
- Package manager: npm (`package-lock.json`).

# Directory Map
- `src/pages/`: route-level pages (`/`, `/work`, `/pricing`, `/book`, `/login`, protected operations routes under `/dashboard`, plus `/cookbook` and `/tracker`).
- `src/components/`: shared marketing, navigation, portfolio, contact, and dashboard UI; component CSS is colocated where applicable.
- `src/context/`: React auth context and session subscription.
- `src/lib/`: Supabase browser client, site config, EN/ES copy and route helpers, analytics, content queries, and recipe/nutrition data.
- `src/data/`: Generated portfolio photo, grade-pair, and about-image manifests plus testimonial data; the optimizer rebuilds these from local originals.
- `src/styles/`, `src/*.css`: global and legacy application styles.
- `src/assets/`: bundled assets; `originals/portfolio/`, `originals/grade/`, and `originals/about/` store local source photos and are Git-ignored; `public/images-optimized/` contains committed flat responsive WebPs used by clean clones and Vercel builds.
- `api/`: Vercel serverless sync endpoints and server-only helpers; `api/cron/` contains scheduled sync.
- `api/ops/`: role-checked operations APIs. `src/pages/` operations pages call these APIs; new operations tables have RLS enabled, no anon policies, and membership-scoped authenticated policies.
- `supabase/migrations/`: SQL schema, RLS policies, and database changes.
- Root config: `vite.config.js`, `vercel.json`, `eslint.config.js`, `index.html`, `package.json`; `scripts/` optimizes media and prerenders EN/ES routes. No Next, Tailwind, or TypeScript config exists.

# Data & Supabase Setup
- Browser client: `src/lib/supabase.js`, initialized with `@supabase/supabase-js` and `VITE_SUPABASE_URL` plus `VITE_SUPABASE_ANON_KEY`.
- Browser code must use only the public anon key and rely on Supabase RLS. Never import `api/_lib/supabase-admin.js` into `src/`.
- Operations access is granted through `ops_memberships`; do not put a user ID in a migration. Apply the migration, then grant the initial owner with the separate SQL handoff snippet.
- Server functions use `SUPABASE_SERVICE_ROLE_KEY` for privileged writes; request auth also needs the Supabase URL and anon key.
- Other server environment variables: `CRON_SECRET`, `YOUTUBE_API_KEY`, and `YOUTUBE_CHANNEL_ID`; Instagram credentials are stored in the service-only `content_accounts` table.
- Server-only service credentials use `SUPABASE_SERVICE_ROLE_KEY` (never a `VITE_` variable); public intake rate limiting also needs `INTAKE_RATE_LIMIT_SECRET`.
- Contact form currently embeds a Web3Forms access key in `src/lib/constants.js`; treat it as public and rotate/configure abuse controls if needed.
- `.env.local` contains developer-specific values and is ignored by Git. `.env.example` lists required names with dummy placeholders; never commit real secrets.

# Development Rules
- Keep edits focused and minimal; preserve the existing React/Vite structure unless migration is requested.
- Section numbering such as `01 / ...` appears only on homepage sections. Standalone pages never use section numbers.
- Standalone page headers use one shared compact top spacing on Work, Pricing, Book, Privacy, and other standalone routes. Center each header's eyebrow, heading, subtext, and buttons together as one column.
- Never render an empty section or its spacing wrapper when the section data is empty.
- Every rendered image except OG previews uses optimized web-size assets (maximum 2000px) and a transparent protective overlay. Disable context menu, drag/drop, selection, and mobile long-press saving; never link directly to an image. Preserve useful alt text and keyboard/screen-reader access.
- `originals/` is the ignored source of truth for portfolio, grade, and about photos. Never commit originals; regenerate optimized images and manifests from those files.
- Any public copy change must update both English and natural Latin American Spanish.
- **Person/Bio:** Alexander is the creator and the personal voice used in bios, introductions, and about copy.
- **Digital Face & Copyright:** Use `meganusopr` as the online handle on social links and footer copyright. Do not pair it with Alexander as a double name.
- **Domain/Site Name:** `shotbymeganuso` is the website/domain name (`shotbymeganuso.com`), not a studio, agency, or company. Do not describe it as an organization being built.
- Use React state/effects only in components that need browser interaction; there is no Next server/client component boundary or `'use client'` convention here.
- The project is JavaScript-only with no TS config; keep server secrets out of browser imports. `npm run typecheck` currently validates JS/JSX module syntax, not static TypeScript types.
- Start locally with `npm run dev`; create the production bundle with `npm run build`; run `npm run lint`, `npm run typecheck`, and `npm test` for checks.
- Keep data authorization in RLS and server endpoint checks; protected routes are UX controls, not a substitute for database/API authorization.

# Active Sprint Scratchpad
- [x] Add `.env.example` with dummy placeholders, configure local Supabase browser variables, and verify `.env.local` is Git-ignored.
- [ ] Confirm Vercel has Supabase, cron, and provider credentials set for the intended environments; validate the scheduled sync operationally.
- [x] Lazy-load private route bundles, reducing the public entry chunk below Vite's warning threshold; public portfolio images use lazy loading and descriptive alt text.
- [x] Add contact-form honeypot and minimum completion-time checks.
- [x] Update public social profile URLs/handles, secure outbound social anchors, and add route-specific titles and descriptions.
- [x] Standardize Alexander as the person/bio, `meganusopr` as the digital face and copyright, and `shotbymeganuso` as the website identity.
- [ ] Audit mobile gallery/filter interactions.
- [x] Add operations CRM, authenticated APIs, public write-only intake, and Los Angeles Monday–Sunday reporting.
- [x] Rebrand public copy around Alexander and meganusopr; add English/Spanish public routes, prerendered metadata, sitemap, robots rules, privacy page, and optional analytics tracking.
- [x] Generate portfolio categories, EXIF details, and newest-first image manifests from `originals/portfolio/`; use uncropped masonry, responsive WebPs, and committed generated data so clean clones build without originals.
- [x] Generate real grade comparison and optional Alexander portrait assets from `originals/grade/` and `originals/about/`; keep empty testimonials wrapper-free and hide video filters until video data exists.
