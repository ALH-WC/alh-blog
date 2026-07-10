'use client';

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schema } from './src/sanity/schemaTypes';
import { structure } from './src/sanity/structure';
import { apiVersion, dataset, projectId } from './src/sanity/env';

// Embedded Studio, mounted at /studio (see src/app/studio/[[...tool]]/page.tsx).
export default defineConfig({
  name: 'default',
  title: 'Amsterdam Life Homes Guide',
  basePath: '/studio',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
