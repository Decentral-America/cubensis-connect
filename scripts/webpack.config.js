const FolderZip = require('folder-zip');
const ncp = require('ncp').ncp;
const path = require('path');
const webpack = require('webpack');
const metaConf = require('./meta.conf');
const WebpackCustomActions = require('./WebpackCustomActionsPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const getLocales = require('./lokalise');
const updateManifest = require('./updateManifest');

function ncpAsync(from, to) {
  return new Promise((resolve, reject) => {
    ncp(from, to, (err) => (err ? reject(err) : resolve()));
  });
}

function zipFolder(from, to) {
  return new Promise((resolve, reject) => {
    const zip = new FolderZip();

    zip.zipFolder(from, { excludeParentFolder: true }, (err) => {
      if (err) {
        return reject(err);
      }

      try {
        zip.writeToFileSync(to);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
}

module.exports = ({ version, DIST, LANGS, PAGE_TITLE, PLATFORMS, isProduction }) => {
  const SOURCE_FOLDER = path.resolve(__dirname, '../', 'src');
  const DIST_FOLDER = path.resolve(__dirname, '../', DIST);
  const BUILD_FOLDER = path.resolve(DIST_FOLDER, 'build');

  const getPlatforms = () => {
    const platformsConfig = metaConf(version);

    PLATFORMS.reduce(async (prevPromise, platformName) => {
      await prevPromise;

      const platformFolder = path.join(DIST_FOLDER, platformName);
      await ncpAsync(BUILD_FOLDER, platformFolder);

      updateManifest(
        path.join(BUILD_FOLDER, 'manifest.json'),
        platformsConfig[platformName].manifest,
        path.join(platformFolder, 'manifest.json'),
      );

      console.log(`Copying to ${platformName} is done`);

      if (isProduction) {
        await zipFolder(
          platformFolder,
          path.join(DIST_FOLDER, `cubensis-connect-${version}-${platformName}.zip`),
        );

        console.log(`Zipping ${platformName} is done`);

        if (platformName === 'edge') {
          console.log('-= Build AppX for Edge =-');
          require('./edgeExt');
          console.log('-= Build AppX for Edge ended =-');
        }
      }
    }, Promise.resolve());
  };

  const plugins = [];

  if (process.stdout.isTTY) {
    plugins.push(new webpack.ProgressPlugin());
  }

  plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      __SENTRY_DSN__: JSON.stringify(process.env.SENTRY_DSN),
      __SENTRY_ENVIRONMENT__: JSON.stringify(process.env.SENTRY_ENVIRONMENT),
      __SENTRY_RELEASE__: JSON.stringify(process.env.SENTRY_RELEASE),
    }),
  );

  plugins.push(
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(SOURCE_FOLDER, 'copied'),
          to: BUILD_FOLDER,
        },
      ],
    }),
  );

  plugins.push(new MiniCssExtractPlugin({ filename: 'index.css' }));

  plugins.push(
    new HtmlWebpackPlugin({
      title: PAGE_TITLE,
      filename: 'popup.html',
      template: path.resolve(SOURCE_FOLDER, 'popup.html'),
      hash: true,
      excludeChunks: ['background', 'contentscript', 'inpage'],
    }),
  );

  plugins.push(
    new HtmlWebpackPlugin({
      title: PAGE_TITLE,
      filename: 'notification.html',
      template: path.resolve(SOURCE_FOLDER, 'notification.html'),
      hash: true,
      excludeChunks: ['background', 'contentscript', 'inpage'],
    }),
  );
  plugins.push(
    new WebpackCustomActions({
      onBuildStart: [() => getLocales(LANGS, 'src/copied/_locales')],
    }),
  );

  plugins.push(new WebpackCustomActions({ onBuildEnd: [getPlatforms] }));

  return {
    stats: 'errors-warnings',
    entry: {
      ui: path.resolve(SOURCE_FOLDER, 'ui'),
      background: path.resolve(SOURCE_FOLDER, 'background'),
      contentscript: path.resolve(SOURCE_FOLDER, 'contentscript'),
      inpage: path.resolve(SOURCE_FOLDER, 'inpage'),
    },
    output: {
      filename: '[name].js',
      path: BUILD_FOLDER,
      publicPath: './',
    },

    resolve: {
      alias: {
        // Path aliases matching tsconfig baseUrl paths
        ui: path.resolve(SOURCE_FOLDER, 'ui'),
        controllers: path.resolve(SOURCE_FOLDER, 'controllers'),
        lib: path.resolve(SOURCE_FOLDER, 'lib'),
        wallets: path.resolve(SOURCE_FOLDER, 'wallets'),
        accounts: path.resolve(SOURCE_FOLDER, 'accounts'),
        assets: path.resolve(SOURCE_FOLDER, 'assets'),
        constants: path.resolve(SOURCE_FOLDER, 'constants.ts'),
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },

    plugins,

    module: {
      rules: [
        // Images — Webpack 5 asset modules (replaces url-loader + file-loader)
        {
          test: /\.(png|jpg|svg|gif)$/,
          type: 'asset',
          parser: { dataUrlCondition: { maxSize: 1000 } },
          generator: { filename: 'assets/img/[name][ext]' },
        },

        // Fonts — Webpack 5 asset/resource (replaces file-loader)
        {
          test: /\.(woff|woff2|ttf|otf)$/,
          type: 'asset/resource',
          generator: { filename: 'assets/fonts/[name][ext]' },
        },

        // TypeScript + TSX — babel-loader with @babel/preset-typescript (replaces awesome-typescript-loader)
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },

        // JavaScript
        {
          test: /\.(jsx?)$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },

        // obs-store (needs transpiling)
        {
          test: /obs-store/,
          use: 'babel-loader',
        },

        // Stylus — MiniCssExtractPlugin (replaces extract-text-webpack-plugin)
        {
          test: /\.styl$/,
          exclude: [/node_modules/],
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]-[local]-[hash:base64:6]',
                },
              },
            },
            'stylus-loader',
          ],
        },

        // CSS modules
        {
          test: /\.module\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: '[name]-[local]-[hash:base64:6]',
                },
              },
            },
          ],
        },

        // Plain CSS
        {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
  };
};
