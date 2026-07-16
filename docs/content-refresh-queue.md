# Content refresh queue

Findings from reading all 116 imported articles during the SEO/GEO metadata pass.
Everything mechanically fixable has been fixed. What remains needs facts or an
editorial decision that a model should not make on its own.

Metadata lives in Sanity, so fixes go live via ISR without a deploy.

## Blocked: needs current figures (currently `noIndex`)

These three have `noIndex: true` set as a holding action. Their claims are wrong,
not merely stale, so they were kept out of search rather than left to be quoted by
answer engines. **Remove `noIndex` once corrected**, then regenerate their metadata
against the corrected body.

### 1. `renting-vs-buying-in-amsterdam-a-comprehensive-guide`
Body states "Down payment: Usually 10-20% of the property price." This is a US
model and does not describe Dutch mortgages. Dutch lending runs up to 100% LTV;
what a buyer actually needs from savings is the *kosten koper* (transfer tax,
notary, valuation, mortgage advice). The whole "buying costs" section needs
rewriting, not a wording tweak. Highest priority: closest to the commercial core.

### 2. `understanding-the-dutch-tax-service-for-expats`
All three income boxes carry 2022 rates, stated as current with no year attached:
Box 1 "37.07% to 49.50%", Box 2 "26.9%", Box 3 "31%". Box 2 has since split into
two brackets and Box 3 has changed rate and regime. Suggests the article was
written in 2022 and never revisited. Verify every figure against Belastingdienst.

### 3. `comprehensive-guide-to-all-holidays-in-the-netherlands-in-2025`
Premise is a year that has passed. Note Liberation Day is a public holiday every
five years (2025 was an observance year; 2026 is not), so rolling dates forward is
not purely mechanical. **Editorial decision needed:** re-date annually, or restructure
as evergreen (traditions + "how the dates are set") so it stops expiring. The slug
keeps `2025` either way, since URLs are never renamed.

## Aging but honest: figures are year-attributed

Not held. These state a year alongside the figure, so they are true historical
statements rather than false current ones. Metadata describes the mechanism and
avoids repeating the numbers.

- `amsterdam-s-minimum-wage-everything-you-need-to-know` — body quotes January 2024
  rates ("as of January 2024"). Dutch minimum wage revises every January and July,
  so this is several revisions behind.
- `understanding-the-dutch-healthcare-system-a-complete-guide` — "in 2024 it was
  385 euros" (eigen risico).
- `a-complete-guide-to-understanding-amsterdam-s-rent-control-laws` — 2023 increase
  caps (2.3% / 4.1%) in body only.
- `yearly-rent-increases-in-the-netherlands-what-every-expat-should-know` — 2024/2025
  caps in body only.
- `how-to-start-a-business-in-amsterdam-legalities-and-logistics` — 19% / 25.8% CIT
  and 21% VAT. Stable for several years; annual check is enough.

**Pattern worth keeping:** describe the rule, not the number, whenever a figure is
set annually. The rent-increase metadata says "capped at CPI plus a maximum of 1
percent" rather than a specific year's cap, and stays true. Same for minimum wage.

## Fixed in this pass

- **Em dashes removed from 22 articles** (31 body spans plus deks/titles). Client
  hard rule. Came in with the Framer import. Numeric ranges became "to"; rhetorical
  dashes became commas. Script: `scripts/fix-em-dashes.mjs`.
- **`top-10-must-visit-museums-in-amsterdam`** — described the H'ART Museum as
  "an extension of the Hermitage Museum in St. Petersburg", "affiliated with the
  Hermitage Museum in Russia", showing "rotating exhibitions from Russian
  collections". The affiliation was severed in 2023 over the invasion of Ukraine,
  and the site's own H'ART article said so. Rewritten from that article; outbound
  link moved from hermitage.nl to hartmuseum.nl. Released from hold.
- **`the-ultimate-guide-to-amsterdam-nightlife`** — described De School in the
  present tense with its 24-hour license. Rewritten around Tilla Tec, grounded in
  the site's own Tilla Tec article. The 24-hour license claim was dropped rather
  than transferred, as no source confirms Tilla Tec holds one.
- **`top-michelin-starred-restaurants-to-explore-in-amsterdam-in-2024`** — title,
  dek and two body mentions of 2024 removed. Slug unchanged.
- **Promotional year-stamps** removed from the deks of `is-it-worth-moving-to-amsterdam`
  and `the-best-family-friendly-neighborhoods-in-amsterdam`.

## Editorial observations (no action taken)

- `perfect-tips-for-hosting-a-memorable-housewarming-party` has no Amsterdam or
  Netherlands angle at all. Generic lifestyle content in a guide to living in
  Amsterdam.
- `discovering-the-amsterdam-public-library-a-cultural-haven` and
  `best-libraries-and-study-spots-in-amsterdam` both lead on the OBA and repeat the
  same hours and floor count. Two places to update when those change.
- Cross-article contradictions (De School, Hermitage) are invisible to per-article
  generation. Any future content pass should check claims *across* articles, not
  just within them.

## Pipeline notes

- `scripts/patch-ai-metadata.mjs <batch.json> [--dry]` — validates then patches.
  Resolves docs by `slug.current` (survives parenthesised slugs like
  `how-to-get-a-social-services-number-(bsn)-and-why-you-need-it`); adds the
  `_type`/`_key` Sanity requires on FAQ array items; rejects em dashes, missing
  fields, over-length titles and descriptions. Idempotent, so re-running is safe.
- Always `--dry` first. It caught a batch where `keyTakeaways` and `faqs` had been
  silently dropped, which would have shipped articles with no FAQPage schema.
- Never run these via `await import(...)`; top-level code executes on import.
- Sanity's CDN lags a few seconds behind a write. Building immediately after a patch
  reads stale data. Wait, or clear `.next/cache/fetch-cache`.
- GROQ `match` is word-based, not substring. `match "*—*"` matches everything. Use a
  JS regex over fetched text to check punctuation.
