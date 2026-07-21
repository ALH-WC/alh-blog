'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SiteFooter } from '../../components/SiteFooter';
import {
  ABROAD_TXT, HERE_TXT, THIS_IS_US_TXT,
  FEE_P1, FEE_P2, FEE_P3, DEP_TXT, BAL_TXT, NORES_TXT, FORM_INTRO,
  INTAKE_URL, STEPS, REVIEWS, FAQS,
} from '../../lib/renting';
import styles from './renting.module.css';

const NAV_LINKS = [
  { href: '/renting', label: 'Renting', current: true },
  { href: '/buying', label: 'Buying' },
  { href: '/letting', label: 'Letting' },
  { href: '/b2b', label: 'Corporate' },
  { href: '/#about-us', label: 'About us' },
  { href: '/blog', label: 'Our Amsterdam guide', internal: true },
];

export default function RentingView() {
  const [navHide, setNavHide] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const [popShown, setPopShown] = useState(false);
  const [popDismissed, setPopDismissed] = useState(false);
  const [interest, setInterest] = useState('Renting');
  const [checks, setChecks] = useState<[boolean, boolean]>([false, false]);
  const lastY = useRef(0);
  const carRef = useRef<HTMLDivElement>(null);

  // Nav: hide on scroll down, glide back solid on scroll up; pop-up appears
  // after a quarter of the page.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // From the top, scrolling down simply hides the transparent nav; the
      // solid (light bg, dark items) design appears only when the nav is
      // revealed by scrolling up, and the top restores the transparent
      // original.
      if (y <= 80) {
        setNavSolid(false);
        setNavHide(false);
      } else if (y > lastY.current + 2) {
        if (y > 120) setNavHide(true);
      } else if (y < lastY.current - 2) {
        setNavHide(false);
        setNavSolid(true);
      }
      lastY.current = y;
      const q = (document.documentElement.scrollHeight - window.innerHeight) * 0.25;
      setPopShown(y > q);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Endless review carousel: doubled track, wrap inside the middle band.
  useEffect(() => {
    const car = carRef.current;
    if (!car) return;
    const wrap = () => {
      const half = car.scrollWidth / 2;
      if (!half) return;
      if (car.scrollLeft > half * 1.5) car.scrollLeft -= half;
      else if (car.scrollLeft < half * 0.5) car.scrollLeft += half;
    };
    const raf = requestAnimationFrame(() => { car.scrollLeft = car.scrollWidth / 2; });
    car.addEventListener('scroll', wrap, { passive: true });
    const iv = setInterval(wrap, 500);
    return () => { cancelAnimationFrame(raf); car.removeEventListener('scroll', wrap); clearInterval(iv); };
  }, []);

  const spin = (dir: number) => carRef.current?.scrollBy({ left: 452 * dir, behavior: 'smooth' });

  const revCards = [...REVIEWS, ...REVIEWS].map((r, i) => (
    <div className={styles.rev} key={i} aria-hidden={i >= REVIEWS.length}>
      <q>{r.quote}</q>
      <p>{r.body}</p>
      <div className={styles.rtags}>{r.tags.map((t) => <span key={t}>{t}</span>)}</div>
      <div className={styles.who}><b>{r.who}</b><span>{r.date}</span></div>
    </div>
  ));

  return (
    <div className={styles.page}>
      <nav
        className={`${styles.nav}${navHide ? ` ${styles.navHide}` : ''}${navSolid ? ` ${styles.navSolid}` : ''}`}
        aria-label="Primary"
      >
        <Link href="/blog" className={styles.navLogo}>Amsterdam Life Homes</Link>
        <div className={styles.navLinks}>
          {NAV_LINKS.map((l) =>
            l.internal ? (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ) : (
              <a key={l.href} href={`https://amsterdamlifehomes.com${l.href === '/renting' ? '/renting' : l.href}`} className={l.current ? styles.cur : undefined}>{l.label}</a>
            ),
          )}
        </div>
        <a className={styles.navBtn} href="#contact">Contact us</a>
        <button
          type="button"
          className={styles.burger}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span />
        </button>
      </nav>
      {menuOpen ? (
        <div className={styles.mnav}>
          <button type="button" className={styles.mnavClose} aria-label="Close menu" onClick={() => setMenuOpen(false)}>&times;</button>
          <div className={styles.mnavLinks}>
            {NAV_LINKS.map((l) =>
              l.internal ? (
                <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</Link>
              ) : (
                <a key={l.href} href={`https://amsterdamlifehomes.com${l.href}`}>{l.label}</a>
              ),
            )}
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact us</a>
          </div>
          <a className={styles.mnavCta} href={INTAKE_URL} target="_blank" rel="noreferrer">
            Schedule a free video intake call <span className={styles.ar}>&rarr;</span>
          </a>
        </div>
      ) : null}

      {/* HERO */}
      <div className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/renting/hero-canal.jpg" alt="Canal houses in Amsterdam daylight" />
        <div className={styles.heroIn}>
          <h1>Looking for a rental home<br />in Amsterdam?<br />We will find it for you.</h1>
          <p>We help fellow expats<br />rent, let, and buy their home<br />in Amsterdam.</p>
        </div>
      </div>

      {/* STATS */}
      <div className={`${styles.cells} ${styles.c4}`}>
        {[['250+', 'Expats housed'], ['3.5 wks', 'Average search'], ['8+ yrs', 'Of experience'], ['85%', 'From referrals']].map(([n, l]) => (
          <div className={styles.cell} key={l}><div className={styles.statN}>{n}</div><div className={styles.statL}>{l}</div></div>
        ))}
      </div>

      {/* TAG BAND */}
      <div className={styles.tagband}>
        <h2>Amsterdam&apos;s boutique housing agency,<br />run by local expats.</h2>
        <p>We have been in your shoes, know what you are looking for,<br />{' '}and simply treat you the way we want to be treated.</p>
        <a className={styles.tlink} href={INTAKE_URL} target="_blank" rel="noreferrer">
          Schedule a free video intake call <span className={styles.ar}>&rarr;</span>
        </a>
      </div>

      {/* GATE */}
      <span id="gate" />
      <div className={`${styles.shead} ${styles.sheadWide}`}>
        <span className={styles.eyebrow}>Are you in the right place?</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>Here is who we work with</h2>
        <p>We take a limited number of clients at a time so we can give everyone our full attention.<br />If the below fits, we would love to hear from you.</p>
      </div>
      <div className={`${styles.cells} ${styles.c2}`} style={{ borderTop: '1px solid var(--hairline)' }}>
        <div className={styles.cell}>
          <span className={styles.eyebrow} style={{ marginBottom: 20 }}>We can help you</span>
          {['Household income €80.000 and up', 'Rental budget €2200 and up', 'Singles, couples, and families', 'Rentals for 12+ months'].map((t) => (
            <div className={styles.qrow} key={t}><span className={styles.m}>+</span>{t}</div>
          ))}
        </div>
        <div className={styles.cell}>
          <span className={styles.eyebrow} style={{ marginBottom: 20, color: '#B0A899' }}>Outside our scope</span>
          {['Household income below €80.000', 'Rental budget below €2200', 'Students & guarantors', 'Short term rentals'].map((t) => (
            <div className={styles.qrow} key={t}><span className={styles.m}>&minus;</span>{t}</div>
          ))}
        </div>
      </div>

      {/* ABROAD OR HERE */}
      <div className={styles.shead}>
        <span className={styles.eyebrow}>Abroad or already here</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>We can help you, regardless of where you are</h2>
      </div>
      <div className={`${styles.cells} ${styles.c2}`} style={{ borderTop: '1px solid var(--hairline)' }}>
        <div className={styles.cell}><h3 className={styles.abroadH}>You are still abroad</h3><p className={styles.abroadP}>{ABROAD_TXT}</p></div>
        <div className={styles.cell}><h3 className={styles.abroadH}>You are already here</h3><p className={styles.abroadP}>{HERE_TXT}</p></div>
      </div>

      {/* PROCESS */}
      <div className={styles.two} id="how" style={{ marginTop: 104 }}>
        <div className={styles.panel}>
          <span className={styles.eyebrow}>How it works</span>
          <h2 className={styles.secT}>What you can expect</h2>
          <p>We are honest about the market, realistic about timelines. No utopias. Every step ends in something concrete.</p>
        </div>
        <div>
          {STEPS.map((s) => (
            <div className={styles.prow} key={s.n}>
              <span className={styles.num}>{s.n}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                {s.note ? <span className={styles.note}>{s.note}</span> : null}
                {s.formLink ? <a className={styles.tlink} href="#contact">Go to the form <span className={styles.ar}>&rarr;</span></a> : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* THIS IS US */}
      <div className={`${styles.cells} ${styles.c2} ${styles.thisus}`}>
        <div className={styles.cell} style={{ padding: '76px 56px' }}>
          <span className={styles.eyebrow} style={{ marginBottom: 20 }}>This is us</span>
          <h2 className={`${styles.secT} ${styles.hl}`}>We have been in your shoes.<br />That is why we do this.</h2>
          <p style={{ marginTop: 20, fontSize: 16, maxWidth: '60ch' }}>{THIS_IS_US_TXT}</p>
        </div>
        <div className={styles.cell} style={{ padding: '76px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p className={styles.thisusQuote}>Eight years and 250+ successful searches later, every client still works with us personally.</p>
        </div>
      </div>

      {/* REVIEWS */}
      <div className={`${styles.shead} ${styles.sheadWide}`} id="reviews">
        <span className={styles.eyebrow}>Google reviews</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>Don&apos;t just take our word for it</h2>
        <p>We believe that the true measure of our success lies in the satisfaction of our clients.<br />85% of our business comes from referrals.</p>
      </div>
      <div style={{ padding: '0 var(--gutter) 40px' }}>
        <a className={styles.tlink} href="https://www.google.com/search?q=amsterdam+life+homes+reviews" target="_blank" rel="noreferrer">Read all Google reviews <span className={styles.ar}>&#8599;</span></a>
      </div>
      <div className={styles.carwrap}>
        <div className={styles.carbtns}>
          <button type="button" onClick={() => spin(-1)} aria-label="Previous reviews">&larr;</button>
          <button type="button" onClick={() => spin(1)} aria-label="Next reviews">&rarr;</button>
        </div>
        <div className={styles.revCells} ref={carRef}>{revCards}</div>
      </div>

      {/* CLIENT LOGOS */}
      <div className={styles.logoband}>
        <span className={styles.lb}>Our clients work at</span>
        <div className={styles.marq}><div className={styles.mtrack}>
          {Array.from({ length: 12 }).map((_, i) => <div className={styles.ph} key={i}>Logo</div>)}
        </div></div>
      </div>

      {/* FEE */}
      <div className={styles.feewrap}>
        <div className={styles.feeleft}>
          <span className={styles.eyebrow}>What you pay</span>
          <h2>Our fee</h2>
          <div className={styles.feeAmount}>One month&apos;s rent + 21% VAT</div>
          <p>{FEE_P1}</p>
          <p style={{ marginTop: 10 }}>{FEE_P2}</p>
          <div className={styles.feeRule} />
          <p className={styles.fitalic}>{FEE_P3}</p>
        </div>
        <div className={styles.feeright}>
          {[['To get started', 'Deposit', DEP_TXT], ['When you sign', 'Remaining balance', BAL_TXT], ['No home found?', 'No further payment', NORES_TXT]].map(([e, t, b]) => (
            <div className={styles.feecell} key={t}><span className={styles.eyebrow}>{e}</span><h3>{t}</h3><p>{b}</p></div>
          ))}
        </div>
      </div>

      {/* OTHER SERVICES */}
      <div className={styles.shead}>
        <span className={styles.eyebrow}>Services</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>Explore our other services</h2>
      </div>
      <div className={styles.tiles}>
        {[
          ['/renting/hero-canal.jpg', 'Canal houses in Amsterdam', 'Thinking about buying instead?', 'https://amsterdamlifehomes.com/buying'],
          ['/renting/tile-letting.jpg', 'Bicycles on a canal bridge', 'Looking to let your property?', 'https://amsterdamlifehomes.com/letting'],
          ['/renting/tile-corporate.jpg', 'A leafy Amsterdam lane', 'Relocating employees to Amsterdam?', 'https://amsterdamlifehomes.com/b2b'],
        ].map(([img, alt, cap, href]) => (
          <a className={styles.tile} href={href} key={cap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={alt} />
            <span className={styles.cap}>{cap}</span><span className={styles.go}>&#8599;</span>
          </a>
        ))}
      </div>

      {/* GUIDE BAND */}
      <Link className={styles.guideband} href="/blog">
        <span className={styles.eyebrow} style={{ marginBottom: 12 }}>Learn about</span>
        <h3>Our Amsterdam guide&nbsp;<span className={styles.gar}>&#8599;</span></h3>
        <p>Anything you need to know when moving here&nbsp;<span className={`${styles.gar} ${styles.garSub}`}>&#8599;</span></p>
        <span className={styles.gcats}>
          <span className={styles.glabel}>Read about:</span>
          <span className={styles.gwin}><span className={styles.gin2}>Immigration &middot; Housing &middot; Neighborhoods &middot; Food &amp; Drinks &middot; Finance &amp; Work &middot; Life &amp; Culture</span></span>
        </span>
      </Link>

      {/* FAQ */}
      <div className={styles.shead}>
        <span className={styles.eyebrow}>FAQ</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>Frequently asked questions</h2>
      </div>
      <div className={styles.faqwrap} style={{ borderTop: '1px solid var(--hairline)' }}>
        {FAQS.map((f) => (
          <div className={styles.faqrow} key={f.q}>
            <h3>{f.q}</h3>
            {f.todo
              ? <p className={styles.todo}>Note for ALH: the live site shows placeholder template text here. This answer needs real copy before launch.</p>
              : <p>{f.a}</p>}
          </div>
        ))}
      </div>
      <div className={styles.faqClose} />

      {/* CONTACT FORM */}
      <div className={styles.formwrap} id="contact">
        <div className={styles.panel}>
          <span className={styles.eyebrow}>Get in touch</span>
          <h2 className={`${styles.secT} ${styles.formTitle}`}>Your home in Amsterdam<br />starts here</h2>
          <p style={{ marginTop: 20, fontSize: 16, maxWidth: 400 }}>{FORM_INTRO}</p>
          <div className={styles.panelContact}>
            <a href="mailto:home@amsterdamlifehomes.com">home@amsterdamlifehomes.com</a>
            <a href="tel:+31613749944">+31 6 1374 9944</a>
            <p>Mon - Fri: 9 AM - 5 PM CEST</p>
          </div>
        </div>
        <div className={styles.frm}>
          <label>I am interested in</label>
          <div className={styles.opts}>
            {['Renting', 'Buying', 'Letting', 'B2B'].map((o) => (
              <button
                type="button"
                key={o}
                className={`${styles.opt}${interest === o ? ` ${styles.optSel}` : ''}`}
                onClick={() => setInterest(o)}
              >{o}</button>
            ))}
          </div>
          <div className={styles.frow}>
            <div><label>Full name</label><input className={styles.in} placeholder="Your first name" /></div>
            <div><label>Last name</label><input className={styles.in} placeholder="Your last name" /></div>
          </div>
          <div className={styles.frow}>
            <div><label>Email</label><input className={styles.in} type="email" placeholder="you@email.com" /></div>
            <div><label>Phone number</label><input className={styles.in} placeholder="+1 ..." /></div>
          </div>
          <label>Maximum monthly rent I can pay</label>
          <input className={styles.in} placeholder="€2200 or more" />
          <div className={styles.help}>We can only help with rental budgets starting at €2200. <a href="#gate">See our requirements</a></div>
          <label>A bit about yourself and what you are looking for</label>
          <input className={styles.in} placeholder="Tell us about your move" />
          {['Subscribe to our Amsterdam newsletter', 'I agree to the privacy policy'].map((t, i) => (
            <div className={styles.chk} key={t} onClick={() => setChecks((c) => (i === 0 ? [!c[0], c[1]] : [c[0], !c[1]]))}>
              <span className={`${styles.box}${checks[i] ? ` ${styles.boxOn}` : ''}`} />{t}
            </div>
          ))}
          <button className={styles.submit} type="button">Submit form</button>
        </div>
      </div>

      <SiteFooter />

      {/* CTA POP-UP */}
      {!popDismissed ? (
        <div className={`${styles.ctapop}${popShown ? ` ${styles.ctapopShow}` : ''}`} aria-hidden={!popShown}>
          <button className={styles.x} type="button" aria-label="Close" onClick={() => setPopDismissed(true)}>&times;</button>
          <h4>Let&apos;s find your home.</h4>
          <p>Tell us what you are looking for,<br />or talk to us directly.</p>
          <a className={styles.pbtn} href="#contact">Fill in the form<span className={styles.pnote}>We reply within 24 hours</span></a>
          <a className={`${styles.pbtn} ${styles.pbtnAlt}`} href={INTAKE_URL} target="_blank" rel="noreferrer">Schedule a free video call</a>
        </div>
      ) : null}
    </div>
  );
}
