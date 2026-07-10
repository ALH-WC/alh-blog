import { Spectral, Archivo } from 'next/font/google';

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
