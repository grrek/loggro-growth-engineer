import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://labs.loggro.com',
  base: '/growth-engineer',
  trailingSlash: 'never',
  build: {
    format: 'file',
    assets: 'assets',
  },
  integrations: [
    tailwind({ applyBaseStyles: false }),
    react(),
  ],
  vite: {
    server: {
      hmr: { overlay: true },
    },
  },
});
