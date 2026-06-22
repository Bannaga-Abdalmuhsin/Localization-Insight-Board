import { cn } from "@/lib/utils";

const LOGOS: Record<string, { src: string; alt: string }> = {
  aces: { src: "/aces-logo.png", alt: "ACES" },
  mac:  { src: "/mac-logo.png",  alt: "MAC"  },
  anet: { src: "/anet-logo.png", alt: "ANET" },
};

export const REGION_AR: Record<string, string> = {
  Central: "المنطقة الوسطى",
  East:    "المنطقة الشرقية",
  South:   "المنطقة الجنوبية",
  West:    "المنطقة الغربية",
};

interface CompanyLogoProps {
  company: string;
  className?: string;
}

export default function CompanyLogo({ company, className }: CompanyLogoProps) {
  const logo = LOGOS[company.toLowerCase()];
  if (!logo) return <span className="text-sm text-muted-foreground">{company}</span>;
  return (
    <img
      src={logo.src}
      alt={logo.alt}
      className={cn("h-7 w-auto object-contain", className)}
    />
  );
}
