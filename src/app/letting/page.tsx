import type { Metadata } from 'next';
import { ServiceShell } from '../../components/service/ServiceShell';
import {
  ContactBand, GuideBand, LogoBand, ReviewsBand, ServiceTiles, StatsBand, TagBand, ThreeUp,
} from '../../components/service/bands';
import { CHALLENGES, CH_DEK, HERO_SUB, SERVICES, SV_DEK } from '../../lib/letting';
import styles from '../renting/renting.module.css';

export const metadata: Metadata = {
  title: 'Let Your Amsterdam Property | Amsterdam Life Homes',
  description:
    'Want to let your Amsterdam property? We find reliable tenants, handle screening and management, and maximize your rental returns. Free consultation.',
  // The Framer page stays canonical until the domain cutover.
  robots: { index: false, follow: true },
};

export default function LettingPage() {
  return (
    <ServiceShell current="/letting">
      {/* HERO */}
      <div className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/letting/hero.webp" alt="One of our founders on a canal bridge in Amsterdam" />
        <div className={styles.heroIn}>
          <h1>We help you let<br />your Amsterdam home</h1>
          <p>{HERO_SUB}</p>
        </div>
      </div>

      <StatsBand />
      <TagBand />

      <ThreeUp
        eyebrow="Your challenges"
        title="Enjoy the benefits of letting, without the hassle"
        dek={CH_DEK}
        items={CHALLENGES}
      />
      <ThreeUp
        eyebrow="Our service"
        title="Everything you need to let your property with confidence"
        dek={SV_DEK}
        items={SERVICES}
      />

      <ReviewsBand />
      <LogoBand />

      <ServiceTiles
        tiles={[
          ['/renting/hero-canal.jpg', 'Canal houses in Amsterdam', 'Looking for a rental home?', '/renting'],
          ['/buying/hero.webp', 'A warm Amsterdam apartment living room', 'Thinking about buying instead?', '/buying'],
          ['/renting/tile-corporate.jpg', 'A leafy Amsterdam lane', 'Relocating employees to Amsterdam?', '/b2b'],
        ]}
      />

      <GuideBand />
      <ContactBand defaultInterest="Letting" />
    </ServiceShell>
  );
}
