import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import styles from './PortableBody.module.css';

interface StepsValue {
  steps?: { _key: string; lead?: string; text?: string }[];
}
interface QuoteValue {
  quote?: string;
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className={styles.p}>{children}</p>,
    h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
    h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
  },
  marks: {
    strong: ({ children }) => <strong className={styles.strong}>{children}</strong>,
    em: ({ children }) => <em className={styles.em}>{children}</em>,
    link: ({ children, value }) => {
      const href = (value as { href?: string })?.href ?? '#';
      const external = /^https?:\/\//.test(href);
      return (
        <a
          className={styles.link}
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    // Ordered "steps" callout: band bg, accent left border, Spectral numbers.
    stepsCallout: ({ value }) => {
      const steps = (value as StepsValue).steps ?? [];
      return (
        <ol className={styles.steps}>
          {steps.map((step, i) => (
            <li key={step._key} className={styles.step}>
              <span className={styles.stepNum}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.stepBody}>
                {step.lead ? <strong className={styles.stepLead}>{step.lead}</strong> : null}
                {step.lead && step.text ? ' ' : null}
                {step.text}
              </span>
            </li>
          ))}
        </ol>
      );
    },
    // Centered Spectral italic pull quote.
    pullQuote: ({ value }) => (
      <figure className={styles.quoteFigure}>
        <blockquote className={styles.quote}>{(value as QuoteValue).quote}</blockquote>
      </figure>
    ),
  },
};

export function PortableBody({ value }: { value: PortableTextBlock[] }) {
  if (!value || value.length === 0) return null;
  return <PortableText value={value} components={components} />;
}
