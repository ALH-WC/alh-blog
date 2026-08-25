# Amsterdam Life Homes — Website Design System v3
### "The Quiet System" (July 2026, design option 2c)
Chosen after the co-founder review of the Warm Paper site: the blog, the heroes, the top menu, and the footer were approved; everything between hero and footer moves to the restraint of this system (source mockup: `Website/ALH Design System 2c.dc.html`, produced in Claude Design; direction reference: lokersrealestate.nl). Supersedes v2 "Warm Paper" for BODY sections only. The v2 layer remains in `renting.module.css` above the quiet override layer for reference; the quiet layer wins by cascade.

**Untouched by this system, permanently:** the top navigation (transparent-over-photo / solid-on-scroll-up, and the blog's handoff animation), the full-screen photo/video heroes with paper text and the bottom-right stats pile, the hamburger drawer, the CTA pop-up, the footer band, and the entire blog design.

---

## 0. Keeping this document alive (meta-rule)

Documentation is part of every change, not a separate task. Whenever a change ships that adds, alters, or retires anything this document describes (a token, a component, a rule, a page recipe, a convention, an animation, an asset system), the SAME work session updates:
1. **This document** at `Website/ALH-Design-System-v2.md` (the master), AND
2. **its mirror** at `alh/docs/design-system.md` in the repo (copy the master over it, same commit as the code), AND
3. **`alh/CLAUDE.md`** when the environment or working agreements changed, AND
4. **the Asana task** (checkbox + Status column + completion comment), AND
5. **Claude's project memory** when a standing decision was made.

A change is not done until all of these are true. Never leave documentation "for later": that is how the July 2026 stale-gap audit happened (video hero and sharing system shipped without doc entries).

---

## 1. The feel, in one paragraph

Everything below the hero sits on white, in one editorial voice. Photography carries all the colour. Espresso carries all the emphasis. Bronze carries all the labels. Air between modules, hairlines inside them, and nothing decorative anywhere: no chips, no highlight blocks, no filled buttons, no icons. The heroes above and the footer below keep their warmth; the body in between is quiet, confident, and grounded in Amsterdam photographs.

---

## 2. Hard rules (non-negotiable)

1. **White ground below the hero.** Every body module sits on `#FFFFFF`. Paper `#F5F0E6` survives ONLY where the approved elements use it: hero text and nav items over photos, the hamburger drawer, the pop-up's cream button.
2. **One dark.** Espresso `#241d16` is every heading, every arrow, the wordmark, and at most ONE dark band per page (b2b's quote form, the home corporate strip, the pop-up overlay).
3. **Bronze `#8A7250` is a label color only:** eyebrows, numerals, context lines, meta. Never body text, never headings.
4. **Sand `#EAE2D3` appears only on the footer band and exactly one tile per grid row** (fourth service tile, middle review cell) to stop rows reading flat.
5. **Hairline `#EAE7E1`, 1px, is the only divider.** No shadows, no border radius, no focus rings (underlines darken to espresso instead), no gradients outside photographs.
6. **No chips, badges, pills, bordered accent panels, or highlight blocks behind titles.**
7. **No filled buttons below the hero.** Calls to action are text: Inter 600 espresso (primary) or bronze (secondary) with a trailing arrow. On hover ONLY the arrow moves (4px right); nothing else changes. Filled buttons survive only in the hero and the pop-up.
8. **No plus bullets, no icons, no illustration.** Lists are plain hairline-separated lines with generous leading. Photography or nothing.
9. **Stats appear ONLY in the hero pile** and are exactly: 250+ expats housed, 3.5 wks average search, 9+ yrs of experience, 85% from referrals. The HOMEPAGE pile carries only three (no 3.5 wks); service pages carry four. In prose the number is written out ("nine years"). No stats bands in bodies; heroless pages simply have no stats.
10. **NEVER use em dashes (—) anywhere.** Commas, periods, or colons. Permanent ALH copy rule.
11. **Exactly one H1 per page**, describing the page topic, never the brand name.
12. **"We" voice, no named individuals** in page copy (client names in reviews verbatim from Google are allowed).
13. **Primary CTA is the Cal.com video call** (cal.com/amsterdam-life-homes/intake): "Schedule a free video call".
14. **Deliberate line breaks are design** (section 7). Do not let them rewrap.
15. **One body text size** per role: body 17px, secondary 15px. Never mix sizes for the same kind of text.
16. **The page never scrolls sideways on phones.**

---

## 3. Tokens

### Colours (six values, no more)
| Token | Hex | Usage |
|---|---|---|
| ground | `#FFFFFF` | Every body module. No tinted page background above the footer |
| espresso `--dark` | `#241d16` | All headings, arrows, the wordmark, the single dark band, filled hero/pop-up controls |
| sand | `#EAE2D3` | The footer band + exactly one tile per grid row |
| bronze | `#8A7250` | Eyebrows, numerals, meta lines, footer column labels. Never body text |
| body | `#5F5A54` | Body text, warm neutral, never cold grey. Nav and list rows step up to `#4A443D` |
| hairline | `#EAE7E1` | 1px, the only divider |

Attributions, placeholders, and the legal line: `#A39889` (on sand tiles `#8C8577` so it does not go pale).
**Retired from v2 bodies:** paper `#F5F0E6`, sand highlight `#EADFC9`, beige `#EFE6D2`, gold `#A5906E`, warm hairline `#E5E0D7`, body `#86745A`. In code the quiet layer remaps these vars inside `.page`; the hero, nav, drawer, pop-up, and footer keep their original values.

### Typography (three faces, strict jobs)
| Role | Font | Spec |
|---|---|---|
| Wordmark | Mixta 400 | Header and footer only. 18-19px, uppercase, letterspaced .3em where standalone; the 23px nav logo keeps its approved form |
| Display lines | Mixta 400 (650 for the tag-band statement) | Always uppercase for titles and statements: section titles 46px, closing statement 62px, service tiles 34px, photo captions 24-26px in white. Line-height 1.05-1.25, capped at 20-22ch |
| Pull quotes | Mixta 400 | 26-28px / 1.25, espresso, sentence case in quotation marks |
| Eyebrow | Inter 500 | 12px, ls .22em, uppercase, bronze. Always directly above the title |
| Body | Inter 400 | 17px / 1.8, `#5F5A54`, max 44-52ch |
| Secondary | Inter 400 | 15px / 1.75 |
| Meta / attribution | Inter 400-500 | 14px, `#A39889` |
| Text CTA | Inter 600 | 17px espresso (primary) / bronze (secondary), trailing arrow; in-card links 15px 500 |
| Form labels | Inter 600 | 11.5px, ls .18em, uppercase, espresso |

Inter never exceeds weight 600. Sentence case in all Inter copy; uppercase lives only in Mixta display lines, eyebrows, labels, and the wordmark.

### Space and grid
- Page gutter 48px for text modules (max 1180-1440); tile grids, photo mosaics, and quote grids bleed full width, separated by hairlines instead of gaps.
- Module rhythm: 80px above and below every text module (the footer's own top padding; feedback round 1 cut it from 170), 100-110px around the closing invitation, 80px for the employers row. Full-bleed bands touch with zero space.
- Column counts: four for services, three for reviews, two for the about split, three across for photo mosaics in 360px rows. Footer 1.6 / 1 / 1 / 1.2.
- On phones the gutter token drops to 22px (globals.css) and modules tighten; see section 9.

### Motion (unchanged values, quieter application)
- CTA hover: text CTAs lift `translateY(-2px)` AND the arrow glides `translateX(4px)`, 0.25s ease; tiles lift 2px too (feedback round 1 restored the old motion).
- Photo tile zoom: `scale(1.06)`, 0.7s `cubic-bezier(0.16,1,0.3,1)`; caption fades, ↗ fades in.
- **The signature reveal** (guide band, blog logo): clipped window + `translateX(-100%)` slide, 0.65s `cubic-bezier(0.45,0,0.15,1)`.
- Nav hide/show `translateY(-100%)` 0.38s; pop-up entrance opacity + 18px rise, 0.55s; marquee ~26s linear, pauses on hover.
- Tab attention (root layout): ONLY while the tab is hidden, the title crawls and the favicon cycles gold → terracotta → espresso → deep sand (`/public/fav/f0-f3.png`); both snap back on focus. Never animate the visible tab.

---

## 4. Components

Shared code: `src/components/service/ServiceShell.tsx` (nav, drawer, pop-up, footer), `bands.tsx` + `studyBands.tsx` (all body bands), all styled from `renting.module.css` whose final "QUIET SYSTEM" layer restyles every band at once. Compose bands, never restyle them per page. Service-page copy is verbatim from the client's live pages; only obvious typos are corrected.

### Approved and unchanged (do not touch)
- **4.1 Navigation**: grid logo/links/Contact-us text link; transparent paper items over photo heroes, hide-on-down, solid WHITE #FFFFFF on scroll-up (round 2: the bar and the drawer are white, not paper); current page underlined; on the SOLID (paper) bar all items are thin (400) black with the current page bold 650 + underlined, and Contact us always bold. The blog keeps its category-bar handoff and collapsing-logo animation.
- **4.2 Hero**: full viewport photo or brand video (muted, looping, poster fallback), even dark wash, Mixta H1 bottom-left with the client's breaks, paper text, and the **stats pile** bottom-right: Mixta 400 22px white numbers (18px mobile), lowercase Inter 12.5px labels at 85% white, 1px separators at 26% white. The home hero carries NO subtext, its H1 on the three fixed lines (We help fellow expats / rent, let, and buy their home / in Amsterdam), an OUTLINED paper Cal.com box (transparent, 1px paper border; fills paper with espresso text on hover; never a dark fill over the photo) + "See how we work ↓". Nothing over a photo is ever hard white #fff: hero text, captions, and the stats pile are paper #F5F0E6.
- **4.3 Hamburger drawer** (all pages, the blog's design): paper panel, own top bar (logo + X, hairline), Inter 24px links, two squared bottom buttons (filled dark Contact us + outlined intake).
- **4.4 CTA pop-up**: fixed bottom-right on `--dark` after 25% scroll; cream "Fill in the form" (with the 24-hours line inside) + outlined video-call button; field and confirm button always equal height (52px desktop / 54px phones); the close X sits at exactly 14px from the top and right edges in a 22px square. The pop-up speaks each page's service (renting/buying: "Let's find your home.", letting: "Let's find your tenant.", corporate: "Let's house your team."); pages without their own form send the form button to /contact. The blog's vertical help tab uses the same espresso as its panel, including hover.
- **4.5 Footer**: the sand `#EAE2D3` band, four columns, bronze caps labels, underline email + Subscribe text CTA, legal line. Layout identical on every page. COMPACT rhythm (round 3): 48px top / 30px bottom padding, 44px column gap, 34px above the legal row; the footer stays under ~470px on desktop.

### The quiet parts (new)
- **4.6 Section head**: bronze eyebrow + uppercase Mixta 46px title, no background, optional 17px dek. 150-170px air above.
- **4.7 Service tile**: min-height 320px, padding 40px, bronze numeral top-left, Mixta 34px name + one-line promise pinned to the bottom, arrow right-aligned on the promise line. ALL tiles white; sand #EAE2D3 is the HOVER state (with the 2px lift). No standing sand tile. Tile rows bleed full width with hairlines.
- **4.8 Captioned photo**: full bleed, no border. White Mixta 24-26px caption 32px from left, 28px from bottom, LOCATION ONLY, never a sentence. One tile per mosaic may carry a bare ↗ instead of a caption. Never invent a location: caption only what is verifiably in the photo.
- **4.9 Review cell**: 1px hairline border, padding 40px 34px, min-height 300px. Bronze uppercase context label on top (the placeholder keyword line until real per-client data arrives), Mixta 26px sentence-case quote, Inter 15px body, attribution pushed to the bottom edge in `#A39889` so cells align. Review cells are ALWAYS white, never sand. In review GRIDS (the /reviews wall and the home trio) nothing is ever clamped: full quote, full body. Only the renting carousel keeps its desktop clamp for equal card heights, and phones unclamp it. The renting page keeps its endless carousel mechanics with these cells; other pages use three static cells. The funnel stays one-directional: cells link "Read all our reviews →" to /reviews; only /reviews links onward to Google.
- **4.10 Calls to action**: ONE spec per tier, identical on every page. Primary Inter 600 espresso 17px + bronze arrow; in-card/inline (More about us, tile Learn more, Read all our reviews) Inter 600 espresso 15.5px + bronze arrow. The arrow is ALWAYS espresso #241d16, never bronze (round 4 reversed round 3; this includes the footer Subscribe arrow). Tile promises are matched in length so all tiles in a row render equally tall. Tiles do NOT lift on hover (the fill would overlap the neighbouring full-bleed bands): hover is the sand fill + the arrow glide only. Form submits are text CTAs too (espresso on white, cream on the dark band). The "Free. Takes 30 minutes. We respond within 24 hours." note in `#A39889` under the primary.
- **4.11 Forms**: underline inputs (no boxes, no rings; underline darkens to espresso on focus), espresso labels, interest options as hairline boxes that turn espresso-bordered espresso-text when selected, espresso-filled checkboxes with cream check (a control, not a button), 16px inputs on phones. EVERY form is wired: it posts to /api/lead, which stores a `lead` document in Sanity (visible in the Studio, newest first; requires SANITY_API_WRITE_TOKEN in the Vercel env). The privacy checkbox gates submission; after sending, a confirmation line replaces the button ("Thank you. We will get back to you within 24 hours."). The blog guide capture posts to the same route.
- **4.12 Qualification gate**: two WHITE hairline cells; the lead ("We can help you") cell stands out with a 1px espresso frame (outline, offset -1px), never sand. Rows are plain hairline-separated lines with the text vertically centered (padding both sides of each hairline). The +/− marks are retired.
- **4.13 Guide band**: the one guide gateway. Service pages carry it as the last band before the footer (white, top/bottom hairlines, the signature reveal). The HOMEPAGE carries it as a CELL inside the photo band instead (third position, hairlines left AND bottom, bottom-aligned content, h3 at 34px): never buried at the page bottom there, and never twice on one page. In the tile the category block FADES UP once when the tile is FULLY in view (IntersectionObserver at 90%, opacity + 14px rise, 0.7s + 0.1s delay): the signature clip reveal is NOT used there (it fought the wrapped layout). Nothing in the tile is bold: title, label, and categories all weight 400. The homepage pop-up is SCROLL-LINKED to the photo band (popAnchor on ServiceShell, anchor id pop-anchor): its top edge peeks above the viewport bottom as the band's bottom enters view, slides fully in over the next 350px of scroll (1px scroll = 1px movement, the blog-handoff principle; opacity is the only self-animated property), then stays fixed and rides along. Other pages keep the 25% scroll threshold.
- **4.14 Employers band**: ONE shared component, `LogoMarquee` (studyBands): the calibrated rotating marquee with the REAL client-supplied logos (`/public/logos/`, 18 companies, source files in `Website/Logos/`). Every logo file is PREPARED: viewBox trimmed to the artwork, filled marks handled per logo (Miro square removed, ABN shield cropped away, Reddit flat-recolored two-tone in the file and rendered raw outside the filter). Per-logo optical heights in `src/lib/logos.ts`, calibrated to the Yandex wordmark at 28px (dense caps 22-26, bold wordmarks 26, low x-height like Google 33, thin serif and stacked marks 30-32). One tint via `grayscale(1) brightness(0.28)` at 78% opacity; gap is a constant 76px INCLUDING the wrap seam (track gap 0). Static wordmark bars are retired; every page that shows employers uses this marquee.
- **4.15 Search (blog)**: filters live while typing; Enter only blurs the field (drops the phone keyboard). Never a submit or reload.

---

## 5. Copy voice
Short sentences, plain words, honest and warm. Say the hard thing kindly. Every process step ends in something concrete. Qualification framed as honest advice. Currency €80.000 / €2200 style. Sentence case everywhere in Inter. NEVER an em dash. The fourth service is always "Corporate", never "B2B" (the URL stays /b2b).

## 6. Sharing and SEO layer
- **Share cards**: every page passes `...shareMeta('<page>')` (src/lib/og.ts): branded 1200x630 card from `public/og/<page>.jpg` + twitter summary_large_image. `OG_BASE` flips to amsterdamlifehomes.com at cutover.
- **Title ownership**: NO sitewide title template. Pages own their full "<Topic> | Amsterdam Life Homes" titles; only the blog segment appends "| The Amsterdam Guide".
- **Favicon**: the espresso roundel with the white A (`/fav/f1.png` as rel=icon); the TabAttention cycle recolors it only while hidden.
- **Schema**: Organization + WebSite + RealEstateAgent on /, FAQPage on service pages, AboutPage on /about, ContactPage on /contact, BreadcrumbList where shipped. NEVER review/AggregateRating markup (self-serving reviews are ignored; stars live on the Google Business Profile).
- All pages stay `noindex, follow` until the domain cutover.

## 7. Fixed line breaks (do not rewrap)
- Boutique statement (home + renting): "Amsterdam's boutique housing agency, / run by local expats." Line one NEVER breaks on desktop (max-width none); on phones the break dissolves. Its dek: "We have been in your shoes, know what you are looking for, / and simply treat you the way we want to be treated."
- Guide module: "The guide we wish / someone had handed us." and the dek "Everything we know about moving to and living in Amsterdam, / written the way we would explain it to a friend."
- Closing fine print everywhere: "Free. Takes 30 minutes. And will give you all the clarity you were looking for."
- Renting hero: "Looking for a rental home / in Amsterdam? / We will find it for you."
- Hero sub everywhere: "We help fellow expats / rent, let, and buy their home / in Amsterdam."
- Home hero H1: "We help fellow expats rent, let, / and buy their home / in Amsterdam"
- Tag band: "Amsterdam's boutique housing agency, / run by local expats." and "…what you are looking for, / and simply treat you the way we want to be treated."
- Gate dek: full first sentence on ONE line, "If the below fits, we would love to hear from you." on the second.
- Reviews dek: "…satisfaction of our clients. / 85% of our business comes from referrals."
- Form panel: "Your home in Amsterdam / starts here"
- Newsletter: "Receive our articles by email. / No fluff, no spam. / Unsubscribe anytime."

## 8. Page recipes (bodies in the quiet system)
- **/ (home)** (per the "ALH Homepage 2c" page mockup): hero video (+ pile, Cal.com button) → about split (text left 170px, FULL-BLEED team photo right) → four numbered service tiles in one hairline row, one-line promises, fourth on sand (no section head, no bullets) → three-photo captioned band (1.2/1/1.4fr, 420px) → reviews intro row (title left, "Read all our reviews →" right) + three cells, middle on sand → employers row (110px) → LEFT-aligned closing invitation (uppercase Mixta 62, primary espresso + secondary bronze "Read our Amsterdam guide →" text CTAs, muted note). NO form, NO stats band, NO guide band, NO dark strip.
- **/renting** (per the "ALH Renting 2c" page mockup): positioning module (Mixta 56 uppercase statement + Cal CTA) → gate intro + two cells with Mixta 30 subtitles and plain hairline lines, RIGHT cell on sand → two-photo captioned band (1.4/1fr, 460px) → abroad/here cells with bronze footnotes → process (intro panel left + four numbered rows right, bronze uppercase step notes) → fee (narrative left with italic hairline-topped quote; three cards right, middle on sand) → reviews intro row + three static cells (the carousel is retired) → FAQ rows (question left / answer right, the still-abroad row on sand) → contact split (intro + contact lines left, form right, "Submit form →" text CTA) → other-services photo tiles. NO this-is-us band, NO logo marquee, NO guide band.
- **/buying**: editorial statement + two-column prose, quiet pillars, six-step 2x3 grid, costs label/value table with kosten-koper footnote, three review cells, FAQ, "Book a call about buying".
- **/letting**: alternating full-width rows (now white + hairlines), tenant-screening checklist panel (white, bordered), five-step rail, one-clear-fee band, bridge to /reviews, FAQ, "Book a free landlord consultation".
- **/b2b**: corporate stats line, "Trusted by teams at" bar, without-us/with-us table, four pillars 2x2, timeline (espresso numeral squares), pricing table, review cells, FAQ, and the dark "Request a corporate quote" band: the page's one dark band, cream text CTA submit.
- **/about**: heroless (solid nav), uppercase Mixta page title, two mirrored story splits with pull quotes, tiles, guide band. NO stats band (stats live only in heroes). AboutPage schema. The E-E-A-T anchor; all "More about us →" links land here.
- **/reviews**: heroless: head + the full review wall (quiet cells, quotes never clamped), "Check our Google Reviews ↗".
- **/contact**: short solid-nav page, the form as main band, contact lines, ContactPage schema.
- **The blog**: entirely its own approved world. Do not restyle it.

### Homepage order (after feedback round 2)
Hero (one CTA, three-stat pile) → boutique statement module (EQUAL 100px air above and below; the about split below it opens with a full-width hairline) → about split continues as before; statement module ("Amsterdam's boutique housing agency, run by local expats." + the treat-you line, no eyebrow) → about split → four white tiles → photo band → reviews intro + three cells → employers MARQUEE (label "Our clients work at companies like", rotating, pause on hover) → closing invitation with the fixed break "It starts / with a video call" (no period), the tell-us dek, ONE CTA → footer.

## 9. Mobile (half of all traffic)
Phones (<=700px): heroes fill the screen and keep their fixed breaks (`clamp(21px, 7vw, 31px)`), copy well clear of the bottom; the stats pile compacts (18px, bottom 26px) and the hero text clears it. Section titles drop to 29px uppercase Mixta (service tiles 27px, review quotes 21px, this-is-us 25px); module air roughly halves (~84px). Nav = logo + hamburger at the far right; the drawer is the shared blog design. Stats 2x2 never applies anymore (no stats bands). Review cards: no arrows (swipe), quotes untruncated, context line one row. Interest options share one row. Blog on phones: the slim Categories ▾ + search bar row; cover paintings always whole, never cropped. The city map is desktop-only; phones get the sand area blocks + the desktop note. The page NEVER scrolls sideways; no nowrap on content text.

## 10. Photography
Warm Amsterdam daylight only: canals, brick, leafy streets, soft interiors. No night shots, no drone shots, no stock-corporate. Captions are locations only, in white Mixta on the photo, and only when the location is verifiably true. Real ALH photography replaces placeholders as available.

## 11. Assets and licensing
Mixta is the licensed brand face (self-hosted OTF/WOFF2). Inter via any standard hosting. The client-logo marquee runs on the real client-supplied logos (Aug 2026). The pet FAQ still needs real copy (the live site shows template boilerplate there).