import Link from "next/link";

export type LogoProps = {
  /** Total width in px; height follows viewBox aspect (400×120). Default 200. */
  width?: number;
  href?: string;
  className?: string;
  /** `onDark`: wordmark uses #F5F0E8 (operator dashboard / dark footer). */
  variant?: "default" | "onDark";
};

/**
 * Inline WedPrint horizontal logo (matches `public/logo.svg`).
 * Use `variant="onDark"` on charcoal backgrounds so the wordmark stays readable.
 */
export function Logo({
  width = 200,
  href,
  className,
  variant = "default",
}: LogoProps) {
  const wordmarkFill = variant === "onDark" ? "#F5F0E8" : "#3D4A3A";
  const height = (width * 120) / 400;

  const svg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 120"
      width={width}
      height={height}
      className={className}
      aria-hidden
      focusable="false"
    >
      <g transform="translate(70, 60)">
        <circle cx="-20" cy="0" r="38" fill="none" stroke="#C9A84C" strokeWidth={2.2} />
        <circle cx="20" cy="0" r="38" fill="none" stroke="#C9A84C" strokeWidth={2.2} />
        <circle cx="-20" cy="0" r="30" fill="none" stroke="#C9A84C" strokeWidth={0.5} opacity={0.3} />
        <circle cx="20" cy="0" r="30" fill="none" stroke="#C9A84C" strokeWidth={0.5} opacity={0.3} />

        <g transform="translate(-20,-38)">
          <ellipse cx="0" cy="-5" rx="5" ry="7.5" fill="#F5F0E8" stroke="#C9A84C" strokeWidth={0.7} />
          <ellipse cx="0" cy="5" rx="5" ry="7.5" fill="#F5F0E8" stroke="#C9A84C" strokeWidth={0.7} />
          <ellipse cx="-5" cy="0" rx="7.5" ry="5" fill="#F5F0E8" stroke="#C9A84C" strokeWidth={0.7} />
          <ellipse cx="5" cy="0" rx="7.5" ry="5" fill="#F5F0E8" stroke="#C9A84C" strokeWidth={0.7} />
          <circle cx="0" cy="0" r="5" fill="#C9A84C" />
        </g>

        <g transform="translate(20,-38)">
          <ellipse cx="0" cy="-5" rx="5" ry="7.5" fill="#F5F0E8" stroke="#C9A84C" strokeWidth={0.7} />
          <ellipse cx="0" cy="5" rx="5" ry="7.5" fill="#F5F0E8" stroke="#C9A84C" strokeWidth={0.7} />
          <ellipse cx="-5" cy="0" rx="7.5" ry="5" fill="#F5F0E8" stroke="#C9A84C" strokeWidth={0.7} />
          <ellipse cx="5" cy="0" rx="7.5" ry="5" fill="#F5F0E8" stroke="#C9A84C" strokeWidth={0.7} />
          <circle cx="0" cy="0" r="5" fill="#C9A84C" />
        </g>

        <ellipse cx="-52" cy="-24" rx="9" ry="4" fill="#7A9A7A" transform="rotate(-35 -52 -24)" opacity={0.9} />
        <ellipse cx="-54" cy="10" rx="9" ry="4" fill="#7A9A7A" transform="rotate(30 -54 10)" opacity={0.9} />
        <ellipse cx="52" cy="-24" rx="9" ry="4" fill="#7A9A7A" transform="rotate(35 52 -24)" opacity={0.9} />
        <ellipse cx="54" cy="10" rx="9" ry="4" fill="#7A9A7A" transform="rotate(-30 54 10)" opacity={0.9} />

        <polygon points="0,-15 11,0 0,15 -11,0" fill="#F5F0E8" opacity={0.95} />
        <polygon points="0,-15 11,0 0,15 -11,0" fill="none" stroke="#C9A84C" strokeWidth={1.5} />
        <polygon points="0,-8 6,0 0,8 -6,0" fill="#C9A84C" opacity={0.35} />
        <line x1="0" y1="-15" x2="0" y2="15" stroke="#C9A84C" strokeWidth={0.5} opacity={0.4} />
        <line x1="-11" y1="0" x2="11" y2="0" stroke="#C9A84C" strokeWidth={0.5} opacity={0.4} />
      </g>

      <line x1="138" y1="18" x2="138" y2="102" stroke="#C9A84C" strokeWidth={0.5} opacity={0.4} />

      <text
        x="268"
        y="52"
        fontFamily="Georgia, serif"
        fontSize={32}
        fontWeight="400"
        fill={wordmarkFill}
        textAnchor="middle"
        letterSpacing={4}
      >
        WedPrint
      </text>
      <line x1="148" y1="64" x2="388" y2="64" stroke="#C9A84C" strokeWidth={0.5} />
      <text
        x="268"
        y="80"
        fontFamily="Georgia, serif"
        fontSize={9}
        fill="#C9A84C"
        textAnchor="middle"
        letterSpacing={4}
      >
        HANDCRAFTED 3D KEEPSAKES
      </text>
      <text
        x="268"
        y="98"
        fontFamily="Georgia, serif"
        fontSize={9}
        fill={variant === "onDark" ? "#B8C9B8" : "#7A9A7A"}
        textAnchor="middle"
        letterSpacing={2}
      >
        Miami, Florida
      </text>
    </svg>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0" aria-label="WedPrint — home">
        {svg}
      </Link>
    );
  }

  return <span className="inline-flex shrink-0">{svg}</span>;
}
