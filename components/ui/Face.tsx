/**
 * QoL face glyph — a single line drawing whose mouth bends from frown→smile across
 * the 5-point scale (0 Hard → 4 Bright). Shared by the check-in picker and the
 * dashboard week strip so the same face means the same thing everywhere.
 */
export function Face({
  level,
  size = 34,
  stroke = "#7e8884",
  active = false,
  sw,
}: {
  /** 0..4 on the QoL scale */
  level: number;
  size?: number;
  stroke?: string;
  active?: boolean;
  /** explicit stroke width; otherwise derived from `active` */
  sw?: number;
}) {
  // mouth control point: lower cy => deeper smile for higher levels
  const cy = 27 + (level - 2) * 4.6;
  const strokeW = sw ?? (active ? 2.4 : 1.8);
  const mouthW = sw ?? (active ? 2.4 : 1.9);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="21" stroke={stroke} strokeWidth={strokeW} />
      <circle cx="17.5" cy="20.5" r="1.9" fill={stroke} />
      <circle cx="30.5" cy="20.5" r="1.9" fill={stroke} />
      <path
        d={`M15.5 29 Q24 ${cy} 32.5 29`}
        stroke={stroke}
        strokeWidth={mouthW}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
