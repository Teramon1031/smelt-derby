import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import FishIcon from './FishIcon';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BubbleConfig {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

interface FishConfig {
  y: number;
  size: number;
  color: string;
  delay: number;
  direction: 'left' | 'right';
  opacity: number;
}

const BUBBLES: BubbleConfig[] = [
  { x: 20, y: 120, size: 6, delay: 0, duration: 3000 },
  { x: 80, y: 200, size: 4, delay: 800, duration: 3500 },
  { x: SCREEN_WIDTH - 50, y: 160, size: 5, delay: 400, duration: 2800 },
  { x: SCREEN_WIDTH - 90, y: 260, size: 3, delay: 1200, duration: 3200 },
  { x: 140, y: 300, size: 4, delay: 600, duration: 2600 },
  { x: SCREEN_WIDTH / 2, y: 100, size: 5, delay: 1000, duration: 3100 },
  { x: 60, y: 380, size: 3, delay: 1500, duration: 2900 },
  { x: SCREEN_WIDTH - 30, y: 340, size: 4, delay: 200, duration: 3300 },
];

const SWIMMING_FISH: FishConfig[] = [
  { y: 80, size: 24, color: 'rgba(168,213,226,0.12)', delay: 0, direction: 'right', opacity: 0.15 },
  { y: 220, size: 18, color: 'rgba(168,213,226,0.08)', delay: 2000, direction: 'left', opacity: 0.1 },
  { y: 400, size: 20, color: 'rgba(168,213,226,0.1)', delay: 4000, direction: 'right', opacity: 0.12 },
];

function AnimatedBubble({ config }: { config: BubbleConfig }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const startAnimation = () => {
      floatAnim.setValue(0);
      opacityAnim.setValue(0.4);
      Animated.parallel([
        Animated.timing(floatAnim, {
          toValue: -40,
          duration: config.duration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: config.duration * 0.3,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: config.duration * 0.7,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => startAnimation());
    };

    const timeout = setTimeout(startAnimation, config.delay);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: config.x,
        top: config.y,
        width: config.size,
        height: config.size,
        borderRadius: config.size / 2,
        backgroundColor: '#A8D5E2',
        opacity: opacityAnim,
        transform: [{ translateY: floatAnim }],
      }}
    />
  );
}

function SwimmingFish({ config }: { config: FishConfig }) {
  const swimAnim = useRef(new Animated.Value(config.direction === 'right' ? -60 : SCREEN_WIDTH + 20)).current;

  useEffect(() => {
    const startSwim = () => {
      const fromVal = config.direction === 'right' ? -60 : SCREEN_WIDTH + 20;
      const toVal = config.direction === 'right' ? SCREEN_WIDTH + 60 : -60;
      swimAnim.setValue(fromVal);
      Animated.timing(swimAnim, {
        toValue: toVal,
        duration: 18000,
        useNativeDriver: true,
      }).start(() => startSwim());
    };

    const timeout = setTimeout(startSwim, config.delay);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: config.y,
        transform: [
          { translateX: swimAnim },
          { scaleX: config.direction === 'left' ? -1 : 1 },
        ],
        opacity: config.opacity,
      }}
    >
      <FishIcon width={config.size * 2} height={config.size} color={config.color} opacity={1} comical />
    </Animated.View>
  );
}

export default function FloatingFishDecor() {
  return (
    <View style={styles.container} pointerEvents="none">
      {BUBBLES.map((b, i) => (
        <AnimatedBubble key={`bubble-${i}`} config={b} />
      ))}
      {SWIMMING_FISH.map((f, i) => (
        <SwimmingFish key={`fish-${i}`} config={f} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
});
