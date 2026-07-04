import { colors } from '@aitarot/core';

interface CardBackProps {
  /** Width in px; height follows the 2:3 card ratio. */
  width?: number;
  className?: string;
}

/**
 * Custom mystical card back — a celestial mandala: concentric rings, a radiant
 * gold sun/star burst, an orbit of moon-phase dots, and a starfield, all drawn
 * in the app palette. Pure SVG so it scales crisply and matches the native
 * `react-native-svg` version.
 */
export default function CardBack({ width = 120, className }: CardBackProps) {
  const height = width * 1.5;
  const cx = 50;
  const cy = 75; // viewBox is 100 x 150
  const rays = Array.from({ length: 16 }, (_, i) => (i * 360) / 16);
  const moons = Array.from({ length: 8 }, (_, i) => (i * 360) / 8);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 150"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cb-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.deepPurple} />
          <stop offset="100%" stopColor={colors.darkPurple} />
        </linearGradient>
        <radialGradient id="cb-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colors.gold} stopOpacity="0.95" />
          <stop offset="70%" stopColor={colors.gold} stopOpacity="0.25" />
          <stop offset="100%" stopColor={colors.gold} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Card body + border */}
      <rect x="1" y="1" width="98" height="148" rx="8" fill="url(#cb-bg)" />
      <rect
        x="4"
        y="4"
        width="92"
        height="142"
        rx="6"
        fill="none"
        stroke={colors.gold}
        strokeWidth="0.8"
        opacity="0.7"
      />

      {/* Scattered stars */}
      {[
        [18, 24],
        [80, 30],
        [26, 120],
        [74, 126],
        [50, 18],
        [50, 132],
        [14, 75],
        [86, 75],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 0.9 : 0.6} fill={colors.white} opacity="0.8" />
      ))}

      {/* Radiant core */}
      <circle cx={cx} cy={cy} r="30" fill="url(#cb-core)" />

      {/* Sun/star rays */}
      <g stroke={colors.gold} strokeWidth="0.6" opacity="0.85">
        {rays.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const inner = 8;
          const outer = deg % 45 === 0 ? 26 : 20;
          return (
            <line
              key={deg}
              x1={cx + inner * Math.cos(rad)}
              y1={cy + inner * Math.sin(rad)}
              x2={cx + outer * Math.cos(rad)}
              y2={cy + outer * Math.sin(rad)}
            />
          );
        })}
      </g>

      {/* Concentric rings */}
      <circle cx={cx} cy={cy} r="27" fill="none" stroke={colors.lavender} strokeWidth="0.5" opacity="0.6" />
      <circle cx={cx} cy={cy} r="14" fill="none" stroke={colors.electricBlue} strokeWidth="0.6" opacity="0.7" />

      {/* Moon-phase orbit */}
      <g>
        {moons.map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const r = 21;
          const mx = cx + r * Math.cos(rad);
          const my = cy + r * Math.sin(rad);
          return (
            <circle
              key={deg}
              cx={mx}
              cy={my}
              r="1.6"
              fill={i % 4 === 0 ? colors.gold : colors.white}
              opacity={i % 2 ? 0.9 : 0.5}
            />
          );
        })}
      </g>

      {/* Center gem */}
      <circle cx={cx} cy={cy} r="4" fill={colors.gold} />
      <circle cx={cx} cy={cy} r="4" fill="none" stroke={colors.white} strokeWidth="0.5" opacity="0.8" />
    </svg>
  );
}
