import { Spectral, Inter } from 'next/font/google';
import localFont from 'next/font/local';

// Display serif: all headings, chapter titles, article titles, pull quotes.
export const spectral = Spectral({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-spectral',
  display: 'swap',
});

// Sans for everything else: body copy, eyebrows, meta, UI, buttons, and the top nav.
export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

// Brand wordmark font, self-hosted from the ALH brand assets. Top nav logo only.
export const mixta = localFont({
  src: '../fonts/MixtaEssSharp-Regular.otf',
  weight: '400',
  style: 'normal',
  variable: '--font-mixta',
  display: 'swap',
});
