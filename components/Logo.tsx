import Link from "next/link";

export type LogoProps = {
  /** Total width in px; height follows viewBox aspect (460×200). Default 200. */
  width?: number;
  href?: string;
  className?: string;
  /** `onDark`: uses light tones for dark backgrounds (footer, operator). */
  variant?: "default" | "onDark";
};

/**
 * WedPrint3D logo — interlocking rings with diamond, wordmark, and tagline.
 * Inline SVG for crisp rendering at any size.
 * Use `variant="onDark"` on charcoal / dark backgrounds.
 */
export function Logo({
  width = 200,
  href,
  className,
  variant = "default",
}: LogoProps) {
  const isDark = variant === "onDark";

  /* Color mapping per variant */
  const gold = "#C9A84C";
  const goldLight = isDark ? "#D4B65E" : "#C9A84C";
  const sage = isDark ? "#A8BF96" : "#6B7F5E";
  const charcoal = isDark ? "#F5F0E8" : "#2C2C2A";
  const tagline = isDark ? "rgba(245,240,232,0.5)" : "#9A978F";
  const diamondFill = isDark ? "#2C2C2A" : "#FAFAF7";
  const ringBg = isDark ? "rgba(201,168,76,0.08)" : "rgba(201,168,76,0.06)";

  const height = (width * 200) / 460;

  const svg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 460 200"
      width={width}
      height={height}
      className={className}
      aria-hidden
      focusable="false"
    >
      {/* ── Interlocking Rings + Diamond (centered top) ──── */}
      <g transform="translate(230, 56)">
        {/* Left ring — concentric circles for layered/3D-print look */}
        <g transform="translate(-14, 0)">
          <circle cx="0" cy="0" r="28" fill="none" stroke={gold} strokeWidth={1.8} />
          <circle cx="0" cy="0" r="24" fill="none" stroke={gold} strokeWidth={1} opacity={0.55} />
          <circle cx="0" cy="0" r="20" fill="none" stroke={gold} strokeWidth={0.6} opacity={0.3} />
          <circle cx="0" cy="0" r="16" fill={ringBg} stroke={gold} strokeWidth={0.4} opacity={0.15} />
        </g>

        {/* Right ring — clean single band */}
        <g transform="translate(14, 0)">
          <circle cx="0" cy="0" r="28" fill="none" stroke={gold} strokeWidth={1.8} />
          <circle cx="0" cy="0" r="24" fill="none" stroke={gold} strokeWidth={0.5} opacity={0.25} />
        </g>

        {/* Diamond on top of left ring */}
        <g transform="translate(-14, -31)">
          <polygon
            points="0,-14 11,-3 0,8 -11,-3"
            fill={diamondFill}
            stroke={gold}
            strokeWidth={1.1}
            strokeLinejoin="round"
          />
          {/* Facet lines */}
          <line x1="-11" y1="-3" x2="11" y2="-3" stroke={gold} strokeWidth={0.6} opacity={0.45} />
          <line x1="0" y1="-14" x2="-5" y2="-3" stroke={gold} strokeWidth={0.4} opacity={0.35} />
          <line x1="0" y1="-14" x2="5" y2="-3" stroke={gold} strokeWidth={0.4} opacity={0.35} />
          <line x1="-5" y1="-3" x2="0" y2="8" stroke={gold} strokeWidth={0.4} opacity={0.25} />
          <line x1="5" y1="-3" x2="0" y2="8" stroke={gold} strokeWidth={0.4} opacity={0.25} />
        </g>
      </g>

      {/* ── Wordmark: "Wed" + "Print" + "3D" ─────────────── */}
      <g transform="translate(230, 130)">
        {/* "Wed" in gold */}
        <text
          x="-6"
          y="0"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize={40}
          fontWeight="400"
          fill={goldLight}
          textAnchor="end"
          letterSpacing={1}
        >
          Wed
        </text>
        {/* "Print" in charcoal, bolder */}
        <text
          x="-2"
          y="0"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize={40}
          fontWeight="700"
          fill={charcoal}
          textAnchor="start"
          letterSpacing={1}
        >
          Print
        </text>
        {/* "3D" in sage, smaller */}
        <text
          x="95"
          y="0"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize={22}
          fontWeight="400"
          fill={sage}
          textAnchor="start"
          letterSpacing={0.5}
        >
          3D
        </text>
      </g>

      {/* ── Gold divider line ─────────────────────────────── */}
      <line x1="80" y1="143" x2="380" y2="143" stroke={gold} strokeWidth={0.5} opacity={0.45} />

      {/* ── Tagline ───────────────────────────────────────── */}
      <text
        x="230"
        y="161"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize={8}
        fill={tagline}
        textAnchor="middle"
        letterSpacing={3}
        fontStyle="italic"
      >
        PRINTED WITH LOVE. MADE TO LAST.
      </text>
    </svg>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0" aria-label="WedPrint3D — home">
        {svg}
      </Link>
    );
  }

  return <span className="inline-flex shrink-0">{svg}</span>;
}
