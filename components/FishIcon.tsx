import React from 'react';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';

interface FishIconProps {
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
}

export default function FishIcon({ width = 80, height = 40, color = '#A8D5E2', opacity = 0.3 }: FishIconProps) {
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
        opacity={opacity + 0.2}
      />
      <Path
        d="M14 20C14 20 6 14 2 20C6 26 14 20 14 20Z"
        fill={color}
        opacity={opacity * 0.6}
      />
    </Svg>
  );
}
