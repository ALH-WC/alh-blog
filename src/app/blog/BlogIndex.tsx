'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { Article, Audience } from '../../lib/types';
import { STAGES, STAGE_ACCENT } from '../../lib/stages';
import { SiteNav } from '../../components/SiteNav';
import { SiteFooter } from '../../components/SiteFooter';
import styles from './blog.module.css';

const CAL_URL = 'https://cal.com/amsterdam-life-homes/intake';

const GUIDE = {
  singles_couples: {
    intro:
      'Everything we tell our clients, free for you, written by fellow expats who do this every day, whether you ever work with us or not.',
    lmName: 'The Amsterdam Guide',
    lmTitle: 'Get the whole guide as one PDF, free',
    lmSub:
      'Leave your email and we will send you the complete Amsterdam relocation guide as a PDF: every stage, every checklist, in one file you can read offline and share.',
    lmCover: 'Renting & living in Amsterdam',
  },
  family: {
    intro:
      'Everything we tell families relocating to Amsterdam: schools, daycare waiting lists, the neighbourhoods kids love, and the paperwork that comes with moving little ones. Written by expats who did it themselves.',
    lmName: 'The Family Guide',
    lmTitle: 'Get the family guide as one PDF, free',
    lmSub:
      'Leave your email and we will send you the complete Amsterdam family guide: schools, daycare, family-friendly neighbourhoods, and every checklist for moving with children, in one file.',
    lmCover: 'Moving to Amsterdam with your family',
  },
} as const;

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
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
    // Stub endpoint. Swallow errors; UI still confirms per the design.
  }
}

export default function BlogIndex({ articles }: { articles: Article[] }) {
  const [audience, setAudience] = useState<Audience>('singles_couples');
  const [query, setQuery] = useState('');
  const [activeStage, setActiveStage] = useState(1);
  const [ctaVisible, setCtaVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const guide = GUIDE[audience === 'family' ? 'family' : 'singles_couples'];

  const { hero, latest, empty } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchesAudience = (a: Article) =>
      audience === 'family'
        ? a.audience === 'family' || a.audience === 'both'
        : a.audience === 'singles_couples' || a.audience === 'both';
    const matchesQuery = (a: Article) =>
      !q || `${a.title} ${a.dek} ${a.category}`.toLowerCase().includes(q);
    const filtered = articles.filter((a) => matchesAudience(a) && matchesQuery(a));
    const heroPick = filtered.find((a) => a.featured) ?? filtered[0];
    const rest = filtered.filter((a) => a !== heroPick);
    return { hero: heroPick, latest: rest.slice(0, 5), empty: filtered.length === 0 };
  }, [articles, audience, query]);

  // Articles available per stage (excluding the hero), after current filters.
  const laneItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchesAudience = (a: Article) =>
      audience === 'family'
        ? a.audience === 'family' || a.audience === 'both'
        : a.audience === 'singles_couples' || a.audience === 'both';
    const matchesQuery = (a: Article) =>
      !q || `${a.title} ${a.dek} ${a.category}`.toLowerCase().includes(q);
    const filtered = articles.filter((a) => matchesAudience(a) && matchesQuery(a));
    const heroPick = filtered.find((a) => a.featured) ?? filtered[0];
    const rest = filtered.filter((a) => a !== heroPick);
    const byStage: Record<number, Article[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    rest.forEach((a) => byStage[a.stage]?.push(a));
    return byStage;
  }, [articles, audience, query]);

  // ---- Reveal on scroll (respects prefers-reduced-motion; reveals all as fallback) ----
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    const revs = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (reduce) {
      revs.forEach((el) => el.classList.add(styles.revealVisible));
      return;
    }
    revs.forEach((el) => el.classList.add(styles.reveal));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add(styles.revealVisible);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    revs.forEach((el) => io.observe(el));
    // Safety: if the observer never fires, reveal everything.
    const t = window.setTimeout(() => {
      revs.forEach((el) => el.classList.add(styles.revealVisible));
    }, 1600);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  // ---- Scroll spy for the stepper ----
  // Deliberately mirrors the sticky-CTA effect below (which reliably tracks
  // scroll): a plain window scroll listener, empty deps, and the lanes queried
  // fresh inside the handler each time (so it always sees the current DOM and
  // never bails out at setup). Active stage = the last lane whose top has
  // scrolled above the sticky header. getBoundingClientRect is viewport-relative
  // so it works regardless of the scroll container; the height guard skips lanes
  // not yet laid out.
  useEffect(() => {
    const OFFSET = 160; // fixed nav (64) + sticky stepper (~57) + a little slack
    const onScroll = () => {
      const root = rootRef.current;
      if (!root) return;
      let current = 1;
      root.querySelectorAll<HTMLElement>('[data-lane]').forEach((lane) => {
        const rect = lane.getBoundingClientRect();
        if (rect.height > 0 && rect.top - OFFSET <= 0) {
          current = Number(lane.dataset.stage) || current;
        }
      });
      setActiveStage(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ---- Sticky CTA fade-in ----
  useEffect(() => {
    const onScroll = () => setCtaVisible(window.scrollY > 560);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToStage = (n: number) => {
    const el = rootRef.current?.querySelector<HTMLElement>(`#lane-${n}`);
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 130, behavior: 'smooth' });
    }
  };

  const handleForm =
    (endpoint: string, extra: Record<string, unknown> = {}) =>
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const input = form.querySelector<HTMLInputElement>('input[type="email"]');
      const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      const email = input?.value ?? '';
      void postEmail(endpoint, { email, ...extra });
      if (btn) {
        const original = btn.textContent;
        btn.textContent = 'Thank you';
        window.setTimeout(() => {
          btn.textContent = original;
        }, 2200);
      }
      form.reset();
    };

  const renderCard = (a: Article, big = false) => (
    <Link href={`/blog/${a.slug}`} className={styles.cardLink} style={{ display: 'block' }}>
      <div className={styles.imgWrap32}>
        <img className={styles.zoomImg} src={a.imageUrl} alt={a.imageAlt} loading="lazy" />
      </div>
      <span className={styles.cardKicker}>{a.category}</span>
      <h3 className={styles.cardTitle} style={big ? undefined : undefined}>
        {a.title}
      </h3>
      <p className={styles.cardDek}>{a.dek}</p>
      <p className={styles.cardRead}>{a.readMinutes} min read</p>
    </Link>
  );

  const renderTextItem = (a: Article) => (
    <Link key={a._id} href={`/blog/${a.slug}`} className={`${styles.cardLink} ${styles.secItem}`}>
      <span className={styles.secCat}>{a.category}</span>
      <h4 className={styles.secTitle}>{a.title}</h4>
      <p className={styles.secRead}>{a.readMinutes} min read</p>
    </Link>
  );

  const renderThumbItem = (a: Article) => (
    <Link key={a._id} href={`/blog/${a.slug}`} className={`${styles.cardLink} ${styles.secItemThumb}`}>
      <div>
        <span className={styles.secCat}>{a.category}</span>
        <h4 className={styles.secTitle}>{a.title}</h4>
        <p className={styles.secRead}>{a.readMinutes} min read</p>
      </div>
      <div className={styles.secThumb}>
        <img src={a.imageUrl} alt="" loading="lazy" />
      </div>
    </Link>
  );

  function Lane({ n, alt, kind, topRule }: { n: number; alt?: boolean; kind: 'textlist' | 'thumblist' | 'trio'; topRule?: boolean }) {
    const items = laneItems[n] ?? [];
    if (items.length === 0) return null;
    const stage = STAGES[n - 1];
    const accent = STAGE_ACCENT[n];
    const feature = items[0];
    const secondary = items.slice(1);

    const inner = (
      <>
        <div className={styles.laneHead}>
          <span aria-hidden className={styles.laneNum}>
            {String(n).padStart(2, '0')}
          </span>
          <div>
            <h2 id={`h-lane${n}`} className={styles.laneTitle}>
              {accent.head} <em>{accent.tail}</em>
            </h2>
            <p className={styles.laneDek}>{stage.dek}</p>
          </div>
          <Link href={stage.viewAllHref} className={styles.viewAll}>
            View all &rarr;
          </Link>
        </div>

        {kind === 'trio' ? (
          <div className={styles.trio}>
            {items.slice(0, 3).map((a) => (
              <Link key={a._id} href={`/blog/${a.slug}`} className={styles.cardLink} style={{ display: 'block' }}>
                <div className={styles.imgWrap45}>
                  <img className={styles.zoomImg} src={a.imageUrl} alt={a.imageAlt} loading="lazy" />
                </div>
                <span className={styles.cardKicker}>{a.category}</span>
                <h4 className={styles.trioTitle}>{a.title}</h4>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.laneGrid}>
            {renderCard(feature)}
            <div className={kind === 'thumblist' ? undefined : styles.secList}>
              {kind === 'thumblist'
                ? secondary.map(renderThumbItem)
                : secondary.map(renderTextItem)}
            </div>
          </div>
        )}
      </>
    );

    return (
      <section
        id={`lane-${n}`}
        data-lane=""
        data-stage={n}
        data-reveal=""
        aria-labelledby={`h-lane${n}`}
        className={`${styles.lane}${alt ? ` ${styles.laneAlt}` : ''}${topRule ? ` ${styles.laneTopRule}` : ''}`}
      >
        {alt ? <div className={styles.container}>{inner}</div> : inner}
      </section>
    );
  }

  return (
    <div ref={rootRef} className={styles.page}>
      {/* ---------- Top nav ---------- */}
      <SiteNav />

      {/* ---------- Masthead ---------- */}
      <header className={styles.header} data-reveal="">
        <div className={styles.container}>
          <div className={styles.masthead}>
            <div>
              <h1 className={styles.mastTitle}>
                {audience === 'family' ? (
                  <>The guide we wish<br />someone had handed <em>our family.</em></>
                ) : (
                  <>The guide we wish<br />someone had <em>handed us.</em></>
                )}
              </h1>
            </div>
            <div className={styles.mastRight}>
              <p className={styles.intro}>{guide.intro}</p>
              <div role="search" className={styles.search}>
                <span className={styles.searchIcon} aria-hidden style={{ color: 'var(--ink)', display: 'inline-flex' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                </span>
                <input
                  type="search"
                  placeholder="Search BSN, deposits, schools, 30% ruling..."
                  aria-label="Search the guide"
                  className={styles.searchInput}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className={styles.ruleInk2} />
        </div>
      </header>

      {/* ---------- Stepper (directly under the masthead line) ---------- */}
      <nav aria-label="Journey stages" className={styles.stepperWrap}>
        <div className={styles.stepper}>
          {STAGES.map((s) => (
            <button
              key={s.number}
              type="button"
              className={`${styles.step}${activeStage === s.number ? ` ${styles.stepActive}` : ''}`}
              onClick={() => scrollToStage(s.number)}
            >
              <span className={styles.stepNum}>{String(s.number).padStart(2, '0')}</span>
              <span className={styles.stepName}>{s.title}</span>
              {activeStage === s.number ? <span className={styles.stepBar} aria-hidden /> : null}
            </button>
          ))}
        </div>
      </nav>

      {/* ---------- Lead magnet ---------- */}
      <section className={styles.leadMagnet} aria-label="Download the full guide" data-reveal="">
        <div className={styles.lmGrid}>
          <div className={styles.lmCell}>
            <span className={styles.lmKicker}>
              <span className={styles.lmDot} />
              Free PDF &middot; {guide.lmName}
            </span>
            <h2 className={styles.lmTitle}>{guide.lmTitle}</h2>
            <p className={styles.lmSub}>{guide.lmSub}</p>
            <ul className={styles.lmList}>
              <li className={styles.lmItem}><span className={styles.lmCheck}>&#10003;</span>All five stages, start to finish</li>
              <li className={styles.lmItem}><span className={styles.lmCheck}>&#10003;</span>Printable checklists and document lists</li>
              <li className={styles.lmItem}><span className={styles.lmCheck}>&#10003;</span>Updated for 2026 rules and numbers</li>
            </ul>
            <form className={styles.lmForm} onSubmit={handleForm('/api/lead', { audience })}>
              <label htmlFor="lm-email" className={styles.lmLabel}>Where should we send it?</label>
              <div className={styles.lmRow}>
                <input id="lm-email" type="email" required placeholder="name@email.com" aria-label="Email address" className={styles.lmInput} />
                <button type="submit" className={styles.lmBtn}>Email me the guide</button>
              </div>
              <span className={styles.lmReassure}>One email with your PDF. We never share your address.</span>
            </form>
          </div>
          <div className={styles.lmMedia}>
            <img className={styles.lmImg} src="https://picsum.photos/seed/guidecover/700/900" alt="Amsterdam canal houses" loading="lazy" />
            <div className={styles.lmCoverWrap}>
              <div className={styles.lmCover}>
                <span className={styles.lmCoverKicker}>The complete guide</span>
                <p className={styles.lmCoverTitle}>{guide.lmCover}</p>
                <div className={styles.lmCoverRule} />
                <span className={styles.lmCoverFoot}>By expats, for expats &middot; 2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className={styles.main}>
        {/* ---------- Hero + latest ---------- */}
        {hero ? (
          <section aria-label="Featured and latest" className={styles.heroSec} data-reveal="">
            <article>
              <Link href={`/blog/${hero.slug}`} className={styles.cardLink} style={{ display: 'block' }}>
                <div className={styles.imgWrap16}>
                  <img className={styles.zoomImg} src={hero.imageUrl} alt={hero.imageAlt} />
                </div>
                <span className={styles.kicker}>
                  <span className={styles.kickerDot} />
                  {hero.category} &middot; Start here
                </span>
                <h2 className={styles.heroTitle}>{hero.title}</h2>
                <p className={styles.heroDek}>{hero.dek}</p>
                <p className={styles.readMeta}>{hero.readMinutes} min read</p>
              </Link>
            </article>
            <aside aria-label="The latest guides" className={styles.latestAside}>
              <h2 className={styles.latestHead}>The Latest</h2>
              {latest.map((a, i) => (
                <Link key={a._id} href={`/blog/${a.slug}`} className={`${styles.cardLink} ${styles.latestItem}`}>
                  <span className={styles.latestNum}>{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <span className={styles.latestCat}>{a.category}</span>
                    <h3 className={styles.latestTitle}>{a.title}</h3>
                    <span className={styles.secRead}>{a.readMinutes} min read</span>
                  </div>
                </Link>
              ))}
            </aside>
          </section>
        ) : null}

        <Lane n={1} kind="textlist" topRule />
        <Lane n={2} kind="thumblist" alt />

        {/* ---------- Mid signup strip ---------- */}
        <aside aria-label="Newsletter" className={styles.signupStrip} data-reveal="">
          <div>
            <span className={styles.signupKicker}>The Amsterdam Guide newsletter</span>
            <h2 className={styles.signupTitle}>Get every new guide by email, free</h2>
            <p className={styles.signupSub}>
              One or two emails a month: our newest guides, plus what we are seeing in the Amsterdam market that week. No spam, and you can unsubscribe in one click.
            </p>
          </div>
          <form className={styles.signupForm} onSubmit={handleForm('/api/subscribe')}>
            <label htmlFor="nl-mid" className={styles.signupLabel}>Your email address</label>
            <div className={styles.signupRow}>
              <input id="nl-mid" type="email" placeholder="name@email.com" aria-label="Email address" className={styles.signupInput} />
              <button type="submit" className={styles.signupBtn}>Subscribe free</button>
            </div>
            <span className={styles.signupReassure}>Read by expats before they move to Amsterdam.</span>
          </form>
        </aside>

        <Lane n={3} kind="textlist" />

        {/* ---------- Pull quote ---------- */}
        <section aria-label="From the team" className={styles.pullQuoteSec} data-reveal="">
          <blockquote className={styles.pullQuote}>
            <p>
              &ldquo;We write these the way we would explain them to a friend:{' '}
              <span className={styles.pullQuoteAccent}>no jargon, no scare tactics</span>, just what we learned housing hundreds of expats.&rdquo;
            </p>
            <footer className={styles.pullQuoteFoot}>The ALH Team</footer>
          </blockquote>
        </section>

        <Lane n={4} kind="thumblist" topRule />
        <Lane n={5} kind="trio" alt />

        {/* ---------- Essentials ---------- */}
        <section aria-labelledby="h-useful" className={styles.essentials} data-reveal="">
          <h2 id="h-useful" className={styles.essentialsTitle}>
            The essentials, <em>in order</em>
          </h2>
          <div className={styles.essentialsGrid}>
            {[...articles]
              .filter((a) => a.stage <= 3)
              .slice(0, 6)
              .map((a, i) => (
                <Link key={a._id} href={`/blog/${a.slug}`} className={`${styles.cardLink} ${styles.essItem}`}>
                  <span className={styles.essNum}>{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <span className={styles.essCat}>{a.category}</span>
                    <h4 className={styles.essTitle}>{a.title}</h4>
                  </div>
                </Link>
              ))}
          </div>
        </section>

        {empty ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>Nothing matches that yet.</p>
            <p className={styles.emptySub}>
              Try a broader word, or{' '}
              <a href={CAL_URL}>tell us what you were looking for</a>. We might just write it.
            </p>
          </div>
        ) : null}
      </main>

      {/* ---------- Dark newsletter ---------- */}
      <section aria-label="Newsletter" className={styles.newsletterDark}>
        <p className={styles.nlKicker}>Stay in the loop</p>
        <h2 className={styles.nlTitle}>
          New guides, <em>straight from us.</em>
        </h2>
        <p className={styles.nlSub}>
          Once or twice a month: the newest guides plus what we are seeing in the market that week. No fluff, no spam. Unsubscribe anytime.
        </p>
        <form className={styles.nlForm} onSubmit={handleForm('/api/subscribe')}>
          <input type="email" placeholder="name@email.com" aria-label="Email address" className={styles.nlInput} />
          <button type="submit" className={styles.nlBtn}>Keep me posted</button>
        </form>
        <p className={styles.nlReassure}>We treat your inbox the way we treat your house search: with care.</p>
      </section>

      {/* ---------- Closing ---------- */}
      <section className={styles.closing}>
        <p>
          Reading is a great start. When you are ready for the real thing,{' '}
          <Link href="/renting" className={styles.closingLink}>see how we help fellow expats rent in Amsterdam</Link>.
        </p>
      </section>

      {/* ---------- Footer ---------- */}
      <SiteFooter />

      <a
        href={CAL_URL}
        className={`${styles.stickyCta}${ctaVisible ? ` ${styles.stickyCtaVisible}` : ''}`}
      >
        Talk to us first
      </a>
    </div>
  );
}
