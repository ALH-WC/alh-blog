# Amsterdam Life Homes - The Amsterdam Guide (blog)

Pilot migration of the ALH blog off Framer onto our own stack. The rest of the
site stays on Framer for now. This app will eventually be served at
`amsterdamlifehomes.com/blog/*` via a Cloudflare Worker.

## Stack
- Next.js (App Router), deployed to Vercel
- Sanity as the CMS, with Studio embedded at `/studio`
- Plain CSS / CSS Modules with CSS variables for theming (no Tailwind)
- Fonts: Spectral (display serif) + Archivo (body sans) via `next/font/google`

## Client rules (non-negotiable)
- No em dashes anywhere (code, comments, copy, generated content)
- No author bylines, no avatars, no publish/updated dates. Read time is the only
  article meta shown. Article JSON-LD omits author and date fields.
- No fabricated statistics or testimonials

## Getting started
```bash
npm install
cp .env.local.example .env.local   # then fill in Sanity values
npm run dev
```
Open http://localhost:3000/blog and http://localhost:3000/studio

Until Sanity is configured (or while the dataset is empty), the site renders
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
(`singles_couples` | `family` | `both`), featured.

Five journey stages (titles are fixed, do not rename): see
`src/sanity/schemaTypes/article.ts` and `src/lib/stages.ts`.

## Structure
- `src/app/blog/page.tsx` - index (server): fetch + JSON-LD, renders `BlogIndex`
- `src/app/blog/BlogIndex.tsx` - index UI + interactions (client)
- `src/app/blog/[slug]/page.tsx` - article template (built on design 1a)
- `src/app/studio/[[...tool]]/page.tsx` - embedded Sanity Studio
- `src/app/api/lead` and `src/app/api/subscribe` - email capture stubs (TODO: ESP)
- `src/sanity/*` - schema, client, queries, image, structure, env
- `src/lib/sampleData.ts` - design-accurate fallback content

## Deploy (Vercel)
Import the repo, framework auto-detected as Next.js. Add the env vars above.
The Studio at `/studio` uses the same env. Add your Vercel deploy URL (and later
the production domain) to Sanity > API > CORS origins so the Studio can connect.
