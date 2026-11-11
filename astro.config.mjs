import { defineConfig } from 'astro/config';
import remarkHeadingId from './scripts/remark-heading-id.mjs';

export default defineConfig({
  site: 'https://mrkl.top',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  markdown: {
    remarkPlugins: [remarkHeadingId],
  },
});
