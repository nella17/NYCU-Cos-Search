import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { chromeExtension } from 'vite-plugin-chrome-extension'
import ViteCSSinJS from './build/ViteCSSinJS'

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    build: {
        rollupOptions: {
            input: 'src/manifest.json',
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
            ],
            dts: 'include/auto-imports.d.ts',
        }),
        Components({
            directoryAsNamespace: true,
            dirs: ['src/components'],
            extensions: ['vue'],
            include: [/\.vue$/, /\.vue\?vue/],
            dts: 'include/components.d.ts',
        }),
        chromeExtension() as any,
        ViteCSSinJS(),
    ],
})
