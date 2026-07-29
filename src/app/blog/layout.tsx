import type { Metadata } from 'next';

// The blog's own title voice: article and index titles get the guide suffix.
// Service pages are outside this segment and keep their full titles.
export const metadata: Metadata = {
  title: {
    default: 'The Amsterdam Guide | Amsterdam Life Homes',
    template: '%s | The Amsterdam Guide',
  },
  description:
    'The relocation guide we wish someone had handed us. Everything we tell our clients, free, written by fellow expats who help people rent, let, and buy in Amsterdam.',
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
