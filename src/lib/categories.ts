import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import {
  Laptop,
  GraduationCap,
  HeartPulse,
  Briefcase,
  FlaskConical,
  UtensilsCrossed,
  Target,
  Plane,
  Scale,
  Wallet,
  Dumbbell,
  Palette,
} from "lucide-react";

export const CATEGORY_IDS = [
  "tech",
  "education",
  "health",
  "business",
  "science",
  "food",
  "activity",
  "travel",
  "legal",
  "finance",
  "sports",
  "arts",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export interface CategoryDef {
  id: CategoryId;
  label: string;
  icon: LucideIcon;
}

export const CATEGORIES: CategoryDef[] = [
  { id: "tech",       label: "تقنية وبرمجيات",      icon: Laptop },
  { id: "education",  label: "تعليم وأكاديميا",     icon: GraduationCap },
  { id: "health",     label: "صحة وطب وعيادات",     icon: HeartPulse },
  { id: "business",   label: "ريادة وأعمال تجارية", icon: Briefcase },
  { id: "science",    label: "علوم وبحوث",          icon: FlaskConical },
  { id: "food",       label: "مطاعم ومأكولات",      icon: UtensilsCrossed },
  { id: "activity",   label: "نشاطات وترفيه",       icon: Target },
  { id: "travel",     label: "سياحة وسفر",          icon: Plane },
  { id: "legal",      label: "قانون وأنظمة",        icon: Scale },
  { id: "finance",    label: "مالية واستثمار",      icon: Wallet },
  { id: "sports",     label: "رياضة ولياقة",       icon: Dumbbell },
  { id: "arts",       label: "فنون وإبداع",         icon: Palette },
];

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label])
);

const LABEL_TO_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.label, c.id])
) as Record<string, CategoryId>;

const BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryId,
  CategoryDef
>;

export function isCategoryId(value: string): value is CategoryId {
  return (CATEGORY_IDS as readonly string[]).includes(value);
}

export function resolveCategoryId(nameOrId: string): CategoryId | undefined {
  if (isCategoryId(nameOrId)) return nameOrId;
  return LABEL_TO_ID[nameOrId];
}

export function getCategoryById(id: string): CategoryDef | undefined {
  return isCategoryId(id) ? BY_ID[id] : undefined;
}

/** Inline style hook for category accent tokens (--cat-color). */
export function categoryAccentStyle(id: string): CSSProperties {
  const resolved = resolveCategoryId(id);
  if (!resolved) return {};
  return { "--cat-color": `var(--cat-${resolved})` } as CSSProperties;
}

/** Tailwind-safe dot class backed by design tokens. */
export function getCategoryDotClass(nameOrId: string): string {
  const id = resolveCategoryId(nameOrId);
  return id ? `category-dot category-dot--${id}` : "category-dot";
}

export function getCategoryChipClass(selected = false): string {
  return selected ? "category-chip category-chip--selected" : "category-chip";
}
