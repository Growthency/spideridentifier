import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal OpenNext → Cloudflare config. Runs the full Next.js app (Node.js
// runtime) on Cloudflare Workers, so no route needs `export const runtime`.
//
// To add persistent ISR/data caching later, create an R2 bucket + KV and wire
// an incrementalCache here (see @opennextjs/cloudflare docs). Not required to
// deploy — pages just render on demand without it.
export default defineCloudflareConfig({});
