import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllArticles, getAllSlugs, getArticleBySlug } from '../../../sanity/lib/queries';
import { PortableBody } from '../../../components/PortableBody';
import { JsonLd } from '../../../components/JsonLd';
import { SiteNav } from '../../../components/SiteNav';
import { SiteFooter } from '../../../components/SiteFooter';
import styles from './article.module.css';

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
  const [article, all] = await Promise.all([getArticleBySlug(slug), getAllArticles()]);
  if (!article) notFound();

  const related = all.filter((a) => a.slug !== article.slug).slice(0, 3);

  // Article schema WITHOUT author or dates, per client rule.
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
        <div className={styles.back}>
          <Link href="/blog" className={styles.backLink}>
            <span className={styles.ar}>&larr;</span> Back
          </Link>
        </div>

        <article>
          <header className={styles.ahead}>
            <span className={styles.eyebrow}>{article.category}</span>
            <h1 className={styles.title}>{article.title}</h1>
            <div className={styles.meta}>{article.readMinutes} min read</div>
          </header>

          {article.dek ? <p className={styles.lead}>{article.dek}</p> : null}

          <div className={styles.hero}>
            <div className={styles.heroFrame}>
              <img src={article.imageUrl} alt={article.imageAlt} />
            </div>
          </div>

          <div className={styles.body}>
            <PortableBody value={article.body} />
          </div>

          {related.length ? (
            <section className={styles.kr}>
              <div className={styles.khead}>
                <h2 className={styles.kheadTitle}>Keep reading</h2>
                <Link href="/blog" className={styles.kheadLink}>
                  All articles <span className={styles.ar}>&rarr;</span>
                </Link>
              </div>
              <div className={styles.kgrid}>
                {related.map((a) => (
                  <Link key={a._id} href={`/blog/${a.slug}`} className={styles.kcard}>
                    <span className={styles.eyebrow}>{a.category}</span>
                    <h3 className={styles.kcardTitle}>{a.title}</h3>
                    <span className={styles.kcardRt}>{a.readMinutes} min read</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </div>
      <SiteFooter />
    </>
  );
}
