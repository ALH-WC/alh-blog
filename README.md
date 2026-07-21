# Amsterdam Life Homes - website

The ALH website, migrated off Framer onto our own stack. Started as the blog
pilot ("The Amsterdam Guide"); now hosts the full site: the blog plus the
renting, letting, buying, b2b, and contact pages. Preview at
alh-website.vercel.app until the domain cutover, after which this app serves
`amsterdamlifehomes.com`. Service pages ship with `robots: noindex,follow`
until that cutover (the Framer pages stay canonical).

## Stack
- Next.js (App Router), deployed to Vercel (project `alh-website`, team `alh-wc`)
- Sanity as the CMS, with Studio embedded at `/studio`
- Plain CSS / CSS Modules with CSS variables for theming (no Tailwind)
- Fonts: Mixta (licensed display face, self-hosted) + Inter

## Design system
`Website/ALH-Design-System-v2.md` (repo-adjacent, in the client project folder)
is the law: "Warm Paper" tokens, hard rules, page recipes. The renting page is
the reference implementation; /letting, /buying, /b2b, and /contact compose the
shared parts in `src/components/service/` (ServiceShell + bands).

## Client rules (non-negotiable)
- No em dashes anywhere (code, comments, copy, generated content)
- No author bylines, no avatars, no publish/updated dates. Read time is the only
  article meta shown. Article JSON-LD omits author and date fields.
- No fabricated statistics or testimonials. Verified stats only:
  250+ expats housed, 3.5 wks average search, 8+ yrs experience, 85% referrals.
- Service-page copy is verbatim from the client's approved pages; only obvious
  typos are corrected.

## Getting started
```bash
npm install
cp .env.local.example .env.local   # then fill in Sanity values
npm run dev
```
Open http://localhost:3000/blog and http://localhost:3000/studio

Until Sanity is configured (or while the dataset is empty), the blog renders
built-in sample content that mirrors the approved design prototypes, so the
pages always look right.

## Environment variables
See `.env.local.example`. Public values (`NEXT_PUBLIC_SANITY_PROJECT_ID`,
`NEXT_PUBLIC_SANITY_DATASET`) are safe to commit to Vercel env. The write token
(`SANITY_API_WRITE_TOKEN`) is server-only: never commit it, never prefix it with
`NEXT_PUBLIC`. Add all of them in Vercel > Project > Settings > Environment
Variables for Production, Preview, and Development.

## Content model (Sanity)
`article`: title, dek, slug, body (Portable Text, incl. a "steps" callout and a
"pull quote" block), category, stage (1 to 5), readMinutes, heroImage, audience
(`singles_couples` | `family` | `both`), featured, related (Keep reading
override).

Five journey stages (titles are fixed, do not rename): see
`src/sanity/schemaTypes/article.ts` and `src/lib/stages.ts`.

## Structure
- `src/app/blog/*` - blog index + article template + embedded Studio
- `src/app/renting/*` - the reference service page (own full layout)
- `src/app/letting|buying|b2b|contact/page.tsx` - composed service pages
- `src/components/service/ServiceShell.tsx` - nav, drawer, CTA pop-up, footer
- `src/components/service/bands.tsx` - stats, tag band, three-up, reviews,
  logo marquee, tiles, guide band, contact form
- `src/components/SiteNav.tsx` / `SiteFooter.tsx` - shared chrome
- `src/lib/renting|letting|buying|b2b.ts` - verbatim page copy
- `src/app/api/lead` and `src/app/api/subscribe` - email capture stubs (TODO: ESP)

## Deploy (Vercel)
Pushes to `main` deploy to production automatically. Add the env vars above.
The Studio at `/studio` uses the same env. Add your Vercel deploy URL (and later
the production domain) to Sanity > API > CORS origins so the Studio can connect.
`alh-blog.vercel.app` (the old name) 308-redirects to `alh-website.vercel.app`.
