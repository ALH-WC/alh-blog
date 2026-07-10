import { defineField, defineType, defineArrayMember } from 'sanity';

export const CATEGORIES = [
  'Immigration',
  'Work',
  'Need to know',
  'Finance',
  'Neighborhoods',
  'Life & Culture',
  'Eat & Drink',
  'See & Do',
] as const;

export const AUDIENCES = [
  { title: 'Singles & couples', value: 'singles_couples' },
  { title: 'Family', value: 'family' },
  { title: 'Both', value: 'both' },
] as const;

// The five journey stages. Titles are fixed by the client and must not be renamed.
export const STAGES = [
  { number: 1, title: 'Preparing & arriving', dek: 'Visas, timing, and the first weeks on the ground' },
  { number: 2, title: 'The home search', dek: 'How this market really works, from people inside it daily' },
  { number: 3, title: 'Paperwork & money', dek: 'Real numbers, current rules, no surprises' },
  { number: 4, title: 'The neighborhoods', dek: 'Honest comparisons from weekly viewings across the city' },
  { number: 5, title: 'Living your best life', dek: 'The part that makes it home' },
] as const;

// Custom body block: an ordered "steps" callout (band bg, accent left border,
// Spectral numbers) usable inside article body.
const stepsCallout = defineArrayMember({
  type: 'object',
  name: 'stepsCallout',
  title: 'Steps callout',
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
          preview: {
            select: { title: 'lead', subtitle: 'text' },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { steps: 'steps' },
    prepare({ steps }) {
      const count = Array.isArray(steps) ? steps.length : 0;
      return { title: 'Steps callout', subtitle: `${count} step${count === 1 ? '' : 's'}` };
    },
  },
});

// Custom body block: a centered pull quote (Spectral italic).
const pullQuote = defineArrayMember({
  type: 'object',
  name: 'pullQuote',
  title: 'Pull quote',
  fields: [
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3, validation: (r) => r.required() }),
  ],
  preview: {
    select: { quote: 'quote' },
    prepare({ quote }) {
      return { title: 'Pull quote', subtitle: quote };
    },
  },
});

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'dek',
      title: 'Dek (standfirst)',
      type: 'text',
      rows: 2,
      description: 'The italic Spectral subtitle shown under the headline.',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: CATEGORIES.map((c) => ({ title: c, value: c })),
        layout: 'dropdown',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'stage',
      title: 'Journey stage (1 to 5)',
      type: 'number',
      options: {
        list: STAGES.map((s) => ({ title: `0${s.number} ${s.title}`, value: s.number })),
        layout: 'dropdown',
      },
      validation: (r) => r.required().min(1).max(5),
    }),
    defineField({
      name: 'audience',
      title: 'Audience',
      type: 'string',
      initialValue: 'both',
      options: {
        list: AUDIENCES.map((a) => ({ title: a.title, value: a.value })),
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'readMinutes',
      title: 'Read time (minutes)',
      type: 'number',
      description: 'The only meta shown on articles. No author or dates, by client rule.',
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Feature this article at the top of its stage (or the hero, for the newest featured).',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', title: 'Alt text', type: 'string' }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading', value: 'h2' },
            { title: 'Subheading', value: 'h3' },
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
                  { name: 'href', type: 'url', title: 'URL', validation: (r) => r.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }) },
                ],
              },
            ],
          },
        }),
        stepsCallout,
        pullQuote,
      ],
    }),
  ],
  preview: {
    select: { title: 'title', category: 'category', stage: 'stage', media: 'heroImage' },
    prepare({ title, category, stage, media }) {
      return { title, subtitle: `0${stage} · ${category}`, media };
    },
  },
});
