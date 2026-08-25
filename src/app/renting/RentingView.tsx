'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SiteFooter } from '../../components/SiteFooter';
import { GuideBand } from '../../components/service/bands';
import {
  ABROAD_TXT, HERE_TXT,
  FEE_P1, FEE_P2, FEE_P3, DEP_TXT, BAL_TXT, NORES_TXT, FORM_INTRO,
  INTAKE_URL, STEPS, REVIEWS, FAQS,
} from '../../lib/renting';
import styles from './renting.module.css';
import { useLeadSubmit } from '../../components/service/leadForm';

// "About us" is still a section on the live Framer homepage; everything else
// is served by this app.
const NAV_LINKS = [
  { href: '/renting', label: 'Renting', current: true, internal: true },
  { href: '/buying', label: 'Buying', internal: true },
  { href: '/letting', label: 'Letting', internal: true },
  { href: '/b2b', label: 'Corporate', internal: true },
  { href: '/about', label: 'About us', internal: true },
  { href: '/blog', label: 'Our Amsterdam guide', internal: true },
];

// The three review cells from the approved "ALH Renting 2c" mockup.
const RENTING_REVIEWS = ['Sally', 'Chad', 'Bene'];

// The page body follows the approved page mockup one-to-one: positioning,
// gate (right cell on sand), photo band, abroad/here, process rows, fee
// narrative + three cards, three review cells, FAQ rows (one on sand),
// contact split, other services. The nav, hero, stats pile, drawer,
// pop-up, and footer are the approved designs and stay untouched.
export default function RentingView() {
  const [navHide, setNavHide] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const [popShown, setPopShown] = useState(false);
  const [interest, setInterest] = useState('Renting');
  const [checks, setChecks] = useState<[boolean, boolean]>([false, false]);
  const { status: leadStatus, submit: submitLead } = useLeadSubmit();
  const lastY = useRef(0);

  // Nav: hide on scroll down, glide back solid on scroll up; pop-up appears
  // after a quarter of the page.
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
      const footer = document.querySelector('footer');
      const nearFooter = !!footer && footer.getBoundingClientRect().top < window.innerHeight - 60;
      setPopShown(y > q && !nearFooter);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const cells = RENTING_REVIEWS
    .map((n) => REVIEWS.find((r) => r.who.includes(n)))
    .filter((r): r is (typeof REVIEWS)[number] => Boolean(r));

  return (
    <div className={styles.page}>
      <nav
        className={`${styles.nav}${navHide ? ` ${styles.navHide}` : ''}${navSolid ? ` ${styles.navSolid}` : ''}`}
        aria-label="Primary"
      >
        <Link href="/" className={styles.navLogo}>Amsterdam Life Homes</Link>
        <div className={styles.navLinks}>
          {NAV_LINKS.map((l) =>
            l.internal ? (
              <Link key={l.href} href={l.href} className={l.current ? styles.cur : undefined}>{l.label}</Link>
            ) : (
              <a key={l.href} href={`https://amsterdamlifehomes.com${l.href}`} className={l.current ? styles.cur : undefined}>{l.label}</a>
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
            <Link href="/" className={styles.mnavLogo} onClick={() => setMenuOpen(false)}>Amsterdam Life Homes</Link>
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

      {/* HERO (approved, untouched) */}
      <div className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/renting/hero-canal.jpg" alt="Canal houses in Amsterdam daylight" />
        <div className={styles.heroIn}>
          <h1>Looking for a rental home<br />in Amsterdam?<br />We will find it for you.</h1>
          <p>We help fellow expats<br />rent, let, and buy their home<br />in Amsterdam.</p>
        </div>
        <div className={styles.heroStats}>
          {[['250+', 'Expats housed'], ['3.5 wks', 'Average search'], ['9+ yrs', 'Of experience'], ['85%', 'From referrals']].map(([n, l]) => (
            <div className={styles.cellS} key={l}><div className={styles.hsN}>{n}</div><div className={styles.hsL}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* POSITIONING */}
      <div className={styles.qIntro} style={{ paddingBottom: 170 }}>
        <span className={styles.eyebrow}>Renting in Amsterdam</span>
        <h2 className={`${styles.qT} ${styles.qTBig} ${styles.qStmtT}`}>Amsterdam&apos;s boutique housing agency,<br />run by local expats.</h2>
        <p className={styles.qDek} style={{ maxWidth: '52ch', fontSize: 17 }}>We have been in your shoes, we know what you are looking for, and we simply treat you the way we want to be treated. We search, view, and negotiate for you, until the keys are in your hand.</p>
        <a className={styles.qLink} href={INTAKE_URL} target="_blank" rel="noreferrer" style={{ marginTop: 20 }}>Schedule a free video call <span className={styles.ar}>&rarr;</span></a>
      </div>

      {/* GATE */}
      <span id="gate" />
      <div className={styles.qIntro} style={{ borderTop: '1px solid #EAE7E1', paddingTop: 100 }}>
        <span className={styles.eyebrow}>Are you in the right place?</span>
        <h2 className={styles.qT}>Here is who we work with</h2>
        <p className={styles.qDek}>We take a limited number of clients at a time so we can give everyone our full attention. If the below fits, we would love to hear from you.</p>
      </div>
      <div className={styles.qCells2}>
        {/* Both cells white; the left one leads with an espresso frame (feedback 6) */}
        <div className={`${styles.qCell} ${styles.qGateLead}`}>
          <span className={styles.qNum} style={{ textTransform: 'uppercase' }}>We can help you</span>
          <h3 className={styles.qCellT}>A focused search, with our full attention</h3>
          <div>
            {['Household income €80.000 and up', 'Rental budget €2200 and up', 'Singles, couples, and families', 'Rentals for 12 months or longer'].map((t) => (
              <div className={styles.qLine} key={t}>{t}</div>
            ))}
          </div>
        </div>
        <div className={styles.qCell}>
          <span className={styles.qNum} style={{ textTransform: 'uppercase' }}>Outside our scope</span>
          <h3 className={styles.qCellT}>Where we are not the right agency</h3>
          <div>
            {['Household income below €80.000', 'Rental budget below €2200', 'Students and guarantors', 'Short term rentals'].map((t) => (
              <div className={styles.qLine} key={t}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* PHOTO BAND */}
      <div className={styles.qBand} style={{ gridTemplateColumns: '1.4fr 1fr', gridAutoRows: '460px' }}>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/renting/hero-canal.jpg" alt="Canal houses in Amsterdam daylight" />
          <div className={styles.qCap}>Canal houses in daylight</div>
        </div>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/buying/hero.webp" alt="A warm Amsterdam apartment living room" />
          <div className={styles.qCap}>A warm Amsterdam living room</div>
        </div>
      </div>

      {/* ABROAD OR HERE */}
      <div className={styles.qIntro}>
        <span className={styles.eyebrow}>Abroad or already here</span>
        <h2 className={styles.qT}>We can help you, wherever you are right now</h2>
      </div>
      <div className={styles.qCells2}>
        <div className={styles.qCell}>
          <span className={styles.qNum} style={{ textTransform: 'uppercase' }}>Still abroad</span>
          <h3 className={styles.qCellT}>You are still in another country</h3>
          <p>{ABROAD_TXT}</p>
          <div className={styles.qNoteBr}>No Dutch bank account, BSN, or local documents needed to start.</div>
        </div>
        <div className={styles.qCell}>
          <span className={styles.qNum} style={{ textTransform: 'uppercase' }}>Already here</span>
          <h3 className={styles.qCellT}>You are already in Amsterdam</h3>
          <p>{HERE_TXT}</p>
          <div className={styles.qNoteBr}>We attend in person, or by video if your schedule does not allow it.</div>
        </div>
      </div>

      {/* PROCESS */}
      <div className={styles.qProcess} id="how" style={{ borderTop: 0 }}>
        <div className={styles.qProcIntro}>
          <span className={styles.eyebrow}>How it works</span>
          <h2 className={styles.qT}>What you can expect</h2>
          <p>We are honest about the market and realistic about timelines. No utopias. Every step ends in something concrete.</p>
        </div>
        <div>
          {STEPS.map((s) => (
            <div className={styles.qStep} key={s.n}>
              <span className={styles.qStepN}>{s.n}</span>
              <div className={styles.qStepIn}>
                <span className={styles.qStepT}>{s.title}</span>
                <p>{s.body}</p>
                {s.formLink ? <a className={`${styles.qLink} ${styles.qLinkSm}`} href="#contact" style={{ marginTop: 4 }}>Go to the form <span className={styles.ar}>&rarr;</span></a> : null}
                {s.note ? <span className={styles.qStepNote}>{s.note}</span> : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FEE */}
      <div className={styles.qFee}>
        <div className={styles.qFeeL}>
          <span className={styles.eyebrow}>What you pay</span>
          <h2 className={styles.qFeeTitle}>Our fee</h2>
          <div className={styles.qFeePrice}>One month&apos;s rent + 21% VAT</div>
          <p>{FEE_P1}</p>
          <p>{FEE_P2}</p>
          <p className={styles.qFeeQuote}>{FEE_P3}</p>
        </div>
        <div className={styles.qFeeR}>
          {[['To get started', 'Deposit', DEP_TXT, false], ['When you sign', 'Remaining balance', BAL_TXT, true], ['No home found?', 'No further payment', NORES_TXT, false]].map(([e, t, b, sand]) => (
            <div className={`${styles.qCard}${sand ? ` ${styles.qCardSand}` : ''}`} key={t as string}>
              <span className={styles.qNum} style={{ textTransform: 'uppercase' }}>{e}</span>
              <h3 className={styles.qCardT}>{t}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
      </div>

      {/* REVIEWS */}
      <div className={styles.qIntroRow} id="reviews">
        <div className={styles.qIntroTxt}>
          <span className={styles.eyebrow}>Google reviews</span>
          <h2 className={styles.qT}>Do not just take our word for it</h2>
          <p className={styles.qDek}>The true measure of our work is what our clients say afterwards.<br />85% of our business comes from referrals.</p>
        </div>
        <Link className={`${styles.qLink} ${styles.qLinkSm}`} href="/reviews">Read all our reviews <span className={styles.ar}>&rarr;</span></Link>
      </div>
      <div className={styles.rgrid} style={{ borderTop: '1px solid #EAE7E1', borderBottom: '1px solid #EAE7E1' }}>
        {cells.map((r) => (
          <div className={styles.rev} key={r.who} style={{ border: 0, borderRight: '1px solid #EAE7E1' }}>
            <q>{r.quote}</q>
            <p>{r.body}</p>
            <div className={styles.who}><b>{r.who}</b></div>
            <div className={styles.rtags}>{r.tags.map((t) => <span key={t}>{t}</span>)}</div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className={styles.qIntro}>
        <span className={styles.eyebrow}>FAQ</span>
        <h2 className={styles.qT}>Frequently asked questions</h2>
      </div>
      <div className={styles.qFaq}>
        {FAQS.map((f) => (
          <div className={`${styles.qFaqRow}${f.q.includes('still abroad') ? ` ${styles.qFaqRowSand}` : ''}`} key={f.q}>
            <h3 className={styles.qFaqQ}>{f.q}</h3>
            {f.todo
              ? <p className={styles.todo}>Note for ALH: the live site shows placeholder template text here. This answer needs real copy before launch.</p>
              : <p>{f.a}</p>}
          </div>
        ))}
      </div>

      {/* CONTACT */}
      <div className={styles.qContact} id="contact" style={{ borderTop: 0 }}>
        <div className={styles.qConL}>
          <span className={styles.eyebrow}>Get in touch</span>
          <h2 className={styles.qT}>Your home in Amsterdam<br />starts here</h2>
          <p>{FORM_INTRO}</p>
          <div className={styles.qConLines}>
            <a href="mailto:home@amsterdamlifehomes.com">home@amsterdamlifehomes.com</a>
            <a href="tel:+31613749944">+31 6 1374 9944</a>
            Mon to Fri, 9 to 5 CEST
          </div>
        </div>
        <div className={styles.qConR}>
          <form
            className={styles.frm}
            style={{ padding: 0 }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!checks[1]) return;
              void submitLead(e.currentTarget, { interest, newsletter: checks[0] });
            }}
          >
            <label>I am interested in</label>
            <div className={styles.opts}>
              {['Renting', 'Buying', 'Letting', 'Corporate'].map((o) => (
                <button
                  type="button"
                  key={o}
                  className={`${styles.opt}${interest === o ? ` ${styles.optSel}` : ''}`}
                  onClick={() => setInterest(o)}
                >{o}</button>
              ))}
            </div>
            <div className={styles.frow}>
              <div><label>Full name</label><input className={styles.in} name="firstName" required placeholder="Your first name" /></div>
              <div><label>Last name</label><input className={styles.in} name="lastName" placeholder="Your last name" /></div>
            </div>
            <div className={styles.frow}>
              <div><label>Email</label><input className={styles.in} name="email" type="email" required placeholder="you@email.com" /></div>
              <div><label>Phone number</label><input className={styles.in} name="phone" placeholder="+1 ..." /></div>
            </div>
            <label>Maximum monthly rent I can pay</label>
            <input className={styles.in} name="budget" placeholder="€2200 or more" />
            <div className={styles.help}>We can only help with rental budgets starting at €2200. <a href="#gate">See our requirements</a></div>
            <label>A bit about yourself and what you are looking for</label>
            <input className={styles.in} name="message" placeholder="Tell us about your move" />
            {['Subscribe to our Amsterdam newsletter', 'I agree to the privacy policy'].map((t, i) => (
              <div className={styles.chk} key={t} onClick={() => setChecks((c) => (i === 0 ? [!c[0], c[1]] : [c[0], !c[1]]))}>
                <span className={`${styles.box}${checks[i] ? ` ${styles.boxOn}` : ''}`} />{t}
              </div>
            ))}
            {leadStatus === 'sent' ? (
              <p className={styles.sentNote}>Thank you. We will get back to you within 24 hours.</p>
            ) : (
              <>
                <button className={styles.submit} type="submit" disabled={leadStatus === 'sending'}>
                  {leadStatus === 'sending' ? 'Sending...' : 'Submit form'}
                </button>
                {!checks[1] ? <p className={styles.frmHint}>Please agree to the privacy policy to send the form.</p> : null}
                {leadStatus === 'error' ? <p className={styles.frmHint}>Something went wrong. Please try again, or email us directly.</p> : null}
              </>
            )}
          </form>
        </div>
      </div>

      {/* OTHER SERVICES */}
      <div className={styles.qIntro}>
        <span className={styles.eyebrow}>Services</span>
        <h2 className={styles.qT}>Explore our other services</h2>
      </div>
      <div className={styles.tiles} style={{ marginBottom: 150 }}>
        {[
          ['/buying/hero.webp', 'A warm Amsterdam apartment living room', 'Thinking about buying instead?', '/buying'],
          ['/renting/tile-letting.jpg', 'Bicycles on a canal bridge', 'Looking to let your property?', '/letting'],
          ['/renting/tile-corporate.jpg', 'A leafy Amsterdam lane', 'Relocating employees to Amsterdam?', '/b2b'],
        ].map(([img, alt, cap, href]) => (
          <a className={styles.tile} href={href} key={cap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={alt} />
            <span className={styles.cap}>{cap}</span><span className={styles.go}>&#8599;</span>
          </a>
        ))}
      </div>

      <GuideBand />

      <SiteFooter />

      {/* CTA POP-UP (approved, untouched) */}
      <div className={`${styles.ctapop}${popShown ? ` ${styles.ctapopShow}` : ''}`} aria-hidden={!popShown}>
        <div className={styles.ctapopNote}>Let&apos;s talk! We respond within 4 hours.</div>
        <div className={styles.ctapopRow}>
          <a className={styles.pbtn} href="#contact">Fill in our form</a>
          <a className={`${styles.pbtn} ${styles.pbtnAlt}`} href={INTAKE_URL} target="_blank" rel="noreferrer">Schedule a free video intake call</a>
        </div>
      </div>
    </div>
  );
}
