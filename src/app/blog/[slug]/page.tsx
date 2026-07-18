import type { Metadata } from 'next';
import type { PortableTextBlock } from '@portabletext/types';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getArticleList, getAllSlugs, getArticleBySlug } from '../../../sanity/lib/queries';
import { PortableBody } from '../../../components/PortableBody';
import { JsonLd } from '../../../components/JsonLd';
import { SiteNav } from '../../../components/SiteNav';
import { SiteFooter } from '../../../components/SiteFooter';
import { HelpCta } from '../../../components/HelpCta';
import { InlineSignup } from '../../../components/InlineSignup';
import { CityMapHero } from '../../../components/CityMapHero';
import { GUIDE_AREAS } from '../../../lib/neighborhoods';
import styles from './article.module.css';

const BASE = 'https://amsterdamlifehomes.com';

export const revalidate = 60;

// Where the newsletter band goes. Aim for the middle, but never directly under a
// heading (it would read as that chapter's content) and never mid-list. Landing
// just before a heading is ideal, since it falls on a natural section break.
function signupIndex(body: PortableTextBlock[]): number {
  if (body.length < 4) return body.length;
  const isHeading = (b?: PortableTextBlock) => b?.style === 'h2' || b?.style === 'h3';
  const isList = (b?: PortableTextBlock) => Boolean(b && 'listItem' in b && b.listItem);
  const usable = (i: number) =>
    i > 0 && i < body.length && !isHeading(body[i - 1]) && !(isList(body[i - 1]) && isList(body[i]));

  const mid = Math.ceil(body.length / 2);
  const window = Math.max(4, Math.round(body.length / 4));
  const candidates: number[] = [];
  for (let d = 0; d <= window; d++) {
    candidates.push(mid + d);
    if (d) candidates.push(mid - d);
  }
  // Prefer a section break: sit just above the next chapter heading.
  const atBreak = candidates.find((i) => usable(i) && isHeading(body[i]));
  if (atBreak !== undefined) return atBreak;
  // Otherwise the nearest clean paragraph boundary.
  const clean = candidates.find(usable);
  return clean !== undefined ? clean : body.length;
}

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
  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.dek;
  const ogImg = article.ogImageUrl || article.imageUrl;
  return {
    title,
    description,
    keywords: article.keywords,
    alternates: { canonical: `/blog/${slug}` },
    robots: article.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url: `/blog/${slug}`,
      type: 'article',
      images: ogImg ? [{ url: ogImg }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImg ? [ogImg] : undefined,
    },
  };
}

export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const [article, all] = await Promise.all([getArticleBySlug(slug), getArticleList()]);
  if (!article) notFound();

  // "Keep reading": three internal links on every article. Studio picks
  // (the "Keep reading (override)" field) come first; automatic picks fill
  // the rest by relevance: same chapter, then chapters this article is also
  // relevant to, then anything else. `all` is newest-first throughout.
  const pool = all.filter((a) => a.slug !== article.slug);
  const picked = (article.relatedSlugs ?? [])
    .map((rs) => pool.find((a) => a.slug === rs))
    .filter((a): a is (typeof pool)[number] => Boolean(a));
  const remaining = pool.filter((a) => !picked.includes(a));
  const sameChapter = remaining.filter((a) => a.category === article.category);
  const alsoRelevant = remaining.filter(
    (a) =>
      !sameChapter.includes(a) &&
      (article.categories?.includes(a.category) || a.categories?.includes(article.category)),
  );
  const filler = remaining.filter((a) => !sameChapter.includes(a) && !alsoRelevant.includes(a));
  const related = [...picked, ...sameChapter, ...alsoRelevant, ...filler].slice(0, 3);

  // Split the body so the newsletter signup lands roughly in the middle
  // (or at the end of very short articles). Every article gets one.
  const body = article.body ?? [];
  const insertAt = signupIndex(body);
  const bodyStart = body.slice(0, insertAt);
  const bodyEnd = body.slice(insertAt);

  // Set only for the guides that are about one mapped area.
  const mapArea = GUIDE_AREAS[article.slug];

  const ogImg = article.ogImageUrl || article.imageUrl;

  // Article schema. No author or visible dates on the page, but datePublished is
  // included here as a freshness signal for search and AI answer engines.
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.metaTitle || article.title,
    description: article.metaDescription || article.dek,
    image: ogImg ? [ogImg] : undefined,
    articleSection: article.category,
    keywords: article.keywords?.length ? article.keywords.join(', ') : undefined,
    ...(article.publishedAt
      ? { datePublished: article.publishedAt, dateModified: article.publishedAt }
      : {}),
    inLanguage: 'en',
    about: { '@type': 'Place', name: 'Amsterdam, Netherlands' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE}/blog/${article.slug}` },
    publisher: { '@type': 'Organization', name: 'Amsterdam Life Homes', url: BASE },
    isPartOf: { '@type': 'Blog', name: 'The Amsterdam Guide', url: `${BASE}/blog` },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'The Amsterdam Guide', item: `${BASE}/blog` },
      { '@type': 'ListItem', position: 2, name: article.category, item: `${BASE}/blog` },
      { '@type': 'ListItem', position: 3, name: article.title, item: `${BASE}/blog/${article.slug}` },
    ],
  };
  const faqLd =
    article.faqs && article.faqs.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: article.faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }
      : null;
  const jsonLd = faqLd ? [articleLd, breadcrumbLd, faqLd] : [articleLd, breadcrumbLd];

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

          {/* Neighbourhood guides get the city map with their area lit up, so a
              reader can place it immediately. Everything else keeps its photo. */}
          <div className={styles.hero}>
            {mapArea ? (
              <CityMapHero active={mapArea} />
            ) : (
              <div className={styles.heroFrame}>
                <img src={article.imageUrl} alt={article.imageAlt} />
              </div>
            )}
          </div>

          {article.summary || (article.keyTakeaways && article.keyTakeaways.length) ? (
            <aside className={styles.keypoints}>
              {article.summary ? <p className={styles.keyIntro}>{article.summary}</p> : null}
              {article.keyTakeaways && article.keyTakeaways.length ? (
                <>
                  <span className={styles.keyLabel}>Key takeaways</span>
                  <ul className={styles.keyList}>
                    {article.keyTakeaways.map((k, i) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </aside>
          ) : null}

          <div className={styles.body}>
            <PortableBody value={bodyStart} />
            <InlineSignup />
            {bodyEnd.length ? <PortableBody value={bodyEnd} /> : null}
          </div>

          {article.faqs && article.faqs.length ? (
            <section className={styles.faqs}>
              <h2 className={styles.faqTitle}>Frequently asked questions</h2>
              <div className={styles.faqList}>
                {article.faqs.map((f, i) => (
                  <div key={i} className={styles.faqItem}>
                    <h3 className={styles.faqQ}>{f.question}</h3>
                    <p className={styles.faqA}>{f.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

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
      <HelpCta />
    </>
  );
}
