import {
  Camera,
  ScanSearch,
  Fingerprint,
  Brain,
  ShieldCheck,
  Microscope,
  ShieldAlert,
  Copy,
  Layers,
  Globe2,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";

/** Resolve a string icon name (from content data) to a Lucide component. */
export const iconMap: Record<string, LucideIcon> = {
  Camera,
  ScanSearch,
  Fingerprint,
  Brain,
  ShieldCheck,
  Microscope,
  ShieldAlert,
  Copy,
  Layers,
  Globe2,
  LifeBuoy,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? ScanSearch;
}
