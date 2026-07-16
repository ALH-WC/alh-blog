import { defineField, defineType, defineArrayMember } from 'sanity';
import { CATEGORIES, SECTIONS } from '../../lib/sections';

// Ordered "steps" callout (Spectral numbers), used inside the body.
const stepsCallout = defineArrayMember({
  type: 'object',
  name: 'stepsCallout',
  title: 'Numbered steps',
  fields: [
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'step',
          fields: [
            defineField({ name: 'lead', title: 'Lead (bold)', type: 'string' }),
            defineField({ name: 'text', title: 'Text', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'lead', subtitle: 'text' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { steps: 'steps' },
    prepare({ steps }) {
      const count = Array.isArray(steps) ? steps.length : 0;
      return { title: 'Numbered steps', subtitle: `${count} step${count === 1 ? '' : 's'}` };
    },
  },
});

// Sand "Good to know" callout box.
const callout = defineArrayMember({
  type: 'object',
  name: 'callout',
  title: 'Callout box',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string', initialValue: 'Good to know' }),
    defineField({ name: 'text', title: 'Text', type: 'text', rows: 3, validation: (r) => r.required() }),
  ],
  preview: {
    select: { label: 'label', text: 'text' },
    prepare({ label, text }) {
      return { title: label || 'Callout', subtitle: text };
    },
  },
});

// Inline image with alt + caption.
const inlineImage = defineArrayMember({
  type: 'image',
  name: 'inlineImage',
  title: 'Image',
  options: { hotspot: true },
  fields: [
    defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
    defineField({ name: 'caption', title: 'Caption', type: 'string' }),
  ],
});

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
    { name: 'answers', title: 'AI / answer engines' },
    { name: 'placement', title: 'Placement' },
  ],
  fields: [
    // ---------- Content ----------
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      description: 'The on-page H1. Also the default for the SEO title if that is left blank.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'dek',
      title: 'Excerpt / standfirst',
      type: 'text',
      rows: 2,
      group: 'content',
      description: 'Shown as the card excerpt and, in italic Spectral, as the article lead.',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'readMinutes',
      title: 'Read time (minutes)',
      type: 'number',
      group: 'content',
      description: 'The only meta shown on an article. No author or dates, by client rule.',
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading', value: 'h2' },
            { title: 'Subheading', value: 'h3' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (r) =>
                      r.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
                  },
                ],
              },
            ],
          },
        }),
        stepsCallout,
        callout,
        inlineImage,
      ],
    }),

    // ---------- SEO ----------
    defineField({
      name: 'metaTitle',
      title: 'SEO title (title tag)',
      type: 'string',
      group: 'seo',
      description: 'Browser tab + search result title. Aim for ~50-60 characters. Falls back to the article title.',
      validation: (r) => r.max(70).warning('Keep under ~60 characters so it is not truncated in search.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'The snippet under the title in search. ~140-160 characters. Falls back to the excerpt.',
      validation: (r) => r.max(180).warning('Keep under ~160 characters so it is not truncated.'),
    }),
    defineField({
      name: 'focusKeyword',
      title: 'Primary keyword / query',
      type: 'string',
      group: 'seo',
      description: 'The main search query this article should answer (e.g. "erfpacht amsterdam").',
    }),
    defineField({
      name: 'keywords',
      title: 'Secondary keywords / topics',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      group: 'seo',
      options: { layout: 'tags' },
      description: 'Related queries and entities. Used for meta keywords and the Article schema.',
    }),
    defineField({
      name: 'ogImage',
      title: 'Social share image (optional)',
      type: 'image',
      group: 'seo',
      options: { hotspot: true },
      description: 'Overrides the hero image when the link is shared. 1200x630 works best.',
    }),
    defineField({
      name: 'noIndex',
      title: 'Hide from search engines',
      type: 'boolean',
      group: 'seo',
      initialValue: false,
      description: 'Adds noindex. Use only for thin or duplicate pages.',
    }),

    // ---------- AI / answer engines (GEO / AI-EO) ----------
    defineField({
      name: 'summary',
      title: 'TL;DR summary',
      type: 'text',
      rows: 3,
      group: 'answers',
      description:
        'One or two plain sentences that directly answer the question. This is what AI search (ChatGPT, Perplexity, Google AI Overviews) is most likely to quote, so make it self-contained and factual.',
    }),
    defineField({
      name: 'keyTakeaways',
      title: 'Key takeaways',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      group: 'answers',
      description: 'Short factual bullets. Shown on the page and fed to answer engines as the gist of the article.',
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      group: 'answers',
      description: 'Real questions people ask, with concise answers. Rendered on the page and as FAQ structured data.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'faq',
          fields: [
            defineField({ name: 'question', title: 'Question', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 3, validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'question', subtitle: 'answer' } },
        }),
      ],
    }),

    // ---------- Placement ----------
    defineField({
      name: 'category',
      title: 'Primary category',
      type: 'string',
      group: 'placement',
      description: 'The label shown on the card. Determines which chapter the article appears in.',
      options: {
        list: CATEGORIES.map((c) => ({ title: c, value: c })),
        layout: 'dropdown',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Also relevant to',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      group: 'placement',
      options: {
        list: CATEGORIES.map((c) => ({ title: c, value: c })),
        layout: 'grid',
      },
      description: 'Extra categories this article also fits (used for search and relatedness).',
    }),
    defineField({
      name: 'featured',
      title: 'Feature as "Start here"',
      type: 'boolean',
      group: 'placement',
      initialValue: false,
      description: 'Pins this as the flagship article at the very top of the guide. The newest featured one wins.',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published date',
      type: 'datetime',
      group: 'placement',
      description:
        'Not shown on the page (per the no-dates rule). Used only in the structured data as a freshness signal for search and AI engines.',
    }),
  ],
  preview: {
    select: { title: 'title', category: 'category', featured: 'featured', media: 'heroImage' },
    prepare({ title, category, featured, media }) {
      const section = SECTIONS.find((s) => s.categories.includes(category))?.menu ?? category;
      return {
        title: featured ? `★ ${title}` : title,
        subtitle: `${section} · ${category}`,
        media,
      };
    },
  },
});
