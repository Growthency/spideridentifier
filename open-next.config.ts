import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";

// OpenNext → Cloudflare config.
//
// incrementalCache (KV binding NEXT_INC_CACHE_KV) stores the prerendered/ISR
// pages, and enableCacheInterception serves them without booting the whole
// Next server. Without this, EVERY page request re-rendered from scratch,
// which blew past the Workers free-plan CPU limit (error 1102) as soon as the
// custom domain brought real traffic.
//
// queue handles the stale-page revalidations the interceptor schedules. The
// default is a dummy that THROWS ("Dummy queue is not implemented"), which
// turned every page into a 500 the moment its cache entry went stale.
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  queue: memoryQueue,
  enableCacheInterception: true,
});
