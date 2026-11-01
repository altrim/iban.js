import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  platform: 'neutral',
  target: 'es2020',
  dts: { sourcemap: false },
  sourcemap: true,
  minify: false,
  clean: true,
  publint: true,
  attw: true,
});
