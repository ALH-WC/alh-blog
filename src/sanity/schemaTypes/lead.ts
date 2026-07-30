import { defineField, defineType } from 'sanity';

// Site form submissions. Created by /api/lead; read-only in the Studio.
export const lead = defineType({
  name: 'lead',
  title: 'Lead',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({ name: 'interest', title: 'Interested in', type: 'string' }),
    defineField({ name: 'firstName', title: 'First name', type: 'string' }),
    defineField({ name: 'lastName', title: 'Last name', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'budget', title: 'Budget', type: 'string' }),
    defineField({ name: 'message', title: 'Message', type: 'text' }),
    defineField({ name: 'company', title: 'Company', type: 'string' }),
    defineField({ name: 'audience', title: 'Guide audience', type: 'string' }),
    defineField({ name: 'newsletter', title: 'Wants the newsletter', type: 'boolean' }),
    defineField({ name: 'page', title: 'Submitted from', type: 'string' }),
    defineField({ name: 'submittedAt', title: 'Submitted at', type: 'datetime' }),
  ],
  orderings: [
    {
      title: 'Newest first',
      name: 'newest',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'email', subtitle: 'interest' },
  },
});
