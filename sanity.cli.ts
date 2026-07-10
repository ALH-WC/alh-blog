import { defineCliConfig } from 'sanity/cli';
import { dataset, projectId } from './src/sanity/env';

export default defineCliConfig({
  api: { projectId, dataset },
  // The Studio is served by the Next.js app at /studio, not deployed separately.
  autoUpdates: true,
});
