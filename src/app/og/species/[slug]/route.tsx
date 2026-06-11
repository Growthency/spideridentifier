import { getSpeciesBySlugData } from "@/lib/data";
import { siteConfig } from "@/lib/site";
import { composeOgJpeg, loadPhoto, ogResponse, OgFrame, OgChip } from "@/lib/og";

const VENOM_CHIP: Record<string, "red" | "amber" | "green"> = {
  dangerous: "red",
  caution: "amber",
  mild: "green",
  harmless: "green",
};

/**
 * Social-share card for species pages — photo + common/scientific name +
 * venom-risk chip, served as a lightweight JPEG for instant link previews.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const species = await getSpeciesBySlugData(slug);
  const photo = await loadPhoto("species", slug);
  const name = species?.common_name ?? "Spider species";
  const sci = species?.scientific_name ?? "";
  const venom = (species?.venom_level ?? "harmless").toLowerCase();
  const host = new URL(siteConfig.url).hostname;

  const jpeg = await composeOgJpeg(
    photo,
    <OgFrame withPhoto={Boolean(photo)} host={host}>
      <div style={{ display: "flex", gap: 14 }}>
        <OgChip color={VENOM_CHIP[venom] ?? "green"}>
          {venom === "harmless" ? "harmless to humans" : `${venom} venom risk`}
        </OgChip>
        {species?.family && <OgChip>{species.family}</OgChip>}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 22,
          fontSize: 68,
          fontWeight: 800,
          color: "#F8FAF9",
          lineHeight: 1.08,
          letterSpacing: -1,
        }}
      >
        {name}
      </div>
      {sci && (
        <div
          style={{
            display: "flex",
            marginTop: 10,
            fontSize: 34,
            fontStyle: "italic",
            color: "rgba(248,250,249,0.72)",
          }}
        >
          {sci}
        </div>
      )}
    </OgFrame>
  );

  return ogResponse(jpeg);
}
