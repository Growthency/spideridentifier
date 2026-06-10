import { Check, Minus } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/fx/Reveal";
import { comparison } from "@/content/home";
import { cn } from "@/lib/utils";

export function Comparison() {
  return (
    <section className="relative py-24">
      <div className="container-px">
        <SectionHeading
          eyebrow="The difference"
          title={<>Built for spiders — <span className="text-gradient">not generic photos</span></>}
          subtitle="A field guide is slow and a generic photo app is vague. Spider Identifier is tuned for one job and flags what matters: risk."
        />

        <Reveal>
          <div className="mt-14 overflow-hidden rounded-3xl border border-foreground/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="bg-foreground/[0.02] p-5 text-left font-medium text-foreground/50">Feature</th>
                    {comparison.columns.map((col, i) => (
                      <th
                        key={col}
                        className={cn(
                          "p-5 text-left font-display text-base font-bold",
                          i === 0
                            ? "bg-gold/[0.08] text-gold"
                            : "bg-foreground/[0.02] text-foreground/70"
                        )}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.rows.map((row, ri) => (
                    <tr key={row.feature} className="border-t border-foreground/8">
                      <td className="p-5 font-medium text-foreground/80">{row.feature}</td>
                      {row.values.map((val, ci) => (
                        <td
                          key={ci}
                          className={cn(
                            "p-5 text-foreground/70",
                            ci === 0 && "bg-gold/[0.04] font-medium text-foreground"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            {ci === 0 ? (
                              <Check className="h-4 w-4 shrink-0 text-gold" />
                            ) : val === "None" || val === "Rarely" || val.includes("Carry") || val.includes("expertise") ? (
                              <Minus className="h-4 w-4 shrink-0 text-foreground/30" />
                            ) : null}
                            {val}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
