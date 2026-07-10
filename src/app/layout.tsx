import type { Metadata } from 'next';
import { spectral, archivo, inter, mixta } from '../lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://amsterdamlifehomes.com'),
  title: {
    default: 'The Amsterdam Guide | Amsterdam Life Homes',
    template: '%s | The Amsterdam Guide',
  },
  description:
    'The relocation guide we wish someone had handed us. Everything we tell our clients, free, written by fellow expats who help people rent, let, and buy in Amsterdam.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spectral.variable} ${archivo.variable} ${inter.variable} ${mixta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
