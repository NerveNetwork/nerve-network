import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import viteCompression from 'vite-plugin-compression'
import { viteCommonjs, esbuildCommonjs } from '@originjs/vite-plugin-commonjs'
import { visualizer } from 'rollup-plugin-visualizer'
import commonjs from 'vite-plugin-commonjs'

export default defineConfig(({ mode }) => {
  const isBeta = mode === 'beta'
  const proxyUrl = !isBeta
    ? 'https://wallet.nerve.network/'
    : 'http://seeda.nuls.io:8009'
  const port = !isBeta ? 8031 : 8033
  const isDEV = process.env.NODE_ENV === 'development'

  return {
    optimizeDeps: {
      exclude: ['tiny-secp256k1'] // fix commonjs wasm,
      // include: ['axios']
    },
    plugins: [
      wasm(),
      topLevelAwait(),
      vue(),
      nodePolyfills(),
      Icons({
        compiler: 'vue3',
        customCollections: {
          custom: FileSystemIconLoader('./src/assets/icons')
        },
        scale: 1,
        defaultClass: 'inline-block',
        autoInstall: true
      }),
      Components({
        resolvers: [
          ElementPlusResolver(),
          IconsResolver({
            customCollections: ['custom']
          })
        ]
      }),
      viteCompression({
        algorithm: 'gzip',
        filter: /\.(js|mjs|json|css)$/i,
        threshold: 102400,
        ext: 'gz'
      })
      // visualizer({ open: true })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'nerveswap-sdk': path.resolve(__dirname, './src/sdk')
      }
    },
    server: {
      host: true,
      port,
      proxy: {
        '/api': {
          target: proxyUrl,
          changeOrigin: true
          // rewrite: path => path.replace(/^\/api/, '')
        }
      }
    },
    // esbuild: {
    //   drop: isBeta || isDEV ? [] : ['console', 'debugger']
    // },
    build: {
      minify: 'esbuild',
      // minify: false,
      outDir: 'dist',
      assetsDir: 'assets',
      // sourcemap: true,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames: 'js/chunks/[name]-[hash].js',
          assetFileNames: assetInfo => {
            const imgExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']
            const fontExts = ['.ttf', '.otf', '.woff', '.woff2']
            const videoExts = ['.mp4', '.webm', '.ogg']
            const audioExts = ['.mp3', '.wav', '.flac', '.aac']
            const otherExts = ['.json', '.pdf', '.txt']

            const fileName = (assetInfo.name || '').toLowerCase()
            // const ext = fileName.split('.').pop() || ''

            if (fileName.endsWith('.css')) {
              return 'static/css/[name].[hash].[ext]'
            } else if (imgExts.some(ext => fileName.endsWith(ext))) {
              return 'static/images/[name].[hash].[ext]'
            } else if (fontExts.some(ext => fileName.endsWith(ext))) {
              return 'static/fonts/[name].[hash].[ext]'
            } else if (videoExts.some(ext => fileName.endsWith(ext))) {
              return 'static/media/video/[name].[hash].[ext]'
            } else if (audioExts.some(ext => fileName.endsWith(ext))) {
              return 'static/media/audio/[name].[hash].[ext]'
            } else if (otherExts.some(ext => fileName.endsWith(ext))) {
              return 'static/other/[name]-[hash].[ext]'
            }
            return 'static/[name].[hash].[ext]'
          },
          manualChunks: {
            'v-vendor': ['vue', 'vue-router'],
            ele: ['element-plus'],
            echarts: ['echarts'],
            lodash: ['lodash'],
            nsk: ['nerve-sdk-js'],
            fch: ['fch-sdk'],
            tbc: ['tbc-contract', 'tbc-lib-js'],
            ethers: ['ethers'],
            tronweb: ['tronweb'],
            vendor: ['pinia', 'vue-toastification', 'bignumber.js', 'axios']
          }
        }
      }
    }
  }
})
