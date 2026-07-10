import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllSlugs, getArticleBySlug } from '../../../sanity/lib/queries';
import { PortableBody } from '../../../components/PortableBody';
import { JsonLd } from '../../../components/JsonLd';
import { SiteNav } from '../../../components/SiteNav';
import { SiteFooter } from '../../../components/SiteFooter';
import styles from './article.module.css';

const CAL_URL = 'https://cal.com/amsterdam-life-homes/intake';
const BASE = 'https://amsterdamlifehomes.com';

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Guide not found' };
  return {
    title: article.title,
    description: article.dek,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: article.title,
      description: article.dek,
      url: `/blog/${slug}`,
      type: 'article',
      images: article.imageUrl ? [{ url: article.imageUrl }] : undefined,
    },
  };
}

export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Article schema WITHOUT author or datePublished/dateModified, per client rule.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.dek,
    image: article.imageUrl ? [article.imageUrl] : undefined,
    articleSection: article.category,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE}/blog/${article.slug}` },
    publisher: { '@type': 'Organization', name: 'Amsterdam Life Homes' },
    isPartOf: { '@type': 'Blog', name: 'The Amsterdam Guide', url: `${BASE}/blog` },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <SiteNav />
      <div className={styles.page}>
        <article className={styles.article}>
          <div className={styles.hero}>
            <img src={article.imageUrl} alt={article.imageAlt} />
          </div>
          <div className={styles.body}>
            <header className={styles.head}>
              <span className={styles.kicker}>{article.category} &middot; Start here</span>
              <h1 className={styles.title}>{article.title}</h1>
              {article.dek ? <p className={styles.dek}>{article.dek}</p> : null}
            </header>

            <div className={styles.meta}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3.5 2" />
              </svg>
              <span className={styles.metaText}>{article.readMinutes} min read</span>
            </div>

            <div className={styles.content}>
              <PortableBody value={article.body} />
            </div>

            <div className={styles.endCta}>
              <p className={styles.endCtaText}>
                Want us to do the searching, and make sure every lease you sign is registrable?
              </p>
              <a href={CAL_URL} className={styles.endCtaBtn}>Talk to us first</a>
            </div>
          </div>
        </article>

        <div className={styles.backRow}>
          <Link href="/blog" className={styles.backLink}>&larr; Back to the guide</Link>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
