'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FORM_INTRO, INTAKE_URL, REVIEWS } from '../../lib/renting';
import styles from '../../app/renting/renting.module.css';

// The reusable service-page bands from the design system. Every band renders
// with the renting page's stylesheet so all pages share one implementation of
// the Warm Paper parts.

// The approved in-hero data pile (bottom-right of the photo). Render inside
// a .hero div. Photo-hero pages use this; heroless pages keep StatsBand.
export function HeroStats({ stats }: { stats?: [string, string][] } = {}) {
  const rows = stats ?? [['250+', 'Expats housed'], ['3.5 wks', 'Average search'], ['8+ yrs', 'Of experience'], ['85%', 'From referrals']];
  return (
    <div className={styles.heroStats}>
      {rows.map(([n, l]) => (
        <div className={styles.cellS} key={l}><div className={styles.hsN}>{n}</div><div className={styles.hsL}>{l}</div></div>
      ))}
    </div>
  );
}

export function StatsBand({ stats }: { stats?: [string, string][] } = {}) {
  const rows = stats ?? [['250+', 'Expats housed'], ['3.5 wks', 'Average search'], ['8+ yrs', 'Of experience'], ['85%', 'From referrals']];
  return (
    <div className={`${styles.cells} ${styles.c4}`}>
      {rows.map(([n, l]) => (
        <div className={styles.cell} key={l}><div className={styles.statN}>{n}</div><div className={styles.statL}>{l}</div></div>
      ))}
    </div>
  );
}

export function TagBand() {
  return (
    <div className={styles.tagband}>
      <h2>Amsterdam&apos;s boutique housing agency,<br />run by local expats.</h2>
      <p>We have been in your shoes, know what you are looking for,<br />{' '}and simply treat you the way we want to be treated.</p>
      <a className={styles.tlink} href={INTAKE_URL} target="_blank" rel="noreferrer">
        Schedule a free video intake call <span className={styles.ar}>&rarr;</span>
      </a>
    </div>
  );
}

export function ThreeUp({ eyebrow, title, dek, items }: {
  eyebrow: string;
  title: React.ReactNode;
  dek: string;
  items: { t: string; b: string }[];
}) {
  return (
    <>
      <div className={styles.shead}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>{title}</h2>
        <p>{dek}</p>
      </div>
      <div className={`${styles.cells} ${styles.c3}`} style={{ borderTop: '1px solid var(--hairline)' }}>
        {items.map((it) => (
          <div className={styles.cell} key={it.t}>
            <h3 className={styles.abroadH}>{it.t}</h3>
            <p className={styles.abroadP}>{it.b}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export function ReviewsBand() {
  const carRef = useRef<HTMLDivElement>(null);

  // Endless carousel: doubled track, wrap inside the middle band.
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

  return (
    <>
      <div className={`${styles.shead} ${styles.sheadWide}`} id="reviews">
        <span className={styles.eyebrow}>Google reviews</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>Don&apos;t just take our word for it</h2>
        <p>We believe that the true measure of our success lies in the satisfaction of our clients.<br />85% of our business comes from referrals.</p>
      </div>
      <div style={{ padding: '0 var(--gutter) 40px' }}>
        <Link className={styles.tlink} href="/reviews">Read all our reviews <span className={styles.ar}>&rarr;</span></Link>
      </div>
      <div className={styles.carwrap}>
        <div className={styles.carbtns}>
          <button type="button" onClick={() => spin(-1)} aria-label="Previous reviews">&larr;</button>
          <button type="button" onClick={() => spin(1)} aria-label="Next reviews">&rarr;</button>
        </div>
        <div className={styles.revCells} ref={carRef}>
          {[...REVIEWS, ...REVIEWS].map((r, i) => (
            <div className={styles.rev} key={i} aria-hidden={i >= REVIEWS.length}>
              <q>{r.quote}</q>
              <p>{r.body}</p>
              <div className={styles.rtags}>{r.tags.map((t) => <span key={t}>{t}</span>)}</div>
              <div className={styles.who}><b>{r.who}</b><span>{r.date}</span></div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function LogoBand() {
  return (
    <div className={styles.logoband}>
      <span className={styles.lb}>Our clients work at</span>
      <div className={styles.marq}><div className={styles.mtrack}>
        {Array.from({ length: 12 }).map((_, i) => <div className={styles.ph} key={i}>Logo</div>)}
      </div></div>
    </div>
  );
}

export function ServiceTiles({ tiles }: { tiles: [string, string, string, string][] }) {
  return (
    <>
      <div className={styles.shead}>
        <span className={styles.eyebrow}>Services</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>Explore our other services</h2>
      </div>
      <div className={styles.tiles}>
        {tiles.map(([img, alt, cap, href]) => (
          <a className={styles.tile} href={href} key={cap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={alt} />
            <span className={styles.cap}>{cap}</span><span className={styles.go}>&#8599;</span>
          </a>
        ))}
      </div>
    </>
  );
}

export function GuideBand() {
  return (
    <Link className={styles.guideband} href="/blog">
      <span className={styles.eyebrow} style={{ marginBottom: 12 }}>Learn about</span>
      <h3>Our Amsterdam guide&nbsp;<span className={styles.gar}>&#8599;</span></h3>
      <p>Anything you need to know when moving here&nbsp;<span className={`${styles.gar} ${styles.garSub}`}>&#8599;</span></p>
      <span className={styles.gcats}>
        <span className={styles.glabel}>Read about:</span>
        <span className={styles.gwin}><span className={styles.gin2}>Immigration &middot; Housing &middot; Neighborhoods &middot; Food &amp; Drinks &middot; Finance &amp; Work &middot; Life &amp; Culture</span></span>
      </span>
    </Link>
  );
}

export function ContactBand({ defaultInterest, title, intro, submitLabel }: {
  defaultInterest: string;
  title?: React.ReactNode;
  intro?: string;
  submitLabel?: string;
}) {
  const [interest, setInterest] = useState(defaultInterest);
  const [checks, setChecks] = useState<[boolean, boolean]>([false, false]);

  return (
    <div className={styles.formwrap} id="contact">
      <div className={styles.panel}>
        <span className={styles.eyebrow}>Get in touch</span>
        <h2 className={`${styles.secT} ${styles.formTitle}`}>{title ?? <>Your home in Amsterdam<br />starts here</>}</h2>
        <p style={{ marginTop: 20, fontSize: 16, maxWidth: 400 }}>{intro ?? FORM_INTRO}</p>
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
        <div className={styles.help}>We can only help with rental budgets starting at €2200. <Link href="/renting#gate">See our requirements</Link></div>
        <label>A bit about yourself and what you are looking for</label>
        <input className={styles.in} placeholder="Tell us about your move" />
        {['Subscribe to our Amsterdam newsletter', 'I agree to the privacy policy'].map((t, i) => (
          <div className={styles.chk} key={t} onClick={() => setChecks((c) => (i === 0 ? [!c[0], c[1]] : [c[0], !c[1]]))}>
            <span className={`${styles.box}${checks[i] ? ` ${styles.boxOn}` : ''}`} />{t}
          </div>
        ))}
        <button className={styles.submit} type="button">{submitLabel ?? 'Submit form'}</button>
      </div>
    </div>
  );
}
