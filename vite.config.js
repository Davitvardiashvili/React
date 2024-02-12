import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   host: '0.0.0.0', // Set the host IP. '0.0.0.0' listens on all interfaces
  //   port: 5000, // Set your desired port
  // },
})
