import { defineConfig, build as viteBuild, type Plugin, type ResolvedConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { cp } from 'node:fs/promises';

import metaConf from './scripts/meta.conf.js';
import getVersion from './scripts/getVersion.js';
import updateManifest from './scripts/updateManifest.js';
import getLocales from './scripts/lokalise.js';

const SRC = resolve(import.meta.dirname, 'src');
const DIST = resolve(import.meta.dirname, 'dist');
const BUILD = resolve(DIST, 'build');

const PLATFORMS = ['chrome', 'firefox', 'opera', 'edge'];
const LANGS = ['en'];
const SCRIPT_ENTRIES = ['background', 'contentscript', 'inpage'] as const;

// ─── Vite plugin: build extension scripts + platform copies ──────────────────

function extensionBuild(): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'extension-build',
    apply: 'build',

    configResolved(c) {
      config = c;
    },

    async buildStart() {
      // Fetch locales (no-op when Lokalise API key is absent)
      await getLocales(LANGS, 'src/copied/_locales');
    },

    async closeBundle() {
      // 1. Build standalone scripts as IIFE bundles (no ES-module imports)
      //    Content scripts & background scripts cannot use ES modules in extensions.
      for (const name of SCRIPT_ENTRIES) {
        await viteBuild({
          configFile: false,
          logLevel: 'warn',
          resolve: {
            alias: config.resolve.alias as Record<string, string>,
            extensions: config.resolve.extensions,
          },
          define: config.define,
          build: {
            write: true,
            emptyOutDir: false,
            outDir: config.build.outDir,
            target: 'chrome90',
            minify: config.build.minify,
            sourcemap: config.build.sourcemap,
            rollupOptions: {
              input: resolve(SRC, `${name}.ts`),
              output: {
                format: 'iife' as const,
                entryFileNames: `${name}.js`,
                inlineDynamicImports: true,
              },
            },
          },
        });
        console.log(`  ✓ ${name}.js (IIFE)`);
      }

      // 2. Per-platform builds (copy + patch manifest)
      const version = getVersion();
      if (!version) {
        console.warn('⚠ Could not determine version — skipping platform builds');
        return;
      }

      const platformsConfig = metaConf(version);

      for (const platform of PLATFORMS) {
        const platformDir = resolve(DIST, platform);
        await cp(BUILD, platformDir, { recursive: true });

        updateManifest(
          resolve(BUILD, 'manifest.json'),
          platformsConfig[platform].manifest,
          resolve(platformDir, 'manifest.json'),
        );

        console.log(`  ✓ ${platform} build`);
      }

      // 3. Production zipping (optional — needs FolderZip)
      if (config.mode === 'production') {
        try {
          const { default: FolderZip } = await import('folder-zip');

          for (const platform of PLATFORMS) {
            const platformDir = resolve(DIST, platform);
            const zipPath = resolve(DIST, `cubensis-connect-${version}-${platform}.zip`);

            await new Promise<void>((res, rej) => {
              const zip = new FolderZip();
              zip.zipFolder(platformDir, { excludeParentFolder: true }, (err: unknown) => {
                if (err) return rej(err);
                try {
                  zip.writeToFileSync(zipPath);
                  res();
                } catch (e) {
                  rej(e);
                }
              });
            });

            console.log(`  ✓ ${platform}.zip`);
          }
        } catch {
          console.warn('⚠ Zipping skipped (folder-zip unavailable)');
        }
      }
    },
  };
}

// ─── Main Vite config ────────────────────────────────────────────────────────

export default defineConfig(({ mode }) => ({
  root: import.meta.dirname,
  base: './',
  publicDir: resolve(import.meta.dirname, 'src/copied'),

  plugins: [react(), extensionBuild()],

  build: {
    outDir: BUILD,
    emptyOutDir: true,
    target: 'chrome90',
    assetsInlineLimit: 1000, // match webpack asset size threshold
    sourcemap: mode === 'production' ? 'hidden' : true,
    minify: mode === 'production',
    cssCodeSplit: false, // single CSS bundle like webpack's MiniCssExtractPlugin

    rollupOptions: {
      input: {
        popup: resolve(import.meta.dirname, 'popup.html'),
        notification: resolve(import.meta.dirname, 'notification.html'),
      },
      output: {
        // Flat output (no nested assets/ for easier extension loading)
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
  },

  resolve: {
    alias: {
      // Path aliases matching tsconfig baseUrl
      ui: resolve(SRC, 'ui'),
      controllers: resolve(SRC, 'controllers'),
      lib: resolve(SRC, 'lib'),
      wallets: resolve(SRC, 'wallets'),
      accounts: resolve(SRC, 'accounts'),
      assets: resolve(SRC, 'assets'),
      constants: resolve(SRC, 'constants.ts'),
      // Node.js polyfill for browser
      stream: 'stream-browserify',
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },

  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN ?? ''),
    __SENTRY_ENVIRONMENT__: JSON.stringify(process.env.SENTRY_ENVIRONMENT ?? ''),
    __SENTRY_RELEASE__: JSON.stringify(process.env.SENTRY_RELEASE ?? ''),
  },

  css: {
    modules: {
      // Match the existing class name pattern from webpack css-loader
      generateScopedName: '[name]-[local]-[hash:base64:6]',
    },
  },
}));
