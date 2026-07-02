import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

// OpenNext → Cloudflare config.
//
// incrementalCache (KV binding NEXT_INC_CACHE_KV) stores the prerendered/ISR
// pages, and enableCacheInterception serves them without booting the whole
// Next server. Without this, EVERY page request re-rendered from scratch,
// which blew past the Workers free-plan CPU limit (error 1102) as soon as the
// custom domain brought real traffic.
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  enableCacheInterception: true,
});
