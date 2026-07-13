import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import { urlForImage } from '../sanity/lib/image';
import styles from './PortableBody.module.css';

interface StepsValue {
  steps?: { _key: string; lead?: string; text?: string }[];
}
interface QuoteValue {
  quote?: string;
  attribution?: string;
}
interface CalloutValue {
  label?: string;
  text?: string;
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className={styles.p}>{children}</p>,
    h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
    h3: ({ children }) => <h3 className={styles.h3}>{children}</h3>,
  },
  list: {
    bullet: ({ children }) => <ul className={styles.ul}>{children}</ul>,
    number: ({ children }) => <ol className={styles.olPlain}>{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className={styles.li}>{children}</li>,
    number: ({ children }) => <li className={styles.li}>{children}</li>,
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
    pullQuote: ({ value }) => {
      const v = value as QuoteValue;
      return (
        <blockquote className={styles.quote}>
          <p>{v.quote}</p>
          {v.attribution ? <footer className={styles.quoteWho}>{v.attribution}</footer> : null}
        </blockquote>
      );
    },
    callout: ({ value }) => {
      const v = value as CalloutValue;
      return (
        <div className={styles.callout}>
          {v.label ? <span className={styles.calloutLabel}>{v.label}</span> : null}
          <p>{v.text}</p>
        </div>
      );
    },
    inlineImage: ({ value }) => {
      const built = urlForImage(value as never);
      const src = built ? built.width(1400).url() : null;
      const v = value as { alt?: string; caption?: string };
      if (!src) return null;
      return (
        <figure className={styles.figure}>
          <div className={styles.figFrame}>
            <img src={src} alt={v.alt ?? ''} loading="lazy" />
          </div>
          {v.caption ? <figcaption className={styles.figCap}>{v.caption}</figcaption> : null}
        </figure>
      );
    },
  },
};

export function PortableBody({ value }: { value: PortableTextBlock[] }) {
  if (!value || value.length === 0) return null;
  return <PortableText value={value} components={components} />;
}
