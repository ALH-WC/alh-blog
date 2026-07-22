'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './SiteNav.module.css';

// "Contact us" opens our own contact page; the dedicated intake CTA books a
// Cal.com video call.
const CONTACT_URL = '/contact';
const INTAKE_URL = 'https://cal.com/amsterdam-life-homes/intake';

// Reconstructed from the ALH Framer "Navigation" component.
const LINKS = [
  { href: '/renting', label: 'Renting' },
  { href: '/buying', label: 'Buying' },
  { href: '/letting', label: 'Letting' },
  { href: '/b2b', label: 'Corporate' },
  { href: '/about', label: 'About us' },
  { href: '/blog', label: 'Our Amsterdam guide', current: true },
];

// Everything except the homepage sections ("/#…", still on the Framer site)
// is served by this app and can client-side navigate.
function NavLink({
  href,
  label,
  current,
  className,
  onClick,
}: {
  href: string;
  label: string;
  current?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const currentAttr = current ? { 'aria-current': 'page' as const } : {};
  if (href.startsWith('/') && !href.startsWith('/#')) {
    return (
      <Link href={href} className={className} onClick={onClick} {...currentAttr}>
        {label}
      </Link>
    );
  }
  return (
    <a
      href={href.startsWith('/#') ? `https://amsterdamlifehomes.com${href}` : href}
      className={className}
      onClick={onClick}
      {...currentAttr}
    >
      {label}
    </a>
  );
}

// `offset` shifts the whole bar up by that many pixels (scroll-linked by the
// blog index, so the bar moves at exactly the speed of the scroll).
// `brandLifted` hides the bar's own logo and contact button on wide screens,
// where the page renders viewport-fixed copies that never move.
export function SiteNav({ offset = 0, brandLifted = false }: { offset?: number; brandLifted?: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Lock background scroll while the drawer is open; close it if the viewport
  // grows to the desktop breakpoint.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onResize = () => {
      if (window.innerWidth >= 1200) setOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <nav
      className={`${styles.nav}${brandLifted ? ` ${styles.brandLifted}` : ''}`}
      style={offset > 0 && !open ? { transform: `translateY(${-offset}px)` } : undefined}
      aria-label="Primary"
    >
      <div className={styles.inner}>
        <Link href="/" className={styles.logoWrap} aria-label="Amsterdam Life Homes home">
          <span className={styles.logo}>Amsterdam Life Homes</span>
        </Link>

        <div className={styles.links}>
          {LINKS.map((l) => (
            <NavLink
              key={l.href}
              href={l.href}
              label={l.label}
              current={l.current}
              className={`${styles.link}${l.current ? ` ${styles.linkCurrent}` : ''}`}
            />
          ))}
        </div>

        <div className={styles.buttons}>
          <a href={CONTACT_URL} className={styles.cta}>Contact us</a>
        </div>

        <button
          type="button"
          className={`${styles.toggle}${open ? ` ${styles.toggleOpen}` : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.toggleLine} />
          <span className={styles.toggleLine} />
        </button>
      </div>

      <span className={styles.hairline} aria-hidden="true" />

      {open ? (
        <div className={styles.drawer}>
          <ul className={styles.drawerLinks}>
            {LINKS.map((l) => (
              <li key={l.href}>
                <NavLink href={l.href} label={l.label} current={l.current} onClick={close} />
              </li>
            ))}
          </ul>
          <div className={styles.drawerButtons}>
            <a className={`${styles.btn} ${styles.btnBlack}`} href={CONTACT_URL} onClick={close}>
              Contact us
            </a>
            <a
              className={`${styles.btn} ${styles.btnAlt}`}
              href={INTAKE_URL}
              target="_blank"
              rel="noreferrer"
              onClick={close}
            >
              Schedule a Free Video Intake Call &rarr;
            </a>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
