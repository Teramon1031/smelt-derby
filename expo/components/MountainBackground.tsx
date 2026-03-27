import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MountainBackground() {
  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={SCREEN_WIDTH} height={280} viewBox={`0 0 ${SCREEN_WIDTH} 280`}>
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0A1628" />
            <Stop offset="0.5" stopColor="#132236" />
            <Stop offset="1" stopColor="#1B3048" />
          </LinearGradient>
          <LinearGradient id="mountain1" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2A4560" />
            <Stop offset="1" stopColor="#1B2F44" />
          </LinearGradient>
          <LinearGradient id="mountain2" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1E3549" />
            <Stop offset="1" stopColor="#152A3C" />
          </LinearGradient>
          <LinearGradient id="snow" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#D4EEF5" stopOpacity="0.6" />
            <Stop offset="1" stopColor="#D4EEF5" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={SCREEN_WIDTH} height="280" fill="url(#sky)" />
        <Path
          d={`M0 280 L0 180 L${SCREEN_WIDTH * 0.15} 100 L${SCREEN_WIDTH * 0.25} 140 L${SCREEN_WIDTH * 0.4} 60 L${SCREEN_WIDTH * 0.55} 150 L${SCREEN_WIDTH * 0.65} 90 L${SCREEN_WIDTH * 0.8} 130 L${SCREEN_WIDTH} 160 L${SCREEN_WIDTH} 280 Z`}
          fill="url(#mountain1)"
        />
        <Path
          d={`M${SCREEN_WIDTH * 0.35} 60 L${SCREEN_WIDTH * 0.4} 60 L${SCREEN_WIDTH * 0.42} 75 L${SCREEN_WIDTH * 0.38} 72 Z`}
          fill="url(#snow)"
        />
        <Path
          d={`M${SCREEN_WIDTH * 0.62} 90 L${SCREEN_WIDTH * 0.65} 90 L${SCREEN_WIDTH * 0.68} 108 L${SCREEN_WIDTH * 0.63} 105 Z`}
          fill="url(#snow)"
        />
        <Path
          d={`M0 280 L0 220 L${SCREEN_WIDTH * 0.1} 190 L${SCREEN_WIDTH * 0.3} 210 L${SCREEN_WIDTH * 0.5} 180 L${SCREEN_WIDTH * 0.7} 200 L${SCREEN_WIDTH * 0.85} 170 L${SCREEN_WIDTH} 210 L${SCREEN_WIDTH} 280 Z`}
          fill="url(#mountain2)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
