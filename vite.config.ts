/// <reference types="vitest/config" />
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * D22 — CSP `connect-src` allowlist. Injected only into production builds so
 * dev HMR (websocket + inline react-refresh) keeps working. The shipped app
 * may fetch exclusively from Open-Meteo (forecast + air quality) and
 * Nominatim, everything else is blocked.
 */
function injectCsp(): Plugin {
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://api.open-meteo.com https://air-quality-api.open-meteo.com https://nominatim.openstreetmap.org",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join('; ')

  return {
    name: 'inject-csp',
    apply: 'build',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const meta = `    <meta http-equiv="Content-Security-Policy" content="${csp}" />`
        return html.replace('<head>', `<head>\n${meta}`)
      },
    },
  }
}

export default defineConfig({
  plugins: [injectCsp(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})