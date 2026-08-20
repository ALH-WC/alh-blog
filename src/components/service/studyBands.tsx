import Link from 'next/link';
import { REVIEWS } from '../../lib/renting';
import styles from '../../app/renting/renting.module.css';
import { EMPLOYER_LOGOS } from '../../lib/logos';

// Page-specific bands from the Asana content studies (July 2026). Each service
// page keeps the system hero and shell but gets its own body layout:
// /b2b: compare table, pillars, horizontal timeline, pricing table, dark quote form
// /letting: alternating rows, screening checklist, vertical step rail
// /buying: editorial argument, numbered step grid, costs table

export function LogoBar({ label, names }: { label: string; names: string[] }) {
  const logos = names
    .map((n) => EMPLOYER_LOGOS.find((l) => l.name === n))
    .filter((l): l is (typeof EMPLOYER_LOGOS)[number] => Boolean(l));
  return (
    <div className={styles.logobar2}>
      <span className={styles.lb}>{label}</span>
      <div className={styles.wordmarks}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {logos.map((l) => <img className={styles.logoImg} src={l.file} alt={l.name} key={l.name} />)}
      </div>
    </div>
  );
}

export function CompareBand({ title, without, withUs }: {
  title: React.ReactNode;
  without: string[];
  withUs: string[];
}) {
  return (
    <>
      <div className={styles.shead}>
        <span className={styles.eyebrow}>The difference</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>{title}</h2>
      </div>
      <div className={styles.cmp}>
        <div className={styles.cmpCol}>
          <span className={styles.eyebrow} style={{ color: '#B0A899' }}>Without us</span>
          {without.map((t) => <div className={styles.cmpRow} key={t}><span className={styles.m}>&minus;</span>{t}</div>)}
        </div>
        <div className={`${styles.cmpCol} ${styles.cmpUs}`}>
          <span className={styles.eyebrow}>With us</span>
          {withUs.map((t) => <div className={styles.cmpRow} key={t}><span className={styles.m}>+</span>{t}</div>)}
        </div>
      </div>
    </>
  );
}

export function PillarBand({ eyebrow, title, dek, items }: {
  eyebrow: string;
  title: React.ReactNode;
  dek?: string;
  items: { t: string; b: string }[];
}) {
  return (
    <>
      <div className={styles.shead}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>{title}</h2>
        {dek ? <p>{dek}</p> : null}
      </div>
      <div className={styles.pillars}>
        {items.map((it, i) => (
          <div className={styles.pillar} key={it.t}>
            <span className={styles.pillarN}>{String(i + 1).padStart(2, '0')}</span>
            <h3 className={styles.abroadH}>{it.t}</h3>
            <p className={styles.abroadP}>{it.b}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export function HSteps({ eyebrow, title, steps }: {
  eyebrow: string;
  title: React.ReactNode;
  steps: { t: string; b: string }[];
}) {
  return (
    <>
      <div className={styles.shead}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>{title}</h2>
      </div>
      <div className={styles.hsteps}>
        {steps.map((s, i) => (
          <div className={styles.hstep} key={s.t}>
            <span className={styles.hstepN}>{i + 1}</span>
            <h3>{s.t}</h3>
            <p>{s.b}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export function RowTable({ eyebrow, title, dek, rows, note }: {
  eyebrow: string;
  title: React.ReactNode;
  dek?: string;
  rows: [string, string][];
  note?: string;
}) {
  return (
    <>
      <div className={styles.shead}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>{title}</h2>
        {dek ? <p>{dek}</p> : null}
      </div>
      <div className={styles.rowtbl}>
        {rows.map(([k, v]) => (
          <div className={styles.rowtblRow} key={k}>
            <span className={styles.rowtblK}>{k}</span>
            <span className={styles.rowtblV}>{v}</span>
          </div>
        ))}
        {note ? <p className={styles.rowtblNote}>{note}</p> : null}
      </div>
    </>
  );
}

export function AltRows({ eyebrow, title, dek, rows }: {
  eyebrow: string;
  title: React.ReactNode;
  dek?: string;
  rows: { t: string; b: string }[];
}) {
  return (
    <>
      <div className={styles.shead}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>{title}</h2>
        {dek ? <p>{dek}</p> : null}
      </div>
      <div className={styles.altrows}>
        {rows.map((r, i) => (
          <div className={`${styles.altrow}${i % 2 ? ` ${styles.altrowFlip}` : ''}`} key={r.t}>
            <h3 className={styles.abroadH}>{r.t}</h3>
            <p className={styles.abroadP}>{r.b}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export function ChecklistBand({ eyebrow, title, intro, items, closing }: {
  eyebrow: string;
  title: React.ReactNode;
  intro: string;
  items: string[];
  closing?: string;
}) {
  return (
    <div className={styles.chkpanel}>
      <div className={styles.chkpanelIn}>
        <span className={styles.eyebrow} style={{ marginBottom: 16 }}>{eyebrow}</span>
        <h2 className={styles.chkTitle}>{title}</h2>
        <p className={styles.chkIntro}>{intro}</p>
        <div className={styles.chkList}>
          {items.map((t) => <div className={styles.chkItem} key={t}><span className={styles.m}>+</span>{t}</div>)}
        </div>
        {closing ? <p className={styles.chkClose}>{closing}</p> : null}
      </div>
    </div>
  );
}

export function VSteps({ eyebrow, title, steps }: {
  eyebrow: string;
  title: React.ReactNode;
  steps: { t: string; b: string; note?: string }[];
}) {
  return (
    <>
      <div className={styles.shead}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>{title}</h2>
      </div>
      <div className={styles.vsteps}>
        {steps.map((s, i) => (
          <div className={styles.vstep} key={s.t}>
            <span className={styles.vstepN}>{i + 1}</span>
            <div>
              <h3>{s.t}{s.note ? <span className={styles.vstepNote}> {s.note}</span> : null}</h3>
              <p>{s.b}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function Editorial({ eyebrow, big, cols }: {
  eyebrow: string;
  big: React.ReactNode;
  cols: string[];
}) {
  return (
    <div className={styles.editorial}>
      <span className={styles.eyebrow} style={{ marginBottom: 20 }}>{eyebrow}</span>
      <p className={styles.editorialBig}>{big}</p>
      <div className={styles.editorialCols}>
        {cols.map((c, i) => <p key={i}>{c}</p>)}
      </div>
    </div>
  );
}

export function StepGrid({ eyebrow, title, steps }: {
  eyebrow: string;
  title: React.ReactNode;
  steps: { t: string; b: string }[];
}) {
  return (
    <>
      <div className={styles.shead}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>{title}</h2>
      </div>
      <div className={styles.stepgrid}>
        {steps.map((s, i) => (
          <div className={styles.stepcell} key={s.t}>
            <span className={styles.pillarN}>{String(i + 1).padStart(2, '0')}</span>
            <h3 className={styles.abroadH}>{s.t}</h3>
            <p className={styles.abroadP}>{s.b}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export function FaqBand({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <>
      <div className={styles.shead}>
        <span className={styles.eyebrow}>FAQ</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>Frequently asked questions</h2>
      </div>
      <div className={styles.faqwrap} style={{ borderTop: '1px solid var(--hairline)' }}>
        {faqs.map((f) => (
          <div className={styles.faqrow} key={f.q}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </div>
    </>
  );
}

// The b2b closing band: dark ground (the one dark, #241d16 via --dark), left
// benefits, right compact corporate form. CTA per the approved brief.
export function QuoteFormBand() {
  return (
    <div className={styles.darkband} id="contact">
      <div className={styles.darkbandIn}>
        <div>
          <span className={`${styles.eyebrow} ${styles.eyebrowOnDark}`}>Get a proposal</span>
          <h2 className={styles.darkTitle}>Let&apos;s take housing<br />off your plate.</h2>
          <p className={styles.darkDek}>Tell us how many people you are relocating and we will send a tailored proposal within 24 hours.</p>
          <div className={styles.darkPoints}>
            {['One dedicated contact for HR', '3.5 weeks average placement', 'No placement, no fee'].map((t) => (
              <div key={t}><span className={styles.mOnDark}>+</span>{t}</div>
            ))}
          </div>
        </div>
        <div className={styles.dform}>
          <label>Company</label>
          <input className={styles.din} placeholder="Company name" />
          <label>Your name and role</label>
          <input className={styles.din} placeholder="Name, role" />
          <label>Work email</label>
          <input className={styles.din} type="email" placeholder="you@company.com" />
          <label>Employees relocating per year</label>
          <input className={styles.din} placeholder="1, 3, 10..." />
          <label>Anything we should know</label>
          <input className={styles.din} placeholder="Timelines, budgets, locations" />
          <button className={styles.dsubmit} type="button">Request a corporate quote</button>
        </div>
      </div>
    </div>
  );
}

// Three static review cards; the endless carousel stays a /renting signature.
export function ReviewTrio({ indices = [0, 1, 2] }: { indices?: number[] }) {
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
      <div className={styles.rgrid} style={{ borderBottom: '1px solid var(--hairline)' }}>
        {indices.map((i) => {
          const r = REVIEWS[i];
          return (
            <div className={styles.rev} key={r.who}>
              <q>{r.quote}</q>
              <p>{r.body}</p>
              <div className={styles.who}><b>{r.who}</b></div>
            </div>
          );
        })}
      </div>
    </>
  );
}
