'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { ArticleListItem } from '../../lib/types';
import { SECTIONS, CATEGORY_TO_SECTION } from '../../lib/sections';
import { SiteNav } from '../../components/SiteNav';
import { SiteFooter } from '../../components/SiteFooter';
import { HelpCta } from '../../components/HelpCta';
import { CityMap, type AreaTip } from '../../components/CityMap';
import { AREA_GUIDES } from '../../lib/neighborhoods';
import styles from './blog.module.css';
import navStyles from '../../components/SiteNav.module.css';

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

async function postEmail(endpoint: string, payload: Record<string, unknown>) {
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    /* stub endpoint */
  }
}

// Booking link for the closing sales CTA (Cal.com video intake call).
const INTAKE_URL = 'https://cal.com/amsterdam-life-homes/intake';

export default function BlogIndex({ articles }: { articles: ArticleListItem[] }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('latest');
  const [compact, setCompact] = useState(false);
  const [modalHouse, setModalHouse] = useState<'single' | 'family' | null>(null);
  const [modalBuy, setModalBuy] = useState(false);
  const [modalSent, setModalSent] = useState(false);
  const [popState, setPopState] = useState<'idle' | 'shown' | 'dismissed'>('idle');
  // How far (0-64px) the category bar has pushed the site menu off the top.
  // Scroll-linked: 1px of scroll moves both bars exactly 1px.
  const [prog, setProg] = useState(0);

  const gmenuRef = useRef<HTMLElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leadRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const hero = useMemo(() => articles[0], [articles]);
  const latest = useMemo(() => articles.filter((a) => a !== hero).slice(0, 4), [articles, hero]);
  const bySection = useMemo(() => {
    const map: Record<string, ArticleListItem[]> = {};
    SECTIONS.forEach((s) => (map[s.key] = []));
    articles.forEach((a) => {
      const key = CATEGORY_TO_SECTION[a.category];
      if (key) map[key].push(a);
    });
    return map;
  }, [articles]);

  // Guide details for the map's hover card, keyed by area name. Built from the
  // explicit area/slug table, never by matching names against titles.
  const areaTips = useMemo(() => {
    const bySlug = new Map(articles.map((a) => [a.slug, a]));
    const out: Record<string, AreaTip> = {};
    Object.entries(AREA_GUIDES).forEach(([area, slug]) => {
      const a = bySlug.get(slug);
      if (a) out[area] = { title: a.title, readMinutes: a.readMinutes };
    });
    return out;
  }, [articles]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    // "View all" passes a chapter's menu label. Match it to the chapter and show
    // every category it holds; a plain substring match would only ever hit one of
    // them and silently hide the rest.
    const section = SECTIONS.find((s) => s.menu.toLowerCase() === q);
    if (section) return articles.filter((a) => section.categories.includes(a.category));
    return articles.filter((a) => `${a.title} ${a.category} ${a.dek}`.toLowerCase().includes(q));
  }, [articles, query]);

  // Scroll: compact menu, section scroll-spy, and pop-up trigger.
  useEffect(() => {
    const menu = () => gmenuRef.current;
    const onScroll = () => {
      const g = menu();
      // Migration progress, linked 1:1 to the scroll. The sentinel marks the
      // bar's natural position: once it reaches the site menu's bottom edge
      // (64px), every further pixel of scroll moves the site menu up 1px and
      // lets the bar follow, until the bar owns the top edge at 64.
      const sTop = dockRef.current?.getBoundingClientRect().top ?? Infinity;
      const p = Math.min(64, Math.max(0, 64 - sTop));
      setProg(p);
      setCompact(p >= 64);
      // Soft close: if the scroll comes to rest inside the handoff zone, the
      // page gently scrolls the few remaining pixels toward the nearest end,
      // so the bars never sit half-migrated. The timer resets on every scroll
      // event, so it never fights an active scroll, and smooth scrolling
      // feeds back through this same handler, keeping the motion 1:1.
      if (snapTimer.current) clearTimeout(snapTimer.current);
      if (p > 0 && p < 64 && !window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
        snapTimer.current = setTimeout(() => {
          const t = dockRef.current?.getBoundingClientRect().top;
          if (t == null) return;
          const pp = 64 - t;
          if (pp <= 0 || pp >= 64) return;
          window.scrollTo({ top: window.scrollY + (pp >= 32 ? t : -pp), behavior: 'smooth' });
        }, 160);
      }
      // spy
      const off = (g?.offsetHeight ?? 0) + 64 + 24;
      let cur = 'latest';
      document.querySelectorAll<HTMLElement>('[data-sec]').forEach((el) => {
        if (el.getBoundingClientRect().top - off <= 0) cur = el.dataset.sec || cur;
      });
      setActive(cur);
      // pop-up
      setPopState((s) => {
        if (s !== 'idle') return s;
        const lm = leadRef.current;
        const go = lm ? lm.getBoundingClientRect().bottom < 0 : window.scrollY > window.innerHeight;
        return go ? 'shown' : s;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (snapTimer.current) clearTimeout(snapTimer.current);
    };
  }, []);

  // Gentle reveal-on-scroll. Content ships visible; the effect only hides
  // below-the-fold blocks (so nothing flashes) and fades them up on entry.
  // Skipped entirely for reduced-motion or when IntersectionObserver is absent.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.revealIn);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
    );
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;
      el.classList.add(styles.reveal);
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    const off = (gmenuRef.current?.offsetHeight ?? 0) + 64 + 8;
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - off, behavior: 'smooth' });
  };

  const openGuide = (house: 'single' | 'family') => {
    setModalHouse(house);
    setModalSent(false);
    setModalBuy(false);
    document.body.style.overflow = 'hidden';
  };
  const closeGuide = () => {
    setModalHouse(null);
    document.body.style.overflow = '';
  };

  const clearSearch = () => {
    setQuery('');
    searchRef.current?.focus();
  };

  const Card = (a: ArticleListItem, cls: string, TitleTag: 'h3' | 'h4' = 'h3') => (
    <Link key={a._id} href={`/blog/${a.slug}`} className={`${styles.cardLink} ${styles.srow}`}>
      <span className={styles.scat}>{a.category}</span>
      {TitleTag === 'h3' ? <h3 className={styles.srowTitle}>{a.title}</h3> : <h4 className={styles.srowTitle}>{a.title}</h4>}
      <span className={styles.sm}>{a.readMinutes} min read</span>
    </Link>
  );

  const FeatureCard = (a: ArticleListItem, tall = false) => (
    <Link href={`/blog/${a.slug}`} className={`${styles.cardLink} ${styles.cell} ${styles.featcard}`}>
      <span className={`${styles.fimg} ${styles.photo}${tall ? ` ${styles.fimgTall}` : ''}`}>
        <img src={a.imageUrl} alt={a.imageAlt} loading="lazy" />
      </span>
      <span className={styles.fbody}>
        <span className={styles.eyebrow}>{a.category}</span>
        <h3 className={styles.featTitle}>{a.title}</h3>
        <p className={styles.featDek}>{a.dek}</p>
        <span className={styles.foot}>
          <span>{a.readMinutes} min read</span>
        </span>
      </span>
    </Link>
  );

  // City Map slots in after Housing, both in the menu and on the page.
  const menuItems = [
    { key: 'latest', label: 'The Latest' },
    ...SECTIONS.flatMap((s) =>
      s.key === 'neighborhoods'
        ? [{ key: 'citymap', label: 'City Map' }, { key: s.key, label: s.menu }]
        : [{ key: s.key, label: s.menu }],
    ),
  ];

  return (
    <div className={styles.page}>
      <SiteNav offset={prog} brandLifted />

      {/* Viewport-fixed logo and contact button at the site menu's exact
          coordinates. They never move: the menus slide beneath them. */}
      <div className={styles.brandFix}>
        {/* Each word's tail lives in a clipped window that narrows to zero
            while its letters slide left, so on laptop widths the logo closes
            up to "ALH" once the bar docks: the A never moves, L and then H
            slide left against it. Full logo everywhere above 1895px. */}
        <Link
          href="/blog"
          className={`${navStyles.logoWrap}${prog >= 64 ? ` ${styles.logoMini}` : ''}`}
          aria-label="Amsterdam Life Homes home"
        >
          <span className={navStyles.logo} aria-hidden="true">
            <span>A</span>
            <span className={`${styles.lrest} ${styles.lr10}`}>
              <span className={styles.lin}>msterdam&nbsp;</span>
            </span>
            <span>L</span>
            <span className={`${styles.lrest} ${styles.lr4}`}>
              <span className={styles.lin}>ife&nbsp;</span>
            </span>
            <span>H</span>
            <span className={`${styles.lrest} ${styles.lr6}`}>
              <span className={styles.lin}>omes</span>
            </span>
          </span>
        </Link>
      </div>
      <div className={`${styles.brandFix} ${styles.brandFixR}`}>
        <a href="https://amsterdamlifehomes.com/#contact" className={navStyles.cta}>
          Contact us
        </a>
      </div>

      {/* MASTHEAD */}
      <div className={styles.content}>
        <div className={styles.mast}>
          <div>
            <h1 className={styles.mastTitle}>
              <span className={styles.brand}>The Amsterdam Guide</span> we wish someone had handed us.
            </h1>
          </div>
          <div className={styles.mright}>
            <p className={styles.intro}>
              We are a boutique real estate agency in Amsterdam, run by local expats. We know how much a move can
              take out of you, so we gladly share everything we have learned.
            </p>
            <button type="button" className={styles.tlink} onClick={() => scrollTo('leadmagnet')}>
              Get our free step-by-step guide <span className={styles.ar}>→</span>
            </button>
          </div>
        </div>
        <div className={styles.mastRule} />
      </div>

      {/* CATEGORY MENU */}
      {/* Zero-height sentinel: marks the bar's natural (unstuck) position so
          scroll progress past the docking point can be measured exactly. */}
      <div ref={dockRef} aria-hidden="true" />
      <nav
        className={`${styles.gmenu}${compact ? ` ${styles.gmenuCompact}` : ''}${prog >= 64 ? ` ${styles.gmenuRaised}` : ''}`}
        ref={gmenuRef}
        style={{ top: 64 - prog }}
        aria-label="Categories"
      >
        <div className={styles.gin}>
          <div className={styles.gnav}>
            {menuItems.map((m) => (
              <button
                key={m.key}
                type="button"
                className={`${styles.gitem}${active === m.key ? ` ${styles.gitemCur}` : ''}`}
                onClick={() => scrollTo(m.key === 'latest' ? 'latest' : `sec-${m.key}`)}
              >
                {m.label}
              </button>
            ))}
          </div>
          <label className={styles.gsearch}>
            <SearchIcon />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search all articles..."
              aria-label="Search all articles"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query ? (
              <button type="button" className={styles.gclear} aria-label="Clear search" onClick={clearSearch}>
                &times;
              </button>
            ) : null}
          </label>
        </div>
      </nav>

      {results ? (
        /* SEARCH RESULTS (hero stays; sections replaced) */
        <div className={styles.content}>
          <div className={styles.resHead}>
            <p className={styles.resCount}>
              {results.length === 0
                ? `Nothing for “${query.trim()}”`
                : `${results.length} ${results.length === 1 ? 'article' : 'articles'} for “${query.trim()}”`}
            </p>
          </div>
          {results.length === 0 ? (
            <p className={styles.resNone}>No articles match that yet. Try BSN, deposit, 30% ruling, schools, or a neighbourhood.</p>
          ) : (
            <div className={styles.resGrid}>
              {results.map((a) => (
                <Link key={a._id} href={`/blog/${a.slug}`} className={`${styles.cardLink} ${styles.resCard}`}>
                  <span className={styles.eyebrow}>{a.category}</span>
                  <h3 className={styles.resTitle}>{a.title}</h3>
                  <span className={styles.resRt}>{a.readMinutes} min read</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.content}>
          {/* LATEST NEWS */}
          {hero ? (
            <section id="latest" data-sec="latest" className={`${styles.cells} ${styles.c2}`} style={{ marginTop: 40 }} data-reveal="">
              {FeatureCard(hero, true)}
              <div className={`${styles.cell} ${styles.latest}`}>
                <span className={`${styles.eyebrow} ${styles.latestHead}`}>The Latest</span>
                {latest.map((a) => (
                  <Link key={a._id} href={`/blog/${a.slug}`} className={`${styles.cardLink} ${styles.lrow}`}>
                    <span className={styles.lcat}>{a.category}</span>
                    <h4 className={styles.lrowTitle}>{a.title}</h4>
                    <span className={styles.rmin}>{a.readMinutes} min read</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* CHAPTERS */}
          {SECTIONS.map((s) => {
            const items = bySection[s.key] ?? [];
            if (items.length === 0) return null;
            // The chapter's feature card is the article marked "Hero of its
            // chapter" in the Studio; without one, the newest article leads.
            const heroPick = items.find((a) => a.sectionHero) ?? items[0];
            const ordered = heroPick === items[0] ? items : [heroPick, ...items.filter((a) => a !== heroPick)];
            const feature = ordered[0];
            const rest = ordered.slice(1, 5);
            const trio = s.key === 'life';
            return (
              <Fragment key={s.key}>
                {/* The city map: its own section between Housing and Neighborhoods,
                    with its own menu entry. The dek sits inside the map's empty
                    top-left corner, level with the top of the map. No reveal
                    animation: transforming the map during scroll stutters. */}
                {s.key === 'neighborhoods' ? (
                  <div id="sec-citymap" data-sec="citymap" className={styles.mapSec}>
                    {/* Title and dek overlay the map's empty top-left corner,
                        anchored to the section so they align with the other
                        chapter titles, not with the narrower centered map. */}
                    <div className={styles.mapHead}>
                      <h2 className={styles.sheadTitle}>The city map</h2>
                      <p className={styles.mapDek}>
                        Find your part of Amsterdam on the map. Tap a neighborhood to read its guide: what it costs,
                        who it suits, and what it is like to live there.
                      </p>
                    </div>
                    <section className={styles.mapWrap}>
                      <CityMap tips={areaTips} />
                    </section>
                  </div>
                ) : null}
              <div>
                <div id={`sec-${s.key}`} data-sec={s.key} className={styles.shead}>
                  <div className={styles.sheadMain}>
                    <h2 className={styles.sheadTitle}>{s.title}</h2>
                    <p className={styles.sheadDek}>{s.dek}</p>
                  </div>
                  <button type="button" className={styles.viewall} onClick={() => setQuery(s.menu)}>
                    View all {s.menu} articles <span className={styles.ar}>→</span>
                  </button>
                </div>

                {trio ? (
                  <section className={`${styles.cells} ${styles.c3}`} data-reveal="">
                    {ordered.slice(0, 3).map((a) => (
                      <Link key={a._id} href={`/blog/${a.slug}`} className={`${styles.cardLink} ${styles.cell} ${styles.phCell} ${styles.photo}`}>
                        <img src={a.imageUrl} alt="" loading="lazy" />
                        <span className={styles.tag}>{a.category}</span>
                        <span className={styles.phSub}>{a.readMinutes} min read</span>
                        <span className={styles.phCap}>{a.title}</span>
                      </Link>
                    ))}
                  </section>
                ) : (
                  <section className={`${styles.cells} ${styles.c2}`} data-reveal="">
                    {FeatureCard(feature)}
                    <div className={`${styles.cell} ${styles.srows}`}>{rest.map((a) => Card(a, '', 'h4'))}</div>
                  </section>
                )}

                {/* Lead magnet after the housing chapter */}
                {s.key === 'housing' ? (
                  <section id="leadmagnet" ref={leadRef} className={styles.lm} data-reveal="">
                    <div className={styles.lmCopy}>
                      <span className={styles.eyebrow}>Free PDF &middot; The Amsterdam Guide</span>
                      <h2 className={styles.lmTitle}>
                        Get our free
                        <br />
                        <em>step-by-step</em> guide
                      </h2>
                      <p>
                        Tell us a little about your move and we will send the complete guide as a PDF, plus a short
                        reply if we can help with your search.
                      </p>
                    </div>
                    <div className={styles.lmChoice}>
                      <span className={styles.clab}>I am moving as a</span>
                      <button type="button" className={styles.optbox} onClick={() => openGuide('single')}>
                        Single or couple <span className={styles.oa}>→</span>
                      </button>
                      <button type="button" className={styles.optbox} onClick={() => openGuide('family')}>
                        Family <span className={styles.oa}>→</span>
                      </button>
                    </div>
                  </section>
                ) : null}

                {/* Pull quote after the money chapter */}
                {s.key === 'money' ? (
                  <section className={styles.quoteWrap} data-reveal="">
                    <q>
                      We write these the way we would <em>explain them to a friend.</em> No jargon, no scare tactics, just what
                      we learned housing 250+ expats.
                    </q>
                    <div className={styles.quoteWho}>The ALH team</div>
                  </section>
                ) : null}

              </div>
              </Fragment>
            );
          })}

          {/* CLOSING */}
          <section className={styles.closing} data-reveal="">
            <p className={styles.closingLead}>
              Reading is a great start.
              <br />
              When you are ready
              <br />
              for the real thing...
            </p>
            <p className={styles.closingSub}>
              We help fellow expats rent, let, and buy their home in Amsterdam every day. Hop on a free video call and we
              will get to know your search, answer your questions, and show you exactly how we can help. No pressure, no
              obligation, just a friendly first conversation.
            </p>
            <a className={styles.closingCta} href={INTAKE_URL} target="_blank" rel="noreferrer">
              Book your free video call <span className={styles.ar}>↗</span>
            </a>
          </section>
        </div>
      )}

      <SiteFooter />

      <HelpCta mode="tab" />

      {/* NEWSLETTER POP-UP */}
      <aside className={styles.nlpop} hidden={popState !== 'shown'} aria-label="Newsletter signup">
        <div className={styles.nlpopOvl} onClick={() => setPopState('dismissed')} />
        <div className={styles.nlpopCard} role="dialog" aria-modal="true">
          <button type="button" className={styles.nlpopX} aria-label="Close" onClick={() => setPopState('dismissed')}>
            &times;
          </button>
          <span className={styles.eyebrow}>Stay in the loop</span>
          <h3 className={styles.nlpopTitle}>
            New guides, <em>straight from us.</em>
          </h3>
          <p className={styles.nlpopLead}>Receive our articles by email. No fluff, no spam. Unsubscribe anytime.</p>
          <form
            className={styles.nlpopForm}
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.querySelector<HTMLInputElement>('input');
              void postEmail('/api/subscribe', { email: input?.value ?? '' });
              setPopState('dismissed');
            }}
          >
            <input type="email" placeholder="name@email.com" aria-label="Email address" />
            <button type="submit">Keep me posted</button>
          </form>
          <p className={styles.nlpopFine}>We treat your inbox the way we treat your house search: with care.</p>
        </div>
      </aside>

      {/* GUIDE MODAL */}
      {modalHouse ? (
        <div className={styles.gmodal} aria-label="Get the guide">
          <div className={styles.gmodalOvl} onClick={closeGuide} />
          <div className={styles.gmodalPanel} role="dialog" aria-modal="true">
            <button type="button" className={styles.gmodalX} aria-label="Close" onClick={closeGuide}>
              &times;
            </button>
            {modalSent ? (
              <>
                <span className={styles.eyebrow}>Your guide</span>
                <h3 className={styles.gmTitle}>
                  Thank <em>you.</em>
                </h3>
                <p style={{ marginTop: 12, fontSize: '15.5px', color: 'var(--body-text)', lineHeight: 1.55 }}>
                  Your guide is on its way to your inbox. If we can help with your search, we will be in touch.
                </p>
                <div className={styles.modalFoot} style={{ justifyContent: 'flex-end' }}>
                  <button type="button" className={styles.btnDark} onClick={closeGuide}>Close</button>
                </div>
              </>
            ) : (
              <>
                <span className={styles.eyebrow}>Your guide</span>
                <h3 className={styles.gmTitle}>
                  Tell us about your <em>move.</em>
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = e.currentTarget;
                    const email = f.querySelector<HTMLInputElement>('input[type="email"]')?.value ?? '';
                    const budget = f.querySelector<HTMLInputElement>('#gm-budget')?.value ?? '';
                    const moving = f.querySelector<HTMLInputElement>('#gm-move')?.value ?? '';
                    const notes = f.querySelector<HTMLTextAreaElement>('#gm-notes')?.value ?? '';
                    void postEmail('/api/lead', {
                      email,
                      household: modalHouse,
                      intent: modalBuy ? 'buy' : 'rent',
                      budget,
                      moving,
                      notes,
                    });
                    setModalSent(true);
                  }}
                >
                  <div className={styles.frow}>
                    <span className={styles.flab}>Are you looking to</span>
                    <div className={styles.seg}>
                      <button
                        type="button"
                        className={`${styles.segopt}${modalBuy ? '' : ` ${styles.segoptSel}`}`}
                        onClick={() => setModalBuy(false)}
                      >
                        Rent
                      </button>
                      <button
                        type="button"
                        className={`${styles.segopt}${modalBuy ? ` ${styles.segoptSel}` : ''}`}
                        onClick={() => setModalBuy(true)}
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                  <div className={`${styles.frow} ${styles.ftwo}`}>
                    <div>
                      <label className={styles.flab} htmlFor="gm-budget">Your budget</label>
                      <div className={styles.euro}>
                        <span>&euro;</span>
                        <input
                          className={styles.fin}
                          id="gm-budget"
                          inputMode="numeric"
                          placeholder={modalBuy ? '450000 total' : '2000 per month'}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={styles.flab} htmlFor="gm-move">When are you moving</label>
                      <input className={styles.fin} id="gm-move" placeholder="e.g. September 2026" />
                    </div>
                  </div>
                  <div className={styles.frow}>
                    <label className={styles.flab} htmlFor="gm-email">Email address</label>
                    <input className={styles.fin} id="gm-email" type="email" required placeholder="name@email.com" />
                  </div>
                  <div className={styles.frow}>
                    <label className={styles.flab} htmlFor="gm-notes">Anything else we should know</label>
                    <textarea
                      className={styles.fin}
                      id="gm-notes"
                      rows={2}
                      placeholder="Neighbourhoods you like, must haves, timing, work situation"
                    />
                  </div>
                  <div className={styles.modalFoot}>
                    <button type="button" className={styles.btnPlain} onClick={closeGuide}>Cancel</button>
                    <button type="submit" className={styles.btnDark}>Send me the guide</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
