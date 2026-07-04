import Svg, {
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Line,
  Rect,
  Stop,
  G,
} from 'react-native-svg';
import { colors } from '@aitarot/core';

interface CardBackProps {
  /** Width in px; height follows the 2:3 card ratio. */
  width?: number;
}

const cx = 50;
const cy = 75; // viewBox 100 x 150
const rays = Array.from({ length: 16 }, (_, i) => (i * 360) / 16);
const moons = Array.from({ length: 8 }, (_, i) => (i * 360) / 8);
const stars: Array<[number, number]> = [
  [18, 24],
  [80, 30],
  [26, 120],
  [74, 126],
  [50, 18],
  [50, 132],
  [14, 75],
  [86, 75],
];

/**
 * Custom mystical card back for the mobile app — a celestial mandala rendered
 * with react-native-svg. Mirrors the web `CardBack` (same motif and palette) so
 * both platforms feel identical.
 */
export default function CardBack({ width = 96 }: CardBackProps) {
  const height = width * 1.5;
  return (
    <Svg width={width} height={height} viewBox="0 0 100 150">
      <Defs>
        <LinearGradient id="cb-bg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.deepPurple} />
          <Stop offset="1" stopColor={colors.darkPurple} />
        </LinearGradient>
        <RadialGradient id="cb-core" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={colors.gold} stopOpacity={0.95} />
          <Stop offset="0.7" stopColor={colors.gold} stopOpacity={0.25} />
          <Stop offset="1" stopColor={colors.gold} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* Card body + border */}
      <Rect x="1" y="1" width="98" height="148" rx="8" fill="url(#cb-bg)" />
      <Rect
        x="4"
        y="4"
        width="92"
        height="142"
        rx="6"
        fill="none"
        stroke={colors.gold}
        strokeWidth="0.8"
        opacity={0.7}
      />

      {/* Scattered stars */}
      {stars.map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={i % 2 ? 0.9 : 0.6} fill={colors.white} opacity={0.8} />
      ))}

      {/* Radiant core */}
      <Circle cx={cx} cy={cy} r="30" fill="url(#cb-core)" />

      {/* Sun/star rays */}
      <G stroke={colors.gold} strokeWidth="0.6" opacity={0.85}>
        {rays.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const inner = 8;
          const outer = deg % 45 === 0 ? 26 : 20;
          return (
            <Line
              key={deg}
              x1={cx + inner * Math.cos(rad)}
              y1={cy + inner * Math.sin(rad)}
              x2={cx + outer * Math.cos(rad)}
              y2={cy + outer * Math.sin(rad)}
            />
          );
        })}
      </G>

      {/* Concentric rings */}
      <Circle cx={cx} cy={cy} r="27" fill="none" stroke={colors.lavender} strokeWidth="0.5" opacity={0.6} />
      <Circle cx={cx} cy={cy} r="14" fill="none" stroke={colors.electricBlue} strokeWidth="0.6" opacity={0.7} />

      {/* Moon-phase orbit */}
      {moons.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const r = 21;
        return (
          <Circle
            key={deg}
            cx={cx + r * Math.cos(rad)}
            cy={cy + r * Math.sin(rad)}
            r="1.6"
            fill={i % 4 === 0 ? colors.gold : colors.white}
            opacity={i % 2 ? 0.9 : 0.5}
          />
        );
      })}

      {/* Center gem */}
      <Circle cx={cx} cy={cy} r="4" fill={colors.gold} />
      <Circle cx={cx} cy={cy} r="4" fill="none" stroke={colors.white} strokeWidth="0.5" opacity={0.8} />
    </Svg>
  );
}
