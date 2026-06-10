import { Zap, ShieldAlert } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/fx/Reveal";
import { IdentifyTool } from "@/components/identify/IdentifyTool";

/** The identifier tool, given its own section just below the hero. */
export function IdentifySection() {
  return (
    <section id="identify" className="relative py-16">
      <div className="container-px">
        <SectionHeading
          eyebrow="Free AI tool"
          title={<>Identify your spider <span className="text-gradient">right now</span></>}
          subtitle="Drop a photo below and get the most likely species, a confidence score and a clear venom-risk indicator — in under three seconds."
        />
        <Reveal delay={0.1}>
          <div className="mx-auto mt-12 max-w-2xl">
            <div className="mb-3 flex items-center justify-center gap-4 text-xs text-foreground/50">
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-gold" /> Instant result
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-[rgb(var(--crimson-soft))]" /> Venom risk flagged
              </span>
            </div>
            <IdentifyTool />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
