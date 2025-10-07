import { defineConfig } from 'vite';

// 👇 Define your custom externals here
export default defineConfig({
    build: {
        rollupOptions: {
            external: [
                '@mf-single-spa-demo/api',
            ],
            output: {
                globals: {
                    '@mf-single-spa-demo/api': '@mf-single-spa-demo/api',
                }
            }
        }
    }
});