import { defineConfig, loadEnv } from 'vite';
import { fetchSocialsFor } from './api/lib/extractSocials.js';

// Mirrors api/socials.js (the Vercel serverless function used in production) so
// `npm run dev` has a working /api/socials endpoint too, without needing `vercel dev`.
function socialsApiPlugin() {
  return {
    name: 'leadgrid-socials-api',
    configureServer(server) {
      server.middlewares.use('/api/socials', async (req, res) => {
        const params = new URL(req.url, 'http://localhost').searchParams;
        const url = params.get('url') || '';
        const name = params.get('name') || '';
        const city = params.get('city') || '';
        const result = await fetchSocialsFor({ url, name, city });
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // TAVILY_API_KEY has no VITE_ prefix (it's server-only, must never reach the browser bundle),
  // so it needs an explicit loadEnv() to land in process.env for our Node-side middleware to read.
  const env = loadEnv(mode, process.cwd(), '');
  if (env.TAVILY_API_KEY) process.env.TAVILY_API_KEY = env.TAVILY_API_KEY;

  return {
    plugins: [socialsApiPlugin()],
  };
});
