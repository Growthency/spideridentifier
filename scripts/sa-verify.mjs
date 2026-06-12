/**
 * Make the service account a verified owner of the Search Console property
 * via the Site Verification API — bypasses the "email not found" UI bug.
 *
 *   node scripts/sa-verify.mjs token    → get the meta-tag token for the SA
 *   node scripts/sa-verify.mjs insert   → after the token is live on the site,
 *                                         register the SA as a verified owner
 */
import { createSign } from "node:crypto";
import { readFileSync } from "node:fs";

const SITE = "https://spideridentifier.online/";

// ── read creds from the downloaded service-account JSON ─────────────────────
// usage: node scripts/sa-verify.mjs token|insert [path-to-key.json]
const keyPath = process.argv[3] || "C:/Users/User/Downloads/spideridentifier-499202-189d7fbd6d50.json";
const sa = JSON.parse(readFileSync(keyPath, "utf8"));
const EMAIL = sa.client_email;
const KEY = sa.private_key;
if (!EMAIL || !KEY?.includes("BEGIN PRIVATE KEY")) {
  console.error("Could not read client_email/private_key from", keyPath);
  process.exit(1);
}

// ── OAuth token (siteverification scope) ─────────────────────────────────────
const b64url = (s) => Buffer.from(s).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
async function accessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: EMAIL,
      scope: "https://www.googleapis.com/auth/siteverification",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const sig = b64url(signer.sign(KEY));
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${sig}`,
    }),
  });
  if (!res.ok) throw new Error(`auth failed: ${await res.text()}`);
  return (await res.json()).access_token;
}

const mode = process.argv[2];
const token = await accessToken();
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

if (mode === "token") {
  const res = await fetch("https://www.googleapis.com/siteVerification/v1/token", {
    method: "POST",
    headers,
    body: JSON.stringify({
      site: { identifier: SITE, type: "SITE" },
      verificationMethod: "META",
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("getToken failed:", JSON.stringify(json, null, 2));
    process.exit(1);
  }
  // token comes back as a full <meta .../> tag — extract the content value
  const m = /content="([^"]+)"/.exec(json.token);
  console.log("META_TOKEN=" + (m ? m[1] : json.token));
} else if (mode === "insert") {
  const res = await fetch("https://www.googleapis.com/siteVerification/v1/webResource?verificationMethod=META", {
    method: "POST",
    headers,
    body: JSON.stringify({ site: { identifier: SITE, type: "SITE" } }),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("insert failed:", JSON.stringify(json, null, 2));
    process.exit(1);
  }
  console.log("SUCCESS — service account is now a verified owner of", SITE);
  console.log(JSON.stringify(json, null, 2));
} else {
  console.error("usage: node scripts/sa-verify.mjs token|insert");
  process.exit(1);
}
