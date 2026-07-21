import type { Metadata } from 'next';
import { ServiceShell } from '../../components/service/ServiceShell';
import {
  ContactBand, GuideBand, LogoBand, ReviewsBand, ServiceTiles, StatsBand, TagBand, ThreeUp,
} from '../../components/service/bands';
import { CHALLENGES, CH_DEK, HERO_SUB, SERVICES, SV_DEK } from '../../lib/buying';
import styles from '../renting/renting.module.css';

export const metadata: Metadata = {
  title: 'Buy a Home in Amsterdam as an Expat | Amsterdam Life Homes',
  description:
    'Ready to buy in Amsterdam? We help expats find the right property, negotiate the best deal, and handle every step from viewing to notary signing.',
  // The Framer page stays canonical until the domain cutover.
  robots: { index: false, follow: true },
};

export default function BuyingPage() {
  return (
    <ServiceShell current="/buying">
      {/* HERO */}
      <div className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/buying/hero.webp" alt="A warm Amsterdam apartment living room" />
        <div className={styles.heroIn}>
          <h1>We help expats buy their<br />new home in Amsterdam</h1>
          <p>{HERO_SUB}</p>
        </div>
      </div>

      <StatsBand />
      <TagBand />

      <ThreeUp
        eyebrow="Your challenges"
        title="Navigating the challenges of buying a home in Amsterdam"
        dek={CH_DEK}
        items={CHALLENGES}
      />
      <ThreeUp
        eyebrow="Our service"
        title="We help expats find their perfect Amsterdam home"
        dek={SV_DEK}
        items={SERVICES}
      />

      <ReviewsBand />
      <LogoBand />

      <ServiceTiles
        tiles={[
          ['/renting/hero-canal.jpg', 'Canal houses in Amsterdam', 'Looking for a rental home?', 'https://amsterdamlifehomes.com/renting'],
          ['/renting/tile-letting.jpg', 'Bicycles on a canal bridge', 'Looking to let your property?', 'https://amsterdamlifehomes.com/letting'],
          ['/renting/tile-corporate.jpg', 'A leafy Amsterdam lane', 'Relocating employees to Amsterdam?', 'https://amsterdamlifehomes.com/b2b'],
        ]}
      />

      <GuideBand />
      <ContactBand defaultInterest="Buying" />
    </ServiceShell>
  );
}
