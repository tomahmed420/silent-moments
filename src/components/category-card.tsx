import { Link } from "@tanstack/react-router";
import {
  Sunrise,
  Bird,
  CloudRain,
  Cloud,
  Waves,
  Home,
  Trees,
  Sunset,
  Leaf,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  sunrise: Sunrise,
  bird: Bird,
  "cloud-rain": CloudRain,
  cloud: Cloud,
  waves: Waves,
  home: Home,
  trees: Trees,
  sunset: Sunset,
};

export function CategoryCard({
  slug,
  name_bn,
  name_en,
  icon,
}: {
  slug: string;
  name_bn: string;
  name_en: string;
  icon?: string | null;
}) {
  const Icon = (icon && ICONS[icon]) || Leaf;
  return (
    <Link
      to="/category/$slug"
      params={{ slug }}
      className="group flex flex-col items-start gap-3 rounded-2xl border border-border/60 bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:soft-shadow"
    >
      <div className="grid h-11 w-11 place-items-center rounded-full bg-secondary/60 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="font-display text-base font-medium text-foreground">{name_bn}</div>
        <div className="text-xs text-muted-foreground">{name_en}</div>
      </div>
    </Link>
  );
}
