import type { Metadata } from 'next';
import RentingView from './RentingView';

// The Framer site still serves the canonical /renting; this page is the v2
// rebuild living on the blog deployment. noIndex until the domain cutover,
// so the two never compete in search.
export const metadata: Metadata = {
  title: 'Rent a Home in Amsterdam as an Expat | Amsterdam Life Homes',
  description:
    'Amsterdam’s boutique housing agency, run by local expats. We search, view, and negotiate for you, until the keys are in your hand.',
  robots: { index: false, follow: true },
};

export default function RentingPage() {
  return <RentingView />;
}
