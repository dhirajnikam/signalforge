import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  // GitHub Pages base is /<repo>/
  const base = process.env.GITHUB_PAGES_BASE || '/signalforge/';
  return {
    base,
    build: {
      outDir: 'dist'
    }
  };
});
