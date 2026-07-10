'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '../app/blog/blog.module.css';

const CAL_URL = 'https://cal.com/amsterdam-life-homes/intake';

const LINKS = [
  { href: '/renting', label: 'Renting' },
  { href: '/buying', label: 'Buying' },
  { href: '/letting', label: 'Letting' },
  { href: '/b2b', label: 'Corporate' },
  { href: '/#about-us', label: 'About us' },
];

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <nav className={styles.nav} aria-label="Primary">
        <Link href="/blog" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden />
          <span className={styles.brandName}>Amsterdam Life Homes</span>
        </Link>
        <ul className={styles.navLinks}>
          {LINKS.map((l) => (
            <li key={l.href}><a href={l.href} className={styles.navLink}>{l.label}</a></li>
          ))}
          <li><Link href="/blog" aria-current="page" className={styles.navCurrent}>The Guide</Link></li>
        </ul>
        <a href={CAL_URL} className={styles.contactBtn}>Contact us</a>
        <button
          type="button"
          className={styles.menuBtn}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            {menuOpen ? <path d="M6 6l12 12M6 18L18 6" /> : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
          </svg>
        </button>
      </nav>
      {menuOpen ? (
        <ul
          className={styles.navLinks}
          style={{
            display: 'flex', flexDirection: 'column', position: 'fixed', top: 'var(--nav-height)',
            left: 0, right: 0, zIndex: 99, background: 'rgba(20,18,15,.97)', padding: '18px 20px', gap: 4,
          }}
        >
          {LINKS.map((l) => (
            <li key={l.href}><a href={l.href} className={styles.navLink}>{l.label}</a></li>
          ))}
          <li><Link href="/blog" className={styles.navCurrent}>The Guide</Link></li>
        </ul>
      ) : null}
    </>
  );
}
