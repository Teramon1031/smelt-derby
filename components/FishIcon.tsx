import React from 'react';
import Svg, { Path, Circle, Ellipse, G } from 'react-native-svg';

interface FishIconProps {
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
  comical?: boolean;
}

export default function FishIcon({ width = 80, height = 40, color = '#A8D5E2', opacity = 1, comical = false }: FishIconProps) {
  if (comical) {
    return (
      <Svg width={width} height={height} viewBox="0 0 100 50" fill="none">
        <G opacity={opacity}>
          <Ellipse cx="45" cy="25" rx="30" ry="14" fill={color} />
          <Path d="M72 25C72 25 88 14 92 25C88 36 72 25 72 25Z" fill={color} opacity={0.85} />
          <Path d="M40 12C40 12 48 6 52 12" stroke={color} strokeWidth="2.5" fill="none" opacity={0.6} />
          <Path d="M38 38C38 38 46 44 50 38" stroke={color} strokeWidth="2" fill="none" opacity={0.5} />
          <Circle cx="30" cy="22" r="5" fill="white" />
          <Circle cx="31" cy="21" r="2.8" fill="#1A2A3A" />
          <Circle cx="32.5" cy="19.5" r="1" fill="white" />
          <Path d="M22 30C22 30 28 34 36 30" stroke="#FF8A8A" strokeWidth="2" strokeLinecap="round" fill="none" />
          <Circle cx="20" cy="27" r="3.5" fill="#FF8A8A" opacity={0.3} />
          <Circle cx="38" cy="27" r="3" fill="#FF8A8A" opacity={0.25} />
          <Ellipse cx="80" cy="18" rx="4" ry="2" fill={color} opacity={0.5} />
          <Ellipse cx="82" cy="30" rx="3" ry="1.5" fill={color} opacity={0.4} />
        </G>
      </Svg>
    );
  }

  return (
    <Svg width={width} height={height} viewBox="0 0 80 40" fill="none">
      <Path
        d="M58 20C58 20 70 10 78 20C70 30 58 20 58 20Z"
        fill={color}
        opacity={opacity * 0.8}
      />
      <Ellipse
        cx="38"
        cy="20"
        rx="24"
        ry="12"
        fill={color}
        opacity={opacity}
      />
      <Circle
        cx="24"
        cy="17"
        r="2.5"
        fill={color}
        opacity={Math.min(opacity + 0.2, 1)}
      />
      <Path
        d="M14 20C14 20 6 14 2 20C6 26 14 20 14 20Z"
        fill={color}
        opacity={opacity * 0.6}
      />
    </Svg>
  );
}
