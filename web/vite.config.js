import react from '@vitejs/plugin-react'
export default {
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    cors: true,
    headers: {
      'X-Frame-Options': 'ALLOWALL',
      'Access-Control-Allow-Origin': '*'
    },
    hmr: { clientPort: 443 }
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    cors: true
  }
}
