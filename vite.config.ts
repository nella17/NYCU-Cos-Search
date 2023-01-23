import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import vuetify from 'vite-plugin-vuetify'
import { chromeExtension } from 'vite-plugin-chrome-extension'

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    build: {
        minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false,
        rollupOptions: {
            input: './src/manifest.json',
        },
    },
    plugins: [
        vue(),
        AutoImport({
            include: [
                /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
                /\.vue$/,
                /\.vue\?vue/, // .vue
                /\.md$/, // .md
            ],
            imports: [
                'vue', //
                'pinia',
            ],
            dirs: [
                './src/composables',
            ],
            dts: 'include/auto-imports.d.ts',
        }),
        Components({
            directoryAsNamespace: true,
            dirs: ['./src/components'],
            extensions: ['vue'],
            include: [/\.vue$/, /\.vue\?vue/],
            dts: './include/components.d.ts',
        }),
        vuetify(),
        chromeExtension() as any,
    ],
})
