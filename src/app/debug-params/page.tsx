export const dynamic = "force-dynamic";

/** TEMP diagnostics page — removed after the searchParams issue is fixed. */
export default async function DebugParams({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <pre id="out" style={{ padding: 40 }}>
      {JSON.stringify({ params, renderedAt: new Date().toISOString() }, null, 2)}
    </pre>
  );
}
