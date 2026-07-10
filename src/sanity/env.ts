export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01';

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';

// When no project id is configured yet (fresh clone before env is set up),
// the site still renders using the built-in sample content that mirrors the
// approved design prototypes. Fetching is skipped rather than throwing.
export const isSanityConfigured = Boolean(projectId);
