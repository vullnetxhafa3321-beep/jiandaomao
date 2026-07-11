/**
 * Vercel serverless entry — same Express app as local (`npm run serve`).
 * SQLite lives under /tmp and is re-seeded on cold start so demos always work.
 */
import app from '../server/src/app.js';

export default app;
