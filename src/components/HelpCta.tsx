'use client';

import { useEffect, useState } from 'react';
import styles from './HelpCta.module.css';

const INTAKE_URL = 'https://cal.com/amsterdam-life-homes/intake';

// Cold readers from Google self-identify their need first (routes them to the
// relevant service page), with a direct video call as the secondary path.
const OPTIONS = [
  { href: '/renting', label: 'Rent a home', sub: 'Find and secure your rental' },
  { href: '/buying', label: 'Buy a home', sub: 'Search and buy, guided' },
  { href: '/letting', label: 'Let my place', sub: 'We handle your tenants' },
];

export function HelpCta() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(true);

  // Reveal once the reader is about a third of the way down the page.
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(max > 0 && window.scrollY / max > 0.3);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <aside
      className={`${styles.wrap}${visible ? ` ${styles.visible}` : ''}${open ? ` ${styles.open}` : ''}`}
      aria-label="How we can help you"
    >
      <div className={styles.panel}>
        <button type="button" className={styles.close} aria-label="Collapse" onClick={() => setOpen(false)}>
          &times;
        </button>
        <p className={styles.kicker}>New to Amsterdam?</p>
        <p className={styles.lead}>Tell us what you are looking for and we will show you exactly how we can help.</p>
        <div className={styles.options}>
          {OPTIONS.map((o) => (
            <a key={o.href} href={o.href} className={styles.option}>
              <span className={styles.optLabel}>{o.label}</span>
              <span className={styles.optSub}>{o.sub}</span>
              <span className={styles.optArrow}>→</span>
            </a>
          ))}
        </div>
        <a href={INTAKE_URL} target="_blank" rel="noreferrer" className={styles.callLink}>
          Prefer to talk? Book a free video call <span className={styles.ar}>↗</span>
        </a>
      </div>
      <button
        type="button"
        className={styles.tab}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="How we can help you"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10v10h14V10" />
          <path d="M10 20v-6h4v6" />
        </svg>
        <span className={styles.tabText}>How we help</span>
      </button>
    </aside>
  );
}
