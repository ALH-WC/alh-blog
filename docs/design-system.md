# Amsterdam Life Homes — Website Design System v2
### "Warm Paper" system (July 2026)
Derived from the approved renting page mockup (the artifact iterated to final in July 2026). Supersedes v1 ("Het Atelier", Cormorant/Hanken on white). The renting page is the reference implementation; every other page is built from these parts. The blog remains its own world but shares the tokens, the dark, the hairlines, and the motion language.

---

## 1. The feel, in one paragraph

Warm paper everywhere, never white. One display voice (Mixta, the logo's own face) for everything big; one working voice (Inter) for everything else. Sand highlight blocks mark section titles like a marker pen; little gold eyebrow lines sit above them. Content text is a warm sandy grey, never cold grey, never pure black. Depth comes from hairlines and sandy panels; the only dark surfaces are the espresso panels and controls, all in the same dark as the blog's pop-up. Motion is quiet and physical: things lift 2px, arrows glide, images breathe, text slides out of clipped windows the way the blog logo collapses.

---

## 2. Hard rules (non-negotiable)

1. **No white anywhere.** The page ground and every "white" surface is paper `#F5F0E6`. This includes text and UI OVER photos: the hero headline and tagline, transparent nav items, the hamburger lines, and photo tile captions are all paper, never `#fff`, so the light is identical to the page ground.
2. **One dark.** Every filled control (submit buttons, checked boxes, contact buttons, photo tags, the CTA pop-up) uses `#241d16`, the blog pop-up dark. Never pure black fills.
3. **Every button and link shows the hand cursor.** Global rule: `a, button { cursor: pointer }`.
4. **No focus rings.** Form fields show focus by darkening their underline to ink, never an outline box.
5. **No rounded corners, no box shadows.** Depth = hairlines `#E5E0D7` + sandy panels.
6. **One body text size.** All recurring paragraph content is 16px. Deks are 17.5px. Never mix sizes for the same kind of text.
7. **NEVER use em dashes (—) anywhere.** Commas, periods, or colons. Permanent ALH copy rule.
8. **Exactly one H1 per page**, describing the page topic, never the brand name.
9. **Verified stats only:** 250+ expats housed, 3.5 wks average search, 8+ yrs experience, 85% from referrals.
10. **"We" voice, no named individuals** in page copy (client names in reviews verbatim from Google are allowed, including their punctuation).
11. **Primary CTA is the Cal.com video call** (cal.com/amsterdam-life-homes/intake); the form is the equal second path. The pop-up carries both.
12. **Deliberate line breaks are design.** Key sentences break where the client set them (see section 6). Do not let them rewrap.

---

## 3. Tokens

### Colors
| Token | Hex | Usage |
|---|---|---|
| `--paper` | `#F5F0E6` | Page ground and every light surface (never white) |
| `--sand` | `#EADFC9` | Title highlight blocks, keyword chips, selected form options, guide band |
| `--beige` | `#EFE6D2` | Side panels (process, form intro). Warmer than v1's greige |
| `--line` | `#E5E0D7` | All hairlines and borders (shared with the blog) |
| `--gold` | `#A5906E` | Eyebrows, numerals, +/− marks, arrow accents, uppercase notes |
| `--ink` | `#141414` | Headings, card titles, strong text, text-link labels |
| `--bodyc` | `#86745A` | Default body text (warm sandy grey) |
| strong body | `#57493A` | Row text, review bodies, footer text |
| muted | `#A28E70` | Parentheticals, helper text, placeholders, legal line |
| `--dark` | `#241d16` | ALL filled controls and dark panels (blog pop-up dark) |
| `--on-dark` | `#F2ECE1` | Text on dark |
| `--on-dark-muted` | `#C9BDAE` | Muted text on dark |
| `--footer` | `#EAE2D3` | The footer surface, identical on every page (blog and site) |

### Typography
Two families only. **Mixta** (the logo face; licensed, self-hosted) is the display voice: logo, H1, big statements, step numerals, review pull-quotes, service-tile captions, fee headline, guide-band title. **Inter** is everything else: body, UI, labels, section titles, buttons, forms.

**"Bold" = Mixta 650.** Whenever the client asks to make a display element bold, that means `font-weight: 650` on Mixta (the browser synthesizes it from the single 400 OTF — this is the intended look). It is the standing weight for every big statement and pull quote: the blog masthead title, the tagband statement, review quotes, the this-is-us quote, the blog pull quote ("We write these…"), and the closing lead. Stat numbers are NOT Mixta bold: they are Inter 650 (data, not display; picked from the July 2026 mockup, option C). The hero H1, the logo, chapter/tile captions, and numerals stay at their listed weights.

| Role | Font | Spec |
|---|---|---|
| Logo | Mixta 400 | 23px, letter-spacing -1px |
| H1 (hero) | Mixta 500 | 66px / 1.06, paper on photo, lower third |
| Big statement (tagband) | Mixta 650 | 40px / 1.25, centered |
| Section title | **Inter 650** | 34px site pages / 44px blog chapters, ink, inside a sand `.hl` block. ALL sand-block section titles are Inter 650, on the blog too (chapters, Keep reading, FAQ). Every other display role (H1, statements, numerals, quotes, tile captions) is Mixta, except stat numbers on heroless paper bands (Inter 650) |
| Eyebrow | Inter 600 | 12px, ls 0.22em, uppercase, gold. Always directly above the title |
| Body | Inter 400 | 16px / 1.62, `--bodyc` |
| Dek (under section titles) | Inter 400 | 17.5px, max-width 660px (unset it when a sentence must stay on one line) |
| Stat number (hero pile) | **Mixta 400** | 22px white on the photo (18px mobile), NOT bold; lowercase Inter 12.5px label at 85% white under it. The old paper-band style (Inter 650, 38px ink) survives only on heroless pages (/about) |
| Step numeral | Mixta 500 | 24px, gold |
| Review quote | Mixta 650 | 21px / 1.3, ink, clamped to EXACTLY two lines (`-webkit-line-clamp:2` + `min-height:2.6em`) so all bodies align |
| Keyword chips | Inter 700 | 12px, ls 0.06em, uppercase, ink on sand, padding 5px 11px |
| Uppercase note | Inter 600 | 12.5px, ls 0.14em, gold (e.g. "Average search: 3.5 weeks") |
| Text-link CTA | Inter 600 | 15.5px, ink + gold arrow |
| Form labels | Inter 600 | 11.5px, ls 0.18em, uppercase, INK (not gold: gold labels read too faint) |

### Motion (use these exact values)
- Hover lift on any clickable: `transform: translateY(-2px)`, 0.25s ease. Arrows also `translateX(4px)`.
- Image zoom in photo tiles: `scale(1.06)`, 0.7s `cubic-bezier(0.16,1,0.3,1)`; the caption fades out and an ↗ arrow fades in (0.35s, 0.08s delay).
- **The signature reveal** (guide band, blog logo): a clipped window (`overflow:hidden; max-width:0`) expanding while the inner text slides from `translateX(-100%)`, both 0.65s `cubic-bezier(0.45,0,0.15,1)`.
- Nav hide/show: `translateY(-100%)`, 0.38s `cubic-bezier(0.4,0,0.2,1)`.
- Pop-up entrance: opacity + `translateY(18px)`, 0.55s ease.
- Marquee: continuous `translateX(-50%)` keyframes, ~26s linear, pauses on hover.
- Tab attention (site-wide, `TabAttention` in the root layout): ONLY while the tab is hidden, the title crawls ("Amsterdam Life Homes · expat housing in Amsterdam · ") and the favicon cycles gold → terracotta → espresso → deep sand (`/public/fav/f0-f3.png`, the roundel recolored, white A preserved); both snap back instantly on focus. Never animate the visible tab.

---

## 4. Components (the renting page is the reference)

Implementation note (July 2026): the service-page parts are shared code in the alh-website repo (ALH-WC/alh-website, formerly alh-blog). `src/components/service/ServiceShell.tsx` renders the nav, hamburger drawer, CTA pop-up, and footer; `src/components/service/bands.tsx` renders StatsBand, TagBand, ThreeUp (eyebrow + sand title + dek + three hairline cells), ReviewsBand, LogoBand, ServiceTiles, GuideBand, and ContactBand (with the page's interest preselected). /letting, /buying, and /b2b are compositions of these; /renting still carries its own fuller layout (gate, process, fee, FAQ) and stays the visual reference. New service pages: compose the bands, never restyle them. Service-page copy is verbatim from the client's live pages; only obvious typos are corrected.

### 4.1 Navigation (one shared layout)
Grid: logo left (Mixta 23px), links centered, "Contact us" text link right (NOT a filled button). No language switcher. On photo-hero pages: fixed and TRANSPARENT with ALL items in paper at the top; scrolling down simply hides it (translateY(-100%)) with no state change; the solid design (light paper background, hairline, dark items) appears ONLY when the nav is revealed by scrolling up below the top; reaching the top restores the transparent paper original. The current page's link is underlined, on every nav including the blog's. Watch the global anchor color: nav links must explicitly inherit the nav's color. On the blog the same layout renders solid on paper, and the blog KEEPS its own category-bar handoff animation (the site menu slides away, the fixed logo collapses to ALH, the category bar takes the top edge). Implementation: `SiteNav` (blog/articles) and the nav in `RentingView` share this layout.

### 4.2 Photo hero
Full viewport height (`100vh`, min 640px). Warm daylight photo, even dark wash (gradient rgba(25,18,10, .30→.38)). Text bottom-left (Lokers-style): Mixta H1 with the client's line breaks, then the tagline sub ("We help fellow expats / rent, let, and buy their home / in Amsterdam."), paper. No eyebrow, no highlight blocks on the photo.

### 4.3 Stat cells
4-up hairline cells: Inter 650 number + caps label. Verified stats only.

### 4.4 Tag band
Centered Mixta statement on paper with the fixed two-line break, dek under it, one text-link CTA. Hairline below.

### 4.5 Section head
Gold eyebrow, Inter-650 title in a sand block, optional dek. Titles that sit ON a sandy panel (process, form) drop the sand block (no highlight-on-sand).

### 4.6 Qualification gate
Two hairline cells: gold "We can help you" eyebrow + rows with **bold** gold `+`; muted eyebrow `#B0A899` for "Outside our scope" + bold gold `−`. Rows separated by hairlines.

### 4.7 Process band
Beige panel left (eyebrow, plain Inter title, short dek) + numbered rows right: gold Mixta numeral, Inter 650 row title, 16px body, gold uppercase note, optional text link.

### 4.8 Service photo tiles
3-up flush tiles (aspect ~4/2.7), Mixta caption bottom-left over a soft wash. Hover: image zooms 1.06, wash lightens, caption crossfades to a white ↗. The tiles ARE the "other services" section (captions are the service questions).

### 4.9 Review carousel
One horizontal line, endless in both directions (doubled track, seamless wrap in the middle band; no scroll-snap). Arrow buttons top-right (hairline squares, sand hover). Card: two-line Mixta quote (always exactly two lines) inside a sand highlight block; 16px body clamped to 8 lines; the client keyword line (household, budget, timeline) sits just above the reviewer name row as plain gold uppercase text with middot separators, never chips, never black. No border under individual cards; only the section's own rules.

### 4.10 Client logo marquee
Caps-gold label + auto-rotating strip (doubled content, 26s linear, pause on hover).

### 4.11 Fee section (fits one screen)
Two columns: left = eyebrow, Mixta "Our fee", gold Mixta "One month's rent + 21% VAT", two paragraphs, hairline, italic muted third paragraph. Right = three stacked hairline cells (To get started / Deposit, When you sign / Remaining balance, No home found? / No further payment).

### 4.12 Guide band ("Our Amsterdam guide")
Full-width sand field, entirely clickable. Mixta title + gold ↗ (glides up-right on hover). Beneath: "Read about:" + the categories revealed with the signature clipped-window slide (4.·Motion). Category list matches the blog chapters; on the website the food chapter reads "Food & Drinks". Sand deepens slightly on hover (#E4D5B5).

### 4.13 FAQ
Two narrower columns centered (max-width 1100px). Question Inter 650 + 16px answer. No Q numerals. Hairlines between rows; the final row of each column has none; row bottoms align per grid row.

### 4.14 Contact form (fits one screen)
Beige intro panel (eyebrow, plain title with "Your home in Amsterdam / starts here" break, intro, then the email, phone number, and opening hours as text-width clickable lines) + form: sand-filled selected option (quiet border, no dark outline), paired field rows, underline inputs (no focus ring; underline darkens), gold labels, helper linking to the gate anchor, working checkboxes (dark fill + cream check), dark submit. Phone placeholder shows "+1 ...".

### 4.15 CTA pop-up
Fixed bottom-right, `--dark`, eases in after 25% scroll, dismissible. Title "Let's find your home." + "Tell us what you are looking for, / or talk to us directly." Two buttons: cream "Fill in the form" with "We reply within 24 hours" as a small second line INSIDE the button, and an outlined "Schedule a free video call". Both lift and shift color on hover. Any input INSIDE a dark panel (the blog newsletter pop-up's email field) is a paper field with dark text and muted placeholder, never a dark-on-dark field. On phones it stacks as its own block with clear space above the button, 16px text (so mobile browsers do not zoom in), appearance reset so Android cannot restyle it. The field and its confirm button are ALWAYS exactly the same height (54px on phones, 52px on desktop).

### 4.15b Search
The blog search filters live while typing; there is no submit. Enter therefore only blurs the field, which drops the keyboard on phones. Never wire Enter to a page reload or a separate results page.

### 4.16 Footer (one shared component, the renting design)
Every page, blog included, uses the SAME footer component: the renting page footer design on the warm `--footer #EAE2D3` band (never paper, never dark). Four columns: (1) brand block with the Mixta wordmark, the three-line tagline ("We help fellow expats / rent, let, and buy their home / in Amsterdam"), plain mailto/tel contact lines (no icons before them), hours, and the social icons row; (2) Navigate; (3) Company; (4) the newsletter column ("New guides, straight from us." / the three-line dek / a working underline email input / Subscribe → with the gold arrow). Column headings are plain gold caps eyebrows (no sand chips, no backgrounds). Bottom row: © 2026 It's you. It's us. All rights reserved. + Cookie Settings · Privacy Policy (no Welleton). Column headings stay on one line (nowrap). Clickable items are text-width only: links use width: fit-content so the empty column width is never a hit area. Every footer link must actually work. Implementation: `SiteFooter` in the alh-website repo (ALH-WC/alh-website, formerly alh-blog), shared by /blog, articles, and /renting.

---

## 5. Copy voice
Short sentences, plain words, honest and warm. Say the hard thing kindly. Every process step ends in something concrete. Qualification framed as honest advice. Currency €80.000 / €2200 style. NEVER an em dash.

## 6. Fixed line breaks (do not rewrap)
- Hero: "Looking for a rental home / in Amsterdam? / We will find it for you."
- Hero sub: "We help fellow expats / rent, let, and buy their home / in Amsterdam."
- Tag band: "Amsterdam's boutique housing agency, / run by local expats." and "…what you are looking for, / and simply treat you the way we want to be treated."
- Gate dek: full first sentence on ONE line, "If the below fits, we would love to hear from you." on the second.
- This is us: "We have been in your shoes. / That is why we do this."
- Reviews dek: "…satisfaction of our clients. / 85% of our business comes from referrals."
- Form panel: "Your home in Amsterdam / starts here"
- Newsletter: "Receive our articles by email. / No fluff, no spam. / Unsubscribe anytime."

## 7. Page recipes
All pages: fixed nav → 100vh photo hero (page H1 + the tagline sub) → stats → tag band → page-specific bands → reviews carousel (filtered to relevant quotes) → fee/pricing in the split layout → services tiles (the OTHER two services + corporate) → guide band → FAQ 2-col → contact form (relevant option preselected) → pop-up → footer.
- **/renting** — the reference (gate, abroad/here, process, this-is-us between hero and reviews).
- **Distinct bodies, shared hero (July 2026 rule, from the Asana content studies)**: every service page keeps the system photo hero, stats band, tiles, guide band, and footer, but its BODY layout must be visibly its own. The renting composition (gate, process panel, carousel, fee split) belongs to /renting alone.
- **/buying** — calm expert voice. Editorial why-a-buying-agent band (one big Mixta 650 statement + two-column prose, no cards), live service pillars as quiet c3 cells, six-step numbered 2x3 grid, Costs-explained label/value table with the kosten-koper footnote, three static reviews, FAQ + schema, CTA "Book a call about buying".
- **/letting** — landlord voice, reassurance first. Service pillars as alternating paper/beige full-width rows, the tenant-screening checklist on a sand panel as the page centerpiece, five-step vertical rail (bordered numerals), One-clear-fee tag band, bridge-to-/reviews section (until real landlord testimonials exist), FAQ + schema, CTA "Book a free landlord consultation".
- **/b2b** — the approved brief's layout: corporate stats (1 point of contact), "Trusted by teams at" static wordmark bar, Without-us/With-us comparison table (beige with-us column), four numbered pillars 2x2, horizontal four-step timeline (dark numeral squares), "Boutique service. Enterprise reliability." band, pricing label/value table, three static reviews, FAQ + schema, and the ONLY dark content band in the system: the "Request a corporate quote" form (dark ground, paper submit). CTA voice is corporate, never consumer.
- **Review carousels**: the endless carousel is a /renting signature; other pages use three static cards (ReviewTrio) or a bridge line.
- **/contact** — short hero, form as the main band, FAQ, no fee.
- **/about** — heroless (solid nav): paper section head (eyebrow + Mixta page title = the live "boutique housing agency" line + the treat-you sub + intake link) → stats → two mirrored c2 story bands (Foreigners ourselves, Our story; each pairs verbatim live copy with one bold Mixta display quote) → service tiles → guide band. AboutPage + RealEstateAgent schema. This page is the E-E-A-T anchor; the service pages' short This-is-us bands all link here ("More about us →").
- **/reviews** — heroless: section head (the live "Don't just take our word for it" + 85%-referrals dek + "Check our Google Reviews ↗") → the review wall: ALL reviews as a bordered grid (3/2/1 columns), same card as the carousel but quotes never clamped, no keyword tags, name + date in gold. NO review/AggregateRating schema ever — Google ignores self-serving review markup; stars come from the Google Business Profile, which is why the page links out to Google.
- **Hero stats pile (the data strip)** — on every photo-hero page the four stats live INSIDE the photo, stacked bottom-right: right-aligned column, numbers Mixta 400 22px white (NOT bold; approved over the 650 version), labels Inter 12.5px lowercase at 85% white, 1px separators at 26% white, anchored bottom 44px / right gutter. On phones the pile compacts (18px numbers, bottom 26px) and the hero text clears it via `.hero:has(.heroStats) .heroIn` padding. The paper stats band below the hero is retired on photo-hero pages; heroless pages (/about) keep the band.
- **/home (the root URL)** — the approved emotional architecture from the Asana studies: VIDEO hero (the only one: the brand film at public/home/hero.mp4, `autoPlay muted loop playsInline` with the photo as `poster`; service pages keep photo heroes) (verbatim H1 + Cal.com primary button + "See how we work ↓" scroll link) → human story band ABOVE services (team bench photo right, Foreigners-ourselves copy left, "More about us →") → verified trust bar → three empathetic service cards (Mixta 650 titles, four + bullets, Learn-more links) → dark corporate strip → three lead reviews + client wordmark bar → centred final Cal.com CTA. NO form on the homepage; the form lives on /contact. Every nav and drawer logo links to /.
- **The review funnel is one-directional**: every carousel links "Read all our reviews →" to /reviews; only /reviews links onward to Google. Carousels never link to Google directly.
- **The blog** stays its own world (Spectral, its own masthead and chapters) but shares: paper ground, hairlines, sand, the dark, gold accents where adopted, motion language, and the collapsing-logo animation family.

## 7b. Mobile (half of all traffic)
Phones (<=700px): the hero fills the full screen (100vh), KEEPS its three fixed line breaks (hard rule 12; dissolving them was tried and rejected) with the size following the screen (`clamp(21px, 7vw, 31px)`), and the copy sits well clear of the bottom edge (~110px padding, never pinned to the very bottom); the nav is logo left + hamburger at the far RIGHT edge; stats sit 2x2; review carousel hides its arrows (swipe), quotes never truncate, and cards are wide enough for the keyword line to hold one row; the client marquee runs full width under its label; the guide band drops the reveal list entirely and its gold ↗ moves from the title to the end of the sub line; the four form interest options share one row. Tablets (701-1100px) also use the hamburger. The page may NEVER scroll sideways: no nowrap on content text, overflow-x clip on the page.

The gutter is a token: `--gutter` drops from 44px to 22px at <=640px in globals.css, so every page tightens at once (card padding follows, 26px 22px).

**The hamburger drawer is one shared design on every page, the blog's**: full-screen paper panel opening with its own top bar (Mixta logo left, X close at the right edge, hairline underneath), then a quiet link list (Inter 24px, weight 400, no dividers), and at the BOTTOM always the same two squared full-width buttons: filled dark "Contact us" + outlined "Schedule a Free Video Intake Call →". The intake label and its arrow always share one line (white-space nowrap, stepping to 14.5px under 380px). No text-link CTAs in drawers, no rounded corners, no bold hairline-divided link rows.

Blog on phones and small tablets (<=980px): the docked category bar is ONE slim row (~50px): a "Categories ▾" dropdown button + the search field inline. The dropdown opens a hairline-divided list under the bar (current chapter bold) and closes on selection. Never a wrapped half-screen block, never a swipe row (tried; not usable). Cover paintings carry their titles painted into the artwork, so on phones they are always shown whole (`height:auto`, natural ratio) — never cropped to a fixed box; this holds for the index cards and the article hero. Filled CTAs (`Book your free video call`) never wrap mid-label: white-space nowrap plus a smaller phone size.

**The city map is desktop-only.** On phones (<=640px) the illustrated map hides and the section shows simple sand blocks instead, one per area that HAS a guide (name + read time, tappable), in a two-column grid, followed by the muted note "More neighborhood guides are on the way. The full illustrated city map lives on the desktop version of this page." The dek's first sentence ("Find your part of Amsterdam on the map.") hides with the map. The section keeps ~52px headroom above its title once the head returns to normal flow (<=1100px).

## 8. Sharing & identity
- **Favicon**: the dark `#241d16` roundel with the Mixta "A" in paper + the gold accent, served from `src/app/icon.png` + `favicon.ico` + `apple-icon.png` (Next serves these by convention). Recolored variants live in `public/fav/f0-f3.png` for the tab-attention cycle only.
- **Tab attention** (`TabAttention`, root layout): ONLY while the tab is hidden, the title crawls and the favicon cycles through the brand colors; focus restores the page title and the standard icon instantly. Never animate the visible tab.
- **Share cards**: every page passes `...shareMeta('<page>')` (src/lib/og.ts) into its metadata: a branded 1200x630 card from `public/og/<page>.jpg` (page hero photo, dark scrim, Mixta wordmark + page line) + twitter summary_large_image. OG title/description inherit from the page's own metadata. `OG_BASE` points at the staging domain; flip it to amsterdamlifehomes.com at cutover.
- **Title ownership**: NO sitewide title template. Service pages own their full "<Topic> | Amsterdam Life Homes" titles; only the blog segment (src/app/blog/layout.tsx) appends "| The Amsterdam Guide".

## 9. Photography
Warm Amsterdam daylight only: canals, brick, leafy streets, soft interiors. No night shots, no drone shots, no stock-corporate. Photo tiles always carry a Mixta caption. Real ALH photography replaces placeholders as available.

## 9. Assets and licensing
Mixta is the licensed brand face (self-hosted OTF/WOFF2). Inter via any standard hosting. The client-logo marquee needs the real logos exported from Framer. The pet FAQ still needs real copy (the live site shows template boilerplate there).
