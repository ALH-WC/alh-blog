import type { Metadata } from 'next';
import { ServiceShell } from '../../components/service/ServiceShell';
import {
  ContactBand, GuideBand, LogoBand, ReviewsBand, ServiceTiles, StatsBand, TagBand, ThreeUp,
} from '../../components/service/bands';
import { CHALLENGES, CH_DEK, HERO_SUB, SERVICES, SV_DEK } from '../../lib/b2b';
import styles from '../renting/renting.module.css';

export const metadata: Metadata = {
  title: 'Corporate Expat Housing Amsterdam | Amsterdam Life Homes',
  description:
    'Relocate your team to Amsterdam with ease. We handle corporate housing, relocation guidance, and integration support for international employees.',
  // The Framer page stays canonical until the domain cutover.
  robots: { index: false, follow: true },
};

export default function B2bPage() {
  return (
    <ServiceShell current="/b2b">
      {/* HERO */}
      <div className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/b2b/hero.jpg" alt="A team at work in a bright office" />
        <div className={styles.heroIn}>
          <h1>You take care of your team.<br />We take care of their housing.</h1>
          <p>{HERO_SUB}</p>
        </div>
      </div>

      <StatsBand />
      {/* The live b2b page leads with the client logos right after the hero */}
      <LogoBand />
      <TagBand />

      <ThreeUp
        eyebrow="Your challenges"
        title="Building an international team starts with finding them a home"
        dek={CH_DEK}
        items={CHALLENGES}
      />
      <ThreeUp
        eyebrow="Our service"
        title={<>You lead your team.<br />We manage their homes.</>}
        dek={SV_DEK}
        items={SERVICES}
      />

      <ReviewsBand />

      <ServiceTiles
        tiles={[
          ['/renting/hero-canal.jpg', 'Canal houses in Amsterdam', 'Looking for a rental home?', '/renting'],
          ['/buying/hero.webp', 'A warm Amsterdam apartment living room', 'Thinking about buying instead?', '/buying'],
          ['/renting/tile-letting.jpg', 'Bicycles on a canal bridge', 'Looking to let your property?', '/letting'],
        ]}
      />

      <GuideBand />
      <ContactBand defaultInterest="B2B" />
    </ServiceShell>
  );
}
