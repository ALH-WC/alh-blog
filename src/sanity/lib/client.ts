import { createClient, type SanityClient } from 'next-sanity';
import { apiVersion, dataset, projectId, isSanityConfigured } from '../env';

// Returns null when Sanity is not configured, so callers can fall back to
// the built-in sample content without crashing the build.
export const client: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
    })
  : null;
