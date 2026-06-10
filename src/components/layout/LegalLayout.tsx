import { PageHero } from "@/components/layout/PageHero";
import { Reveal } from "@/components/fx/Reveal";
import type { LegalDoc } from "@/content/legal";

export function LegalLayout({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <PageHero eyebrow={doc.eyebrow} title={doc.title} subtitle={doc.intro} />
      <section className="relative pb-16">
        <div className="container-px">
          <div className="mx-auto max-w-3xl">
            <p className="mb-10 text-sm text-foreground/45">Last updated: {doc.updated}</p>
            <div className="space-y-10">
              {doc.sections.map((s, i) => (
                <Reveal key={s.h} delay={(i % 4) * 0.04}>
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">{s.h}</h2>
                    <div className="mt-3 space-y-3">
                      {s.p.map((para, j) => (
                        <p key={j} className="leading-relaxed text-foreground/70">
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
