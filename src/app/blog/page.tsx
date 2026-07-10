import type { Metadata } from 'next';
import { getAllArticles } from '../../sanity/lib/queries';
import { JsonLd } from '../../components/JsonLd';
import BlogIndex from './BlogIndex';

export const metadata: Metadata = {
  title: 'The guide we wish someone had handed us',
  description:
    'The Amsterdam Guide: a five-stage relocation guide for expats renting, letting, and buying in Amsterdam. Free, written by fellow expats.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'The Amsterdam Guide | Amsterdam Life Homes',
    description:
      'A five-stage relocation guide for expats moving to Amsterdam. Free, written by fellow expats.',
    url: '/blog',
    type: 'website',
  },
};

// Refresh from Sanity periodically once content is live.
export const revalidate = 60;

export default async function BlogPage() {
  const articles = await getAllArticles();
  const base = 'https://amsterdamlifehomes.com';

  // Note: no author or date fields anywhere, per client rule.
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Amsterdam Life Homes',
      url: base,
      email: 'hello@amsterdamlifehomes.com',
      telephone: '+31 6 1374 9944',
      description:
        'We help fellow expats rent, let, and buy their home in Amsterdam.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'The Amsterdam Guide',
      url: `${base}/blog`,
      description:
        'A five-stage relocation guide for expats moving to Amsterdam, written by fellow expats.',
      publisher: { '@type': 'Organization', name: 'Amsterdam Life Homes' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'The Amsterdam Guide articles',
      itemListElement: articles.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${base}/blog/${a.slug}`,
        name: a.title,
      })),
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />
      <BlogIndex articles={articles} />
    </>
  );
}
