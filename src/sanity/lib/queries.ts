import type { PortableTextBlock } from '@portabletext/types';
import { client } from './client';
import { urlForImage } from './image';
import type { Article, ArticleListItem, Category } from '../../lib/types';
import { normalizeCategory } from '../../lib/sections';
import { sampleArticles } from '../../lib/sampleData';

const ARTICLE_PROJECTION = `{
  _id,
  title,
  dek,
  "slug": slug.current,
  category,
  categories,
  readMinutes,
  sectionHero,
  heroImage,
  ogImage,
  body,
  metaTitle,
  metaDescription,
  keywords,
  noIndex,
  summary,
  keyTakeaways,
  faqs,
  publishedAt
}`;

const ALL_ARTICLES_QUERY = `*[_type == "article" && defined(slug.current)]
  | order(_createdAt desc) ${ARTICLE_PROJECTION}`;

// Card-level fields only. The index hands the whole list to a client component
// and Next serializes those props into the HTML, so every field here is paid
// for 116 times per page load.
const LIST_PROJECTION = `{
  _id,
  title,
  dek,
  "slug": slug.current,
  category,
  categories,
  readMinutes,
  sectionHero,
  heroImage
}`;

const ARTICLE_LIST_QUERY = `*[_type == "article" && defined(slug.current)]
  | order(_createdAt desc) ${LIST_PROJECTION}`;

const ARTICLE_BY_SLUG_QUERY = `*[_type == "article" && slug.current == $slug][0] ${ARTICLE_PROJECTION}`;

const SLUGS_QUERY = `*[_type == "article" && defined(slug.current)].slug.current`;

interface RawDoc {
  _id: string;
  title: string;
  dek?: string;
  slug: string;
  category: Category;
  categories?: Category[];
  readMinutes: number;
  sectionHero?: boolean;
  heroImage?: { alt?: string } | null;
  ogImage?: unknown;
  body?: PortableTextBlock[];
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  noIndex?: boolean;
  summary?: string;
  keyTakeaways?: string[];
  faqs?: { question: string; answer: string }[];
  publishedAt?: string;
}

function mapDoc(doc: RawDoc): Article {
  const built = urlForImage(doc.heroImage as never);
  const imageUrl = built
    ? built.width(1200).height(800).url()
    : `https://picsum.photos/seed/${doc.slug}/1200/800`;
  const ogBuilt = doc.ogImage ? urlForImage(doc.ogImage as never) : null;
  return {
    _id: doc._id,
    title: doc.title,
    dek: doc.dek ?? '',
    slug: doc.slug,
    category: normalizeCategory(doc.category),
    categories: doc.categories ? [...new Set(doc.categories.map(normalizeCategory))] : undefined,
    readMinutes: doc.readMinutes,
    sectionHero: Boolean(doc.sectionHero),
    imageUrl,
    imageAlt: doc.heroImage?.alt ?? doc.title,
    body: doc.body ?? [],
    metaTitle: doc.metaTitle,
    metaDescription: doc.metaDescription,
    keywords: doc.keywords,
    ogImageUrl: ogBuilt ? ogBuilt.width(1200).height(630).url() : undefined,
    noIndex: doc.noIndex,
    summary: doc.summary,
    keyTakeaways: doc.keyTakeaways,
    faqs: doc.faqs,
    publishedAt: doc.publishedAt,
  };
}

function toListItem(doc: RawDoc): ArticleListItem {
  const built = urlForImage(doc.heroImage as never);
  return {
    _id: doc._id,
    title: doc.title,
    dek: doc.dek ?? '',
    slug: doc.slug,
    category: normalizeCategory(doc.category),
    categories: doc.categories ? [...new Set(doc.categories.map(normalizeCategory))] : undefined,
    readMinutes: doc.readMinutes,
    sectionHero: Boolean(doc.sectionHero),
    imageUrl: built ? built.width(1200).height(800).url() : `https://picsum.photos/seed/${doc.slug}/1200/800`,
    imageAlt: doc.heroImage?.alt ?? doc.title,
  };
}

/** The slim article list for the index and related rails. Same fallback rules. */
export async function getArticleList(): Promise<ArticleListItem[]> {
  if (!client) return sampleArticles.map(toSampleListItem);
  try {
    const docs = await client.fetch<RawDoc[]>(ARTICLE_LIST_QUERY);
    if (!docs || docs.length === 0) return sampleArticles.map(toSampleListItem);
    return docs.map(toListItem);
  } catch {
    return sampleArticles.map(toSampleListItem);
  }
}
const toSampleListItem = (a: Article): ArticleListItem => ({
  _id: a._id,
  title: a.title,
  dek: a.dek,
  slug: a.slug,
  category: a.category,
  categories: a.categories,
  readMinutes: a.readMinutes,
  sectionHero: a.sectionHero,
  imageUrl: a.imageUrl,
  imageAlt: a.imageAlt,
});

// All articles. Falls back to the built-in sample content when Sanity is not
// configured or has no documents yet, so the designed page always renders.
export async function getAllArticles(): Promise<Article[]> {
  if (!client) return sampleArticles;
  try {
    const docs = await client.fetch<RawDoc[]>(ALL_ARTICLES_QUERY);
    if (!docs || docs.length === 0) return sampleArticles;
    return docs.map(mapDoc);
  } catch {
    return sampleArticles;
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!client) return sampleArticles.find((a) => a.slug === slug) ?? null;
  try {
    const doc = await client.fetch<RawDoc | null>(ARTICLE_BY_SLUG_QUERY, { slug });
    if (!doc) return sampleArticles.find((a) => a.slug === slug) ?? null;
    return mapDoc(doc);
  } catch {
    return sampleArticles.find((a) => a.slug === slug) ?? null;
  }
}

export async function getAllSlugs(): Promise<string[]> {
  const sampleSlugs = sampleArticles.map((a) => a.slug);
  if (!client) return sampleSlugs;
  try {
    const slugs = await client.fetch<string[]>(SLUGS_QUERY);
    if (!slugs || slugs.length === 0) return sampleSlugs;
    return Array.from(new Set([...slugs, ...sampleSlugs]));
  } catch {
    return sampleSlugs;
  }
}
