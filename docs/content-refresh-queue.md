# Content refresh queue

Findings from reading all 116 imported articles during the SEO/GEO metadata pass.
Everything mechanically fixable has been fixed. What remains needs facts or an
editorial decision that a model should not make on its own.

Metadata lives in Sanity, so fixes go live via ISR without a deploy.

## Blocked: needs current figures (currently `noIndex`)

These two have `noIndex: true` set as a holding action. Their claims are wrong,
not merely stale, so they were kept out of search rather than left to be quoted by
answer engines. **Remove `noIndex` once corrected**, then regenerate their metadata
against the corrected body.

Both still need their SEO metadata generated once the bodies are fixed, since they
were skipped by the metadata pass.

### 1. `understanding-the-dutch-tax-service-for-expats`
All three income boxes carry 2022 rates, stated as current with no year attached:
Box 1 "37.07% to 49.50%", Box 2 "26.9%", Box 3 "31%". Box 2 has since split into
two brackets and Box 3 has changed rate and regime. Suggests the article was
written in 2022 and never revisited. Verify every figure against Belastingdienst.

### 2. `comprehensive-guide-to-all-holidays-in-the-netherlands-in-2025`
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

- **`renting-vs-buying-in-amsterdam-a-comprehensive-guide`** - carried a US mortgage
  model ("Down payment: Usually 10-20% of the property price"). The client confirmed
  Dutch lending finances up to 100%, and `understanding-dutch-mortgages` already said
  so, so the two articles were contradicting each other. The buying-costs section now
  explains that a mortgage covers up to 100% of *appraised value*, that the buyer's
  costs (transfer tax, notary, valuation, mortgage advice) come from savings and
  cannot be added to the mortgage, and that any overbid above the appraisal is also
  paid from savings. Stating "100% financing" on its own would have swapped one wrong
  impression for another, namely that no savings are needed at all. The article now
  contains no expiring figures, and the hold was lifted. It still has no structured
  metadata; it needs a batch through `patch-ai-metadata.mjs`.

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

## Duplicate FAQs (fixed)

102 articles rendered their FAQ twice: once from the imported body, once from the
structured `faqs` field that also emits FAQPage schema. The in-body copy was
stripped via `scripts/strip-inbody-faqs.mjs`, keeping the structured one.

Worth knowing if this is ever re-run: the imported bodies use two different shapes,
question-heading plus answer-paragraph pairs, and a bulleted list of merged
"Question?Answer" blocks (`understanding-dutch-mortgages`). Four articles also end
with a closing paragraph *after* their FAQ, which a naive strip-to-end would have
deleted. The three articles with no structured faqs were skipped so they keep the
only FAQ they have; they will need this re-run once their metadata is generated.

## Duplicate content, second pass (fixed)

The first FAQ strip keyed on the "Frequently Asked Questions" heading and
missed two shapes: a heading-less run of Q/A pairs ending the body
(`hardware-stores`), and a heading reading "Frequently Asked Question",
singular (`exploring-amsterdam-s-de-pijp`). Both stripped by
`scripts/fix-leftover-dupes.mjs`, which requires the run's questions to be
covered by the structured faqs before touching anything. The same script
removed one sentence-as-heading that a takeaway repeated verbatim
(`hardware-stores`, the bouwmarkt line).

Audited all 116 articles for overlap between the body and the added fields
(`scripts/audit-duplication.mjs`). The remaining overlap is by design:
takeaways and summaries are grounded in the body, so section headings and
lede sentences share their words. Removing those would gut the articles.
The three held articles keep their in-body FAQs until their refresh, and
`digid-for-expats` is legitimately written in question-styled sections.

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
