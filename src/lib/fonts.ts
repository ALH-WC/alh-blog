import { Spectral, Archivo, Inter } from 'next/font/google';
import localFont from 'next/font/local';

// Display serif. Used for headings, masthead, pull quotes, italic emphasis.
export const spectral = Spectral({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-spectral',
  display: 'swap',
});

// Body sans. Used for body copy, kickers, meta, UI, nav, buttons.
export const archivo = Archivo({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-archivo',
  display: 'swap',
});

// Site-chrome sans (top nav links + CTA), matching the main ALH Framer site.
export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

// Brand wordmark font, self-hosted from the ALH brand assets (Design/Font).
// Used only for the logo in the top nav.
export const mixta = localFont({
  src: '../fonts/MixtaEssSharp-Regular.otf',
  weight: '400',
  style: 'normal',
  variable: '--font-mixta',
  display: 'swap',
});
