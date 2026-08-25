import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'custom-network-url-display',
      configureServer(server) {
        const originalPrintUrls = server.printUrls.bind(server)

        server.printUrls = () => {
          const lanUrl = process.env.VITE_LAN_URL

          if (!lanUrl) {
            originalPrintUrls()
            return
          }

          const logger = server.config.logger
          logger.info('')
          logger.info(`  ➜  Local:   http://localhost:5173/`)
          logger.info(`  ➜  Network: ${lanUrl}/`)
        }
      },
    },
  ],
})