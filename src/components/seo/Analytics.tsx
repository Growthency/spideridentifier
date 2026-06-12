import Script from "next/script";

// The site's GA4 web stream. Measurement IDs are public by design (visible
// in any page's source); env var overrides for a different property.
const DEFAULT_GA_ID = "G-7TQ5XQZ50F";

/**
 * Google Analytics 4 — loaded after hydration so it never competes with
 * page rendering.
 */
export function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || DEFAULT_GA_ID;
  if (!id) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
