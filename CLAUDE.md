# Amsterdam Life Homes website (alh-website)

Next.js 15 + Sanity site serving the full ALH website: /, /renting, /buying, /letting, /b2b, /about, /reviews, /contact, and the blog at /blog. Replaces the Framer site page by page; every page ships `robots: noindex, follow` until the domain cutover, when amsterdamlifehomes.com attaches to this Vercel project and the noindex flags come off.

## Environment
- Repo: `ALH-WC/alh-website` (formerly alh-blog). Working branch `feat/cms-seo-import`, PRs to `main`, self-merge allowed.
- Deploys: Vercel project `alh-website` (team slug `alh-wc`), production at https://alh-website.vercel.app. Every merge to main deploys; gate on `gh api repos/ALH-WC/alh-website/commits/<sha>/status`.
- Sanity CMS for blog content. The write token lives ONLY in `.env.local` as `SANITY_API_WRITE_TOKEN`; never print it.
- Workflow for changes: build → verify locally (dev server, 390px mobile included) → commit → push → PR → merge → wait for deploy success → verify on production.

## The law of the land
`docs/design-system.md` (mirror of `../ALH-Design-System-v2.md`, the Warm Paper system) is the single source of truth for design. Read it before touching any page.

**Documentation is part of every change (the doc's own rule 0).** Whenever a shipped change adds, alters, or retires anything the design doc describes, the SAME session updates the master doc AND copies it over `docs/design-system.md` in the same commit as the code, updates this CLAUDE.md if environment or working agreements changed, updates the Asana task (checkbox + Status column + comment), and updates Claude's project memory for standing decisions. A change is not done until documentation is; never leave it "for later". Highlights that are always in force (v3 "Quiet System", July 2026): WHITE ground for body sections between hero and footer (paper #F5F0E6 survives only in hero text, nav-over-photo, and the pop-up; the solid nav bar and the drawer are white); espresso #241d16 for headings/arrows and at most one dark band per page; bronze #8A7250 labels; sand #EAE2D3 only on the footer and as the hover tint of CLICKABLE white blocks only; hairline #EAE7E1 the only divider; section titles are UPPERCASE Mixta 46px with no background; no filled buttons below the hero (text CTAs, hover moves only the arrow); no chips, no plus bullets, no icons; stats ONLY in the hero pile (250+ / 3.5 wks / 9+ yrs / 85% referrals; homepage pile has three, no 3.5 wks); Mixta+Inter only (Inter max weight 600, and ONLY at 17/15/14/12px; Mixta titles ALWAYS 46px, see the doc's closed scale); NEVER em dashes; exactly one H1 per page; no rounded corners, shadows, or focus rings; deliberate line breaks are design; the page never scrolls sideways on phones. The top menu, heroes (incl. stats pile), hamburger drawer, pop-up, footer, and the entire blog are approved and must not be restyled.

## Working agreements
- Asana project "ALH - Website 2.0" (+ "ALH - Blog" for content) drives the work: READ the task's notes, subtasks, and study documents before building; parent status never ahead of subtasks; completing a task means the checkbox AND the Status column (plus Owner/Tool if stale); leave a completion comment with what shipped and any judgment calls.
- Facts never invented: copy comes verbatim from the client's live pages or approved Asana studies; unverifiable claims get flagged, not published.
- Review meta: Elora & Garrett, Melissa & Chad, Stephanie & Tomas, and Sally, Paul & Amy carry REAL client data ("Budget: €4500 · Found in: 16 days" form, client-supplied Aug 2026); the remaining reviews keep placeholder tags until their real data arrives. The homepage trio is Melissa & Chad, Elora & Garrett, Sally, Paul & Amy; review dates are never shown.
- Shared service-page parts live in `src/components/service/` (ServiceShell, bands, studyBands); compose them, never restyle them per page.
