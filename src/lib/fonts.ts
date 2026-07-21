import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

// Sans for everything else: body copy, eyebrows, meta, UI, buttons, and the top nav.
export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

// The house display face, self-hosted from the ALH brand assets: logo, all
// headings, chapter titles, article titles, pull quotes and display numerals.
export const mixta = localFont({
  src: '../fonts/MixtaEssSharp-Regular.otf',
  weight: '400',
  style: 'normal',
  variable: '--font-mixta',
  display: 'swap',
});
