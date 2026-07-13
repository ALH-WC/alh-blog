import { defineField, defineType, defineArrayMember } from 'sanity';
import { CATEGORIES, SECTIONS } from '../../lib/sections';

// Ordered "steps" callout (Spectral terracotta numbers), used inside the body.
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

// Centered Spectral italic pull quote with an optional attribution.
const pullQuote = defineArrayMember({
  type: 'object',
  name: 'pullQuote',
  title: 'Pull quote',
  fields: [
    defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 3, validation: (r) => r.required() }),
    defineField({ name: 'attribution', title: 'Attribution (optional)', type: 'string' }),
  ],
  preview: {
    select: { quote: 'quote' },
    prepare({ quote }) {
      return { title: 'Pull quote', subtitle: quote };
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
    { name: 'placement', title: 'Placement' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
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
        pullQuote,
        callout,
        inlineImage,
      ],
    }),
    // ----- Placement -----
    defineField({
      name: 'category',
      title: 'Category',
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
      name: 'featured',
      title: 'Feature as "Start here"',
      type: 'boolean',
      group: 'placement',
      initialValue: false,
      description: 'Pins this as the flagship article at the very top of the guide. The newest featured one wins.',
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
