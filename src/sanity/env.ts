// Public Sanity config. The project id and dataset are NOT secrets (they ship
// in every NEXT_PUBLIC bundle and appear in the API URL), so they default to
// the ALH project here and need no env vars to deploy. Env vars still override,
// e.g. to point a fork at a different dataset. The write token is separate and
// server-only (see SANITY_API_WRITE_TOKEN), never hardcoded.
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01';

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'w6sbook5';

export const isSanityConfigured = Boolean(projectId);
