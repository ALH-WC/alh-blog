'use client';

import { useState } from 'react';
import styles from './InlineSignup.module.css';

// The newsletter signup embedded in the middle of an article (same content as
// the blog pop-up, but part of the page rather than an overlay).
export function InlineSignup() {
  const [sent, setSent] = useState(false);

  return (
    <aside className={styles.band} aria-label="Newsletter signup">
      {sent ? (
        <p className={styles.thanks}>Thank you. Our next guide will land in your inbox.</p>
      ) : (
        <>
          <span className={styles.kicker}>Stay in the loop</span>
          <h3 className={styles.title}>
            New guides, <em>straight from us.</em>
          </h3>
          <p className={styles.lead}>Receive our articles by email. No fluff, no spam. Unsubscribe anytime.</p>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              const email = e.currentTarget.querySelector<HTMLInputElement>('input')?.value ?? '';
              fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
              }).catch(() => {});
              setSent(true);
            }}
          >
            <input type="email" required placeholder="name@email.com" aria-label="Email address" />
            <button type="submit">Keep me posted</button>
          </form>
          <p className={styles.fine}>We treat your inbox the way we treat your house search: with care.</p>
        </>
      )}
    </aside>
  );
}
