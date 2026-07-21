'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SiteFooter } from '../SiteFooter';
import { INTAKE_URL } from '../../lib/renting';
import styles from '../../app/renting/renting.module.css';

// The service-page frame from the design system (the renting page is the
// reference implementation): transparent nav over the photo hero with the
// hide-on-down / solid-on-up behavior, the shared hamburger drawer, the CTA
// pop-up after a quarter of the page, and the shared footer. Page sections
// render as children between nav and footer.
const NAV_LINKS = [
  { href: '/renting', label: 'Renting' },
  { href: '/buying', label: 'Buying' },
  { href: '/letting', label: 'Letting' },
  { href: '/b2b', label: 'Corporate' },
  { href: '/#about-us', label: 'About us' },
  { href: '/blog', label: 'Our Amsterdam guide', internal: true },
];

// `heroless` renders the solid nav from the start: pages without a photo hero
// have no dark ground for the transparent paper items to sit on.
export function ServiceShell({ current, heroless = false, children }: { current: string; heroless?: boolean; children: React.ReactNode }) {
  const [navHide, setNavHide] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const [popShown, setPopShown] = useState(false);
  const [popDismissed, setPopDismissed] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
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

  return (
    <div className={styles.page}>
      <nav
        className={`${styles.nav}${navHide ? ` ${styles.navHide}` : ''}${heroless || navSolid ? ` ${styles.navSolid}` : ''}`}
        aria-label="Primary"
      >
        <Link href="/blog" className={styles.navLogo}>Amsterdam Life Homes</Link>
        <div className={styles.navLinks}>
          {NAV_LINKS.map((l) =>
            l.internal ? (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ) : (
              <a key={l.href} href={`https://amsterdamlifehomes.com${l.href}`} className={l.href === current ? styles.cur : undefined}>{l.label}</a>
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
          <div className={styles.mnavHead}>
            <Link href="/blog" className={styles.mnavLogo} onClick={() => setMenuOpen(false)}>Amsterdam Life Homes</Link>
            <button type="button" className={styles.mnavClose} aria-label="Close menu" onClick={() => setMenuOpen(false)}>
              <span /><span />
            </button>
          </div>
          <div className={styles.mnavLinks}>
            {NAV_LINKS.map((l) =>
              l.internal ? (
                <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</Link>
              ) : (
                <a key={l.href} href={`https://amsterdamlifehomes.com${l.href}`}>{l.label}</a>
              ),
            )}
          </div>
          <div className={styles.mnavBtns}>
            <a className={styles.mnavBtn} href="#contact" onClick={() => setMenuOpen(false)}>Contact us</a>
            <a className={`${styles.mnavBtn} ${styles.mnavBtnAlt}`} href={INTAKE_URL} target="_blank" rel="noreferrer">
              Schedule a Free Video Intake Call &rarr;
            </a>
          </div>
        </div>
      ) : null}

      {children}

      <SiteFooter />

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
