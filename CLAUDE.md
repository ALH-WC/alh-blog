# Amsterdam Life Homes website (alh-website)

Next.js 15 + Sanity site serving the full ALH website: /, /renting, /buying, /letting, /b2b, /about, /reviews, /contact, and the blog at /blog. Replaces the Framer site page by page; every page ships `robots: noindex, follow` until the domain cutover, when amsterdamlifehomes.com attaches to this Vercel project and the noindex flags come off.

## Environment
- Repo: `ALH-WC/alh-website` (formerly alh-blog). Working branch `feat/cms-seo-import`, PRs to `main`, self-merge allowed.
- Deploys: Vercel project `alh-website` (team slug `alh-wc`), production at https://alh-website.vercel.app. Every merge to main deploys; gate on `gh api repos/ALH-WC/alh-website/commits/<sha>/status`.
- Sanity CMS for blog content. The write token lives ONLY in `.env.local` as `SANITY_API_WRITE_TOKEN`; never print it.
- Workflow for changes: build → verify locally (dev server, 390px mobile included) → commit → push → PR → merge → wait for deploy success → verify on production.

## The law of the land
`docs/design-system.md` (mirror of `../ALH-Design-System-v2.md`, the Warm Paper system) is the single source of truth for design. Read it before touching any page.

**Documentation is part of every change (the doc's own rule 0).** Whenever a shipped change adds, alters, or retires anything the design doc describes, the SAME session updates the master doc AND copies it over `docs/design-system.md` in the same commit as the code, updates this CLAUDE.md if environment or working agreements changed, updates the Asana task (checkbox + Status column + comment), and updates Claude's project memory for standing decisions. A change is not done until documentation is; never leave it "for later". Highlights that are always in force: paper #F5F0E6 never white, one dark #241d16 for all filled controls, Mixta+Inter only, "bold" = Mixta 650, NEVER em dashes, verified stats only (250+ / 3.5 wks / 8+ yrs / 85% referrals), exactly one H1 per page, no rounded corners or shadows, no focus rings, deliberate line breaks are design, the page never scrolls sideways on phones.

## Working agreements
- Asana project "ALH - Website 2.0" (+ "ALH - Blog" for content) drives the work: READ the task's notes, subtasks, and study documents before building; parent status never ahead of subtasks; completing a task means the checkbox AND the Status column (plus Owner/Tool if stale); leave a completion comment with what shipped and any judgment calls.
- Facts never invented: copy comes verbatim from the client's live pages or approved Asana studies; unverifiable claims get flagged, not published.
- Review keyword tags are placeholders ("Three weeks · €6500 budget · Family") until real per-client data arrives.
- Shared service-page parts live in `src/components/service/` (ServiceShell, bands, studyBands); compose them, never restyle them per page.
