import type { Metadata } from 'next';
import { inter, mixta } from '../lib/fonts';
import { TabAttention } from '../components/TabAttention';
import './globals.css';

// No sitewide title template: service pages own their full titles. The blog
// segment adds its own "| The Amsterdam Guide" template in blog/layout.tsx.
export const metadata: Metadata = {
  metadataBase: new URL('https://amsterdamlifehomes.com'),
  title: 'Amsterdam Life Homes',
  description:
    'Fellow expats helping you rent, buy, or let your Amsterdam home. We have been in your shoes and treat every client like we would want to be treated.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mixta.variable}`}>
      <body>
        <TabAttention />
        {children}
      </body>
    </html>
  );
}
