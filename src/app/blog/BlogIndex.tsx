'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { Article } from '../../lib/types';
import { SECTIONS, CATEGORY_TO_SECTION } from '../../lib/sections';
import { SiteNav } from '../../components/SiteNav';
import { SiteFooter } from '../../components/SiteFooter';
import { HelpCta } from '../../components/HelpCta';
import styles from './blog.module.css';

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

// Amsterdam neighborhoods shown as the "by area" index under the Neighborhoods
// chapter. Clicking one filters the guide to articles that mention it.
const NEIGHBORHOODS = [
  'Oud-Zuid',
  'De Pijp',
  'Oost',
  'Noord',
  'Jordaan',
  'Zuidas',
  'Oud-West',
  'De Baarsjes',
  'Westerpark',
  'Rivierenbuurt',
  'IJburg',
  'Watergraafsmeer',
];

export default function BlogIndex({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('latest');
  const [compact, setCompact] = useState(false);
  const [modalHouse, setModalHouse] = useState<'single' | 'family' | null>(null);
  const [modalBuy, setModalBuy] = useState(false);
  const [modalSent, setModalSent] = useState(false);
  const [popState, setPopState] = useState<'idle' | 'shown' | 'dismissed'>('idle');

  const gmenuRef = useRef<HTMLElement>(null);
  const leadRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const hero = useMemo(() => articles.find((a) => a.featured) ?? articles[0], [articles]);
  const latest = useMemo(() => articles.filter((a) => a !== hero).slice(0, 4), [articles, hero]);
  const bySection = useMemo(() => {
    const map: Record<string, Article[]> = {};
    SECTIONS.forEach((s) => (map[s.key] = []));
    articles.forEach((a) => {
      const key = CATEGORY_TO_SECTION[a.category];
      if (key) map[key].push(a);
    });
    return map;
  }, [articles]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return articles.filter((a) => `${a.title} ${a.category} ${a.dek}`.toLowerCase().includes(q));
  }, [articles, query]);

  // Scroll: compact menu, section scroll-spy, and pop-up trigger.
  useEffect(() => {
    const menu = () => gmenuRef.current;
    const onScroll = () => {
      const g = menu();
      if (g) setCompact(g.getBoundingClientRect().top <= 65);
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
    return () => window.removeEventListener('scroll', onScroll);
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

  const Card = (a: Article, cls: string, TitleTag: 'h3' | 'h4' = 'h3') => (
    <Link key={a._id} href={`/blog/${a.slug}`} className={`${styles.cardLink} ${styles.srow}`}>
      <span className={styles.scat}>{a.category}</span>
      {TitleTag === 'h3' ? <h3 className={styles.srowTitle}>{a.title}</h3> : <h4 className={styles.srowTitle}>{a.title}</h4>}
      <span className={styles.sm}>{a.readMinutes} min read</span>
    </Link>
  );

  const FeatureCard = (a: Article, tall = false) => (
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
          <span className={styles.ar}>↗</span>
        </span>
      </span>
    </Link>
  );

  const menuItems = [{ key: 'latest', label: 'The latest' }, ...SECTIONS.map((s) => ({ key: s.key, label: s.menu }))];

  return (
    <div className={styles.page}>
      <SiteNav />

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
      <nav className={`${styles.gmenu}${compact ? ` ${styles.gmenuCompact}` : ''}`} ref={gmenuRef} aria-label="Categories">
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
                <span className={`${styles.eyebrow} ${styles.latestHead}`}>The latest</span>
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
            const feature = items[0];
            const rest = items.slice(1, 5);
            const trio = s.key === 'life';
            return (
              <div key={s.key}>
                <div id={`sec-${s.key}`} data-sec={s.key} className={styles.shead}>
                  <div className={styles.sheadMain}>
                    <h2 className={styles.sheadTitle}>
                      {s.before}
                      <em>{s.accent}</em>
                      {s.after}
                    </h2>
                    <p className={styles.sheadDek}>{s.dek}</p>
                  </div>
                  <button type="button" className={styles.viewall} onClick={() => setQuery(s.categories[0])}>
                    View all {s.menu} articles <span className={styles.ar}>→</span>
                  </button>
                </div>

                {trio ? (
                  <section className={`${styles.cells} ${styles.c3}`} data-reveal="">
                    {items.slice(0, 3).map((a) => (
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

                {/* Neighborhood-by-area index after the neighborhoods chapter */}
                {s.key === 'neighborhoods' ? (
                  <>
                    <div className={styles.shead} style={{ paddingTop: 56 }}>
                      <div className={styles.sheadMain}>
                        <span className={`${styles.eyebrow} ${styles.subEyebrow}`}>Every neighborhood, one by one</span>
                        <h2 className={styles.sheadTitle}>
                          A <em>guide</em> to each part of <em>the city</em>
                        </h2>
                        <p className={styles.sheadDek}>
                          Tap a neighborhood to read its own guide: what it costs, who it suits, and what it is like to
                          live there.
                        </p>
                      </div>
                    </div>
                    <section className={styles.nbGrid} data-reveal="">
                      {NEIGHBORHOODS.map((n) => (
                        <button key={n} type="button" className={styles.nbCell} onClick={() => setQuery(n)}>
                          <span className={styles.nbName}>{n}</span>
                          <span className={styles.nbLink}>
                            Read the guide <span className={styles.ar}>→</span>
                          </span>
                        </button>
                      ))}
                    </section>
                  </>
                ) : null}
              </div>
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
