const webpack = require('webpack');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const productionGzipExtensions = ['js', 'css'];
const isProduction = process.env.NODE_ENV === 'production';
// const AutoImport = require('unplugin-auto-import/webpack');
const Components = require('unplugin-vue-components/webpack');
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers');
const TerserPlugin = require('terser-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const path = require('path')

const proxyUrl =
  process.env.BUILD_ENV === 'prod'
    ? 'https://wallet.nerve.network/'
    : 'http://seeda.nuls.io:8009';

const port = process.env.BUILD_ENV === 'prod' ? 8031 : 8033;
module.exports = {
  // transpileDependencies: ['@injectivelabs'],
  publicPath: '/',
  chainWebpack: config => {
    config.resolve.alias.set('nerveswap-sdk', path.join(__dirname, 'src/sdk'));
    // console.log(config.optimization.minimizer('terser'), 22)
    config.optimization.minimizer('terser').tap(args => {
      const compress = args[0].terserOptions.compress;
      compress.drop_console = true;
      compress.pure_funcs = ['console.log'];
      return args;
    });
  },
  configureWebpack: config => {
    // element-plus import es-module
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto'
    });
    if (isProduction) {
      config.plugins.push(
        new CompressionWebpackPlugin({
          algorithm: 'gzip',
          test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
          threshold: 10240,
          minRatio: 0.8
        })
      );
    }
    /* console.log(
      config.optimization.minimizer[0].options.minimizer.options.compress,
      333
    ); */
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env': {
          BUILD_ENV: JSON.stringify(process.env.BUILD_ENV)
        }
      })
    );
    /*config.plugins.push(
      AutoImport({
        resolvers: [ElementPlusResolver()]
      })
    );*/
    config.plugins.push(
      Components({
        resolvers: [ElementPlusResolver()]
      })
    );
    config.optimization.splitChunks = {
      chunks: 'all',
      maxAsyncRequests: 5,
      maxInitialRequests: 5,
      cacheGroups: {
        'nerve-sdk-js': {
          name: 'sdk-chunk',
          // test: /[\\/]node_modules[\\/](jsrsasign|nerve-sdk-js)/,
          test: /[\\/]node_modules[\\/](nerve-sdk-js|jsrsasign)/,
          priority: -7
        },
        'element-plus': {
          name: 'ui-chunk',
          test: /[\\/]node_modules[\\/](element-plus)/,
          priority: -8
        },
        echarts: {
          name: 'echarts-chunk',
          test: /[\\/]node_modules[\\/](echarts|zrender)/,
          priority: -9
        },
        ethers: {
          name: 'ethers-chunk',
          test: /[\\/]node_modules[\\/](ethers|web3)/,
          priority: -10
        }
        /*vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -20
        }*/
      }
    };
    /* config.optimization.minimizer['TerserPluginIndex'] = new TerserPlugin({
      terserOptions: {
        warnings: false,
        format: {
          comments: false
        },
        compress: {
          drop_debugger: true,
          drop_console: true,
          pure_funcs: ['console.log']
        }
      },
      extractComments: false,
      parallel: true
    }); */
    config.devtool = !isProduction ? 'cheap-module-source-map' : false;

    // fix node env
    config.plugins.push(new NodePolyfillPlugin());
    // fix tiny-secp256k1 wasm
    config.experiments = {
      asyncWebAssembly: true,
      topLevelAwait: true
    };
    // config.optimization.minimizer[0].options.compress = {
    //   drop_console: true
    // };
    // config.plugins.push(new BundleAnalyzerPlugin());
  },
  css: {
    extract: !isProduction ? false : { ignoreOrder: true },
    sourceMap: !isProduction
  },

  devServer: {
    port,
    host: '0.0.0.0',
    https: false,
    open: true,
    proxy: {
      '/api': {
        target: proxyUrl,
        changeOrigin: true,
        pathRewrite: {
          // "^/api": ""
        }
      },
      '/test': {
        target: 'http://xm_mp_dev.zhoulijun.top/api',
        changeOrigin: true,
        pathRewrite: {
          '^/test': ''
        }
      }
    },
    client: {
      overlay: false
    }
  }
};
