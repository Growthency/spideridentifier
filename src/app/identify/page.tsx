import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { IdentifyTool } from "@/components/identify/IdentifyTool";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Faq } from "@/components/sections/Faq";
import { Reveal } from "@/components/fx/Reveal";
import { Camera, Sun, Crop, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Identify a Spider — Free AI Spider Identifier by Photo",
  description:
    "Upload a spider photo and identify the species in seconds with venom-risk indicators, confidence scores and look-alike alerts. Free, no app required.",
  alternates: { canonical: "/identify" },
};

const tips = [
  { icon: Sun, title: "Good light", desc: "Soft, even daylight reveals true colours and real markings." },
  { icon: Crop, title: "Fill the frame", desc: "Get the spider large in the shot while keeping it sharp." },
  { icon: Camera, title: "Side angle", desc: "A slight side view shows body shape and leg stance at once." },
  { icon: ShieldAlert, title: "Stay safe", desc: "Never crowd a spider you suspect is venomous — use zoom." },
];

export default function IdentifyPage() {
  return (
    <>
      <PageHero
        eyebrow="AI Spider Identifier"
        title={<>Identify your spider <span className="text-gradient">right now</span></>}
        subtitle="Drop a photo below. In under three seconds you'll get the most likely species, a confidence score and a clear venom-risk indicator."
      />

      <section className="relative pb-12">
        <div className="container-px">
          <div className="mx-auto max-w-2xl">
            <IdentifyTool />
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 lg:grid-cols-4">
            {tips.map((t, i) => (
              <Reveal key={t.title} delay={(i % 4) * 0.07}>
                <div className="h-full rounded-2xl border border-foreground/8 bg-card/50 p-5 text-center">
                  <t.icon className="mx-auto h-6 w-6 text-gold" />
                  <h3 className="mt-3 font-display text-sm font-bold">{t.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/55">{t.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      <Faq />
    </>
  );
}
