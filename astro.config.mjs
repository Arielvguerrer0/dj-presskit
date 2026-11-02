// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // URL pública. Sin ella no se generan las etiquetas que necesitan una dirección completa.
  site: process.env.SITE_URL || undefined,
  // Subcarpeta donde vive el sitio, por ejemplo /dj-presskit en GitHub Pages.
  base: process.env.BASE_PATH || undefined,
  vite: {
    plugins: [tailwindcss()],
  },
});
