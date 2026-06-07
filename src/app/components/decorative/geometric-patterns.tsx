/**
 * Khapeer — Desert Luxury Geometric Pattern Library
 *
 * Guardrail: Tessellating patterns are exported as CSS background-image data URIs
 * to avoid DOM bloat. Only one-off decorative elements (dividers, single stars)
 * are exported as React components.
 *
 * Usage:
 *   - Apply `style={islamicStarPattern(0.06)}` on a container div
 *   - Or use CSS classes: `.pattern-islamic-star`, `.pattern-arabesque-mesh`
 *   - One-off: <DiamondDivider />, <IslamicStarIcon />
 */
import { cn } from "../ui/utils";

/* ═══════════════════════════════════════════════════════════
   SVG → Data URI encoder (minimal, safe for CSS url())
   ═══════════════════════════════════════════════════════════ */
function svgToDataUri(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/* ═══════════════════════════════════════════════════════════
   1. ISLAMIC 8-POINT STAR (Rub el Hizb)
   Two overlapping squares rotated 45° — classic Islamic geometry.
   Exported as a CSS background-image data URI for tessellation.
   ═══════════════════════════════════════════════════════════ */
function buildIslamicStarSvg(color: string, size: number): string {
  const half = size / 2;
  const inner = size * 0.2; // inner star radius
  const outer = size * 0.45; // outer star radius
  // 8-point star path computed from alternating inner/outer radii
  const points: string[] = [];
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16 - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    const x = half + r * Math.cos(angle);
    const y = half + r * Math.sin(angle);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><polygon points="${points.join(" ")}" fill="none" stroke="${color}" stroke-width="0.6"/></svg>`;
}

/**
 * Returns a CSS style object with Islamic star tessellation as background.
 * @param opacity — stroke opacity (0.03–0.12 recommended for subtlety)
 * @param size — tile size in px (default 48)
 * @param color — stroke color (defaults to emerald primary)
 */
export function islamicStarPattern(
  opacity = 0.06,
  size = 48,
  color = `rgba(13, 148, 136, ${opacity})`
): React.CSSProperties {
  const svg = buildIslamicStarSvg(color, size);
  return {
    backgroundImage: svgToDataUri(svg),
    backgroundRepeat: "repeat",
    backgroundSize: `${size}px ${size}px`,
  };
}

/* ═══════════════════════════════════════════════════════════
   2. ARABESQUE MESH
   Interlocking curved lines creating an organic lattice.
   Lighter than Islamic star — good for card backgrounds.
   ═══════════════════════════════════════════════════════════ */
function buildArabesqueSvg(color: string, size: number): string {
  const h = size;
  const w = size;
  const q = size / 4;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="M0 ${h / 2} Q${q} 0 ${w / 2} ${h / 2} Q${w - q} ${h} ${w} ${h / 2}" fill="none" stroke="${color}" stroke-width="0.5"/><path d="M${w / 2} 0 Q${w} ${q} ${w / 2} ${h / 2} Q0 ${h - q} ${w / 2} ${h}" fill="none" stroke="${color}" stroke-width="0.5"/></svg>`;
}

/**
 * Arabesque interlocking mesh as CSS background.
 * @param opacity — 0.04–0.10 recommended
 * @param size — tile size (default 40)
 */
export function arabesquePattern(
  opacity = 0.05,
  size = 40,
  color = `rgba(13, 148, 136, ${opacity})`
): React.CSSProperties {
  const svg = buildArabesqueSvg(color, size);
  return {
    backgroundImage: svgToDataUri(svg),
    backgroundRepeat: "repeat",
    backgroundSize: `${size}px ${size}px`,
  };
}

/* ═══════════════════════════════════════════════════════════
   3. GEOMETRIC HEXAGONAL MESH
   Honeycomb tessellation — upgrade from the dot grid.
   ═══════════════════════════════════════════════════════════ */
function buildHexMeshSvg(color: string, size: number): string {
  const w = size;
  const h = size * Math.sqrt(3);
  const r = size / 2;
  // Regular hexagon centered at (w/2, h/2)
  const hex = (cx: number, cy: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      pts.push(`${(cx + r * 0.55 * Math.cos(a)).toFixed(2)},${(cy + r * 0.55 * Math.sin(a)).toFixed(2)}`);
    }
    return pts.join(" ");
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w.toFixed(1)}" height="${h.toFixed(1)}" viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}"><polygon points="${hex(w / 2, h / 2)}" fill="none" stroke="${color}" stroke-width="0.4"/><polygon points="${hex(0, 0)}" fill="none" stroke="${color}" stroke-width="0.4"/><polygon points="${hex(w, 0)}" fill="none" stroke="${color}" stroke-width="0.4"/><polygon points="${hex(0, h)}" fill="none" stroke="${color}" stroke-width="0.4"/><polygon points="${hex(w, h)}" fill="none" stroke="${color}" stroke-width="0.4"/></svg>`;
}

/**
 * Hexagonal mesh as CSS background.
 * @param opacity — 0.04–0.08 recommended
 * @param size — tile width (default 32)
 */
export function hexMeshPattern(
  opacity = 0.05,
  size = 32,
  color = `rgba(13, 148, 136, ${opacity})`
): React.CSSProperties {
  const svg = buildHexMeshSvg(color, size);
  return {
    backgroundImage: svgToDataUri(svg),
    backgroundRepeat: "repeat",
    backgroundSize: `${size}px ${(size * Math.sqrt(3)).toFixed(1)}px`,
  };
}

/* ═══════════════════════════════════════════════════════════
   4. GOLD GEOMETRIC ACCENT PATTERN
   Same Islamic star but with gold tones — for featured cards.
   ═══════════════════════════════════════════════════════════ */
export function goldStarPattern(
  opacity = 0.06,
  size = 48,
  color = `rgba(202, 138, 4, ${opacity})`
): React.CSSProperties {
  return islamicStarPattern(opacity, size, color);
}

/* ═══════════════════════════════════════════════════════════
   ONE-OFF DECORATIVE COMPONENTS (inline SVG — used sparingly)
   These are NOT tiling patterns — single instances only.
   ═══════════════════════════════════════════════════════════ */

/**
 * Single 8-point Islamic star icon — for logo frames, badge accents.
 */
export function IslamicStarIcon({
  className,
  size = 24,
  ...props
}: React.SVGProps<SVGSVGElement> & { size?: number }) {
  const half = size / 2;
  const inner = size * 0.2;
  const outer = size * 0.45;
  const points: string[] = [];
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 * i) / 16 - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    points.push(`${(half + r * Math.cos(angle)).toFixed(2)},${(half + r * Math.sin(angle)).toFixed(2)}`);
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={cn("shrink-0", className)}
      {...props}
    >
      <polygon
        points={points.join(" ")}
        fill="currentColor"
        fillOpacity={0.15}
        stroke="currentColor"
        strokeWidth={0.8}
      />
    </svg>
  );
}

/**
 * Ornamental diamond divider — for section breaks.
 * Renders a horizontal line with a centered diamond motif.
 */
export function DiamondDivider({
  className,
  color = "var(--primary)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <div
      className={cn("relative my-6 h-px", className)}
      aria-hidden
    >
      {/* Gradient line */}
      <div
        className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}33 20%, ${color}66 50%, ${color}33 80%, transparent)`,
        }}
      />
      {/* Center diamond */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className="h-2.5 w-2.5 rotate-45 border"
          style={{
            borderColor: color,
            background: "var(--background)",
            opacity: 0.6,
          }}
        />
      </div>
    </div>
  );
}

/**
 * Decorative gold filigree corner — ONE per card maximum.
 * Absolutely positioned; use on a `relative overflow-hidden` parent.
 */
export function GoldFiligreeCorner({
  position = "top-right",
  size = 80,
  className,
}: {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  size?: number;
  className?: string;
}) {
  const posClass = {
    "top-right": "top-0 right-0",
    "top-left": "top-0 left-0 scale-x-[-1]",
    "bottom-right": "bottom-0 right-0 scale-y-[-1]",
    "bottom-left": "bottom-0 left-0 scale-[-1]",
  }[position];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      className={cn("absolute pointer-events-none opacity-20", posClass, className)}
      aria-hidden
    >
      <path
        d="M0 0 Q40 0 40 40 Q40 0 80 0"
        stroke="url(#gold-grad)"
        strokeWidth="0.8"
        fill="none"
      />
      <path
        d="M0 0 Q0 40 40 40 Q0 40 0 80"
        stroke="url(#gold-grad)"
        strokeWidth="0.8"
        fill="none"
      />
      <circle cx="20" cy="20" r="2" fill="url(#gold-grad)" opacity="0.5" />
      <defs>
        <linearGradient id="gold-grad" x1="0" y1="0" x2="80" y2="80">
          <stop offset="0%" stopColor="hsl(43, 96%, 56%)" />
          <stop offset="50%" stopColor="hsl(38, 100%, 68%)" />
          <stop offset="100%" stopColor="hsl(43, 96%, 45%)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
