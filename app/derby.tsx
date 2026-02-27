import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Minus, UserCircle, X, Square } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useDerby } from '@/contexts/DerbyContext';
import FloatingFishDecor from '@/components/FloatingFishDecor';
import FishIcon from '@/components/FishIcon';
import type { Participant } from '@/types/derby';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BAR_AREA_WIDTH = SCREEN_WIDTH - 140;

const EMOJI_OPTIONS = [
  '🎣', '🐟', '⛄', '🏔️', '🌊', '❄️', '🔥', '⭐',
  '🐧', '🦊', '🐻', '🐱', '🐶', '🐸', '🦅', '🐺',
  '😎', '🤠', '👑', '💪', '🎯', '🏆', '🍺', '☕',
];

const CELEBRATION_EMOJIS = ['🐟', '💧', '⭐', '✨', '🫧', '❄️', '🎣', '💫', '🐡', '🦐'];

type CelebrationPattern = 'bubbleRise' | 'fishRain' | 'starBurst' | 'rippleWave' | 'confettiPop';

const PATTERNS: CelebrationPattern[] = ['bubbleRise', 'fishRain', 'starBurst', 'rippleWave', 'confettiPop'];

interface CelebrationParticle {
  id: string;
  emoji: string;
  startX: number;
  startY: number;
  animX: Animated.Value;
  animY: Animated.Value;
  animOpacity: Animated.Value;
  animScale: Animated.Value;
  animRotate: Animated.Value;
  size: number;
}

let celebrationCounter = 0;

function useCelebration() {
  const [particles, setParticles] = useState<CelebrationParticle[]>([]);
  const patternIndexRef = useRef(0);

  const triggerCelebration = useCallback(() => {
    const pattern = PATTERNS[patternIndexRef.current % PATTERNS.length];
    patternIndexRef.current++;

    const newParticles: CelebrationParticle[] = [];
    const count = pattern === 'confettiPop' ? 18 : pattern === 'starBurst' ? 14 : 10;

    for (let i = 0; i < count; i++) {
      const id = `cel-${celebrationCounter++}`;
      const particle: CelebrationParticle = {
        id,
        emoji: CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)],
        startX: 0,
        startY: 0,
        animX: new Animated.Value(0),
        animY: new Animated.Value(0),
        animOpacity: new Animated.Value(1),
        animScale: new Animated.Value(0),
        animRotate: new Animated.Value(0),
        size: 18 + Math.random() * 18,
      };

      switch (pattern) {
        case 'bubbleRise': {
          particle.emoji = ['🫧', '💧', '✨', '🐟', '❄️'][Math.floor(Math.random() * 5)];
          particle.startX = Math.random() * SCREEN_WIDTH;
          particle.startY = SCREEN_HEIGHT + 20;
          break;
        }
        case 'fishRain': {
          particle.emoji = ['🐟', '🐡', '🦐', '🐠', '🎣'][Math.floor(Math.random() * 5)];
          particle.startX = Math.random() * SCREEN_WIDTH;
          particle.startY = -40;
          break;
        }
        case 'starBurst': {
          particle.emoji = ['⭐', '✨', '💫', '🌟', '❄️'][Math.floor(Math.random() * 5)];
          particle.startX = SCREEN_WIDTH / 2;
          particle.startY = SCREEN_HEIGHT / 2;
          break;
        }
        case 'rippleWave': {
          particle.emoji = ['🌊', '💧', '🫧', '🐟', '💦'][Math.floor(Math.random() * 5)];
          const angle = (i / count) * Math.PI * 2;
          particle.startX = SCREEN_WIDTH / 2 + Math.cos(angle) * 20;
          particle.startY = SCREEN_HEIGHT / 2 + Math.sin(angle) * 20;
          break;
        }
        case 'confettiPop': {
          particle.emoji = ['🐟', '✨', '⭐', '❄️', '🫧', '💧', '🎣', '🐡'][Math.floor(Math.random() * 8)];
          particle.startX = SCREEN_WIDTH * (0.2 + Math.random() * 0.6);
          particle.startY = -20;
          break;
        }
      }

      newParticles.push(particle);
    }

    setParticles(prev => [...prev, ...newParticles]);

    newParticles.forEach((particle, i) => {
      const delay = i * (pattern === 'confettiPop' ? 30 : pattern === 'bubbleRise' ? 60 : 40);
      const duration = pattern === 'starBurst' ? 700 : pattern === 'confettiPop' ? 1400 : 1100;

      setTimeout(() => {
        switch (pattern) {
          case 'bubbleRise': {
            const drift = (Math.random() - 0.5) * 120;
            Animated.parallel([
              Animated.timing(particle.animY, {
                toValue: -(SCREEN_HEIGHT + 60),
                duration: 1200 + Math.random() * 600,
                useNativeDriver: true,
              }),
              Animated.timing(particle.animX, {
                toValue: drift,
                duration: 1200 + Math.random() * 600,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.spring(particle.animScale, {
                  toValue: 1 + Math.random() * 0.5,
                  friction: 4,
                  tension: 80,
                  useNativeDriver: true,
                }),
                Animated.timing(particle.animScale, {
                  toValue: 0.3,
                  duration: 400,
                  useNativeDriver: true,
                }),
              ]),
              Animated.timing(particle.animOpacity, {
                toValue: 0,
                duration: 1400,
                useNativeDriver: true,
              }),
              Animated.timing(particle.animRotate, {
                toValue: (Math.random() - 0.5) * 4,
                duration: 1400,
                useNativeDriver: true,
              }),
            ]).start();
            break;
          }
          case 'fishRain': {
            const wobble = (Math.random() - 0.5) * 80;
            Animated.parallel([
              Animated.timing(particle.animY, {
                toValue: SCREEN_HEIGHT + 60,
                duration: 1400 + Math.random() * 400,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.timing(particle.animX, {
                  toValue: wobble,
                  duration: 400,
                  useNativeDriver: true,
                }),
                Animated.timing(particle.animX, {
                  toValue: -wobble * 0.6,
                  duration: 500,
                  useNativeDriver: true,
                }),
                Animated.timing(particle.animX, {
                  toValue: wobble * 0.3,
                  duration: 500,
                  useNativeDriver: true,
                }),
              ]),
              Animated.sequence([
                Animated.timing(particle.animScale, {
                  toValue: 1.2,
                  duration: 200,
                  useNativeDriver: true,
                }),
                Animated.timing(particle.animScale, {
                  toValue: 0.8 + Math.random() * 0.4,
                  duration: 600,
                  useNativeDriver: true,
                }),
              ]),
              Animated.timing(particle.animOpacity, {
                toValue: 0,
                duration: 1600,
                delay: 200,
                useNativeDriver: true,
              }),
              Animated.timing(particle.animRotate, {
                toValue: (Math.random() - 0.5) * 6,
                duration: 1600,
                useNativeDriver: true,
              }),
            ]).start();
            break;
          }
          case 'starBurst': {
            const angle = (i / newParticles.length) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
            const dist = 120 + Math.random() * 140;
            Animated.parallel([
              Animated.timing(particle.animX, {
                toValue: Math.cos(angle) * dist,
                duration,
                useNativeDriver: true,
              }),
              Animated.timing(particle.animY, {
                toValue: Math.sin(angle) * dist,
                duration,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.spring(particle.animScale, {
                  toValue: 1.6,
                  friction: 4,
                  tension: 120,
                  useNativeDriver: true,
                }),
                Animated.timing(particle.animScale, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]),
              Animated.timing(particle.animOpacity, {
                toValue: 0,
                duration: duration + 100,
                useNativeDriver: true,
              }),
              Animated.timing(particle.animRotate, {
                toValue: Math.random() * 8,
                duration,
                useNativeDriver: true,
              }),
            ]).start();
            break;
          }
          case 'rippleWave': {
            const ang = (i / newParticles.length) * Math.PI * 2;
            const radius = 100 + Math.random() * 120;
            Animated.parallel([
              Animated.timing(particle.animX, {
                toValue: Math.cos(ang) * radius,
                duration: 900,
                useNativeDriver: true,
              }),
              Animated.timing(particle.animY, {
                toValue: Math.sin(ang) * radius,
                duration: 900,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.spring(particle.animScale, {
                  toValue: 1.4,
                  friction: 3,
                  tension: 100,
                  useNativeDriver: true,
                }),
                Animated.timing(particle.animScale, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]),
              Animated.timing(particle.animOpacity, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
              }),
              Animated.timing(particle.animRotate, {
                toValue: (Math.random() - 0.5) * 3,
                duration: 1000,
                useNativeDriver: true,
              }),
            ]).start();
            break;
          }
          case 'confettiPop': {
            const swayAmount = (Math.random() - 0.5) * 200;
            Animated.parallel([
              Animated.timing(particle.animY, {
                toValue: SCREEN_HEIGHT + 40,
                duration: 1400 + Math.random() * 800,
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.timing(particle.animX, {
                  toValue: swayAmount,
                  duration: 600,
                  useNativeDriver: true,
                }),
                Animated.timing(particle.animX, {
                  toValue: -swayAmount * 0.5,
                  duration: 700,
                  useNativeDriver: true,
                }),
                Animated.timing(particle.animX, {
                  toValue: swayAmount * 0.3,
                  duration: 500,
                  useNativeDriver: true,
                }),
              ]),
              Animated.sequence([
                Animated.spring(particle.animScale, {
                  toValue: 1 + Math.random() * 0.6,
                  friction: 5,
                  tension: 60,
                  useNativeDriver: true,
                }),
              ]),
              Animated.timing(particle.animOpacity, {
                toValue: 0,
                duration: 2000,
                delay: 300,
                useNativeDriver: true,
              }),
              Animated.timing(particle.animRotate, {
                toValue: (Math.random() - 0.5) * 10,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]).start();
            break;
          }
        }
      }, delay);
    });

    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 2500);
  }, []);

  return { particles, triggerCelebration };
}

function CelebrationLayer({ particles }: { particles: CelebrationParticle[] }) {
  if (particles.length === 0) return null;

  return (
    <View style={celebStyles.container} pointerEvents="none">
      {particles.map((p) => (
        <Animated.View
          key={p.id}
          style={{
            position: 'absolute',
            left: p.startX,
            top: p.startY,
            opacity: p.animOpacity,
            transform: [
              { translateX: p.animX },
              { translateY: p.animY },
              { scale: p.animScale },
              {
                rotate: p.animRotate.interpolate({
                  inputRange: [-10, 10],
                  outputRange: ['-360deg', '360deg'],
                }),
              },
            ],
          }}
        >
          <Text style={{ fontSize: p.size }}>{p.emoji}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

const celebStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
});

function ComicalFishTip({ color, size = 36 }: { color: string; size?: number }) {
  return (
    <View style={{ width: size * 1.2, height: size, alignItems: 'center', justifyContent: 'center', transform: [{ scaleX: -1 }] }}>
      <FishIcon width={size * 1.2} height={size * 0.7} color={color} opacity={1} comical />
    </View>
  );
}

function SplashEffect({ visible }: { visible: boolean }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      opacityAnim.setValue(1);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 600,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: -8,
        top: -8,
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Text style={{ fontSize: 16 }}>💧</Text>
    </Animated.View>
  );
}

interface BarRowProps {
  participant: Participant;
  count: number;
  maxCount: number;
  rank: number;
  onTapFish: () => void;
  onLongPress: () => void;
  onIconPress: () => void;
}

function BarRow({ participant, count, maxCount, rank, onTapFish, onLongPress, onIconPress }: BarRowProps) {
  const barWidth = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const prevCountRef = useRef(count);
  const [showSplash, setShowSplash] = useState(false);

  const targetWidth = useMemo(() => {
    if (maxCount === 0) return 24;
    return Math.max(24, (count / Math.max(maxCount, 1)) * (BAR_AREA_WIDTH - 50));
  }, [count, maxCount]);

  useEffect(() => {
    Animated.spring(barWidth, {
      toValue: targetWidth,
      friction: 7,
      tension: 50,
      useNativeDriver: false,
    }).start();
  }, [targetWidth]);

  useEffect(() => {
    if (count > prevCountRef.current) {
      setShowSplash(true);
      setTimeout(() => setShowSplash(false), 800);

      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.spring(pulseAnim, {
          toValue: 1,
          friction: 3,
          tension: 120,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -6,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 0,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevCountRef.current = count;
  }, [count]);

  const handlePress = useCallback(() => {
    onTapFish();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [onTapFish]);

  const handleDecrementPress = useCallback(() => {
    onLongPress();
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [onLongPress]);

  const rankBadge = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : null;
  const isLeader = rank === 1 && count > 0;

  return (
    <Animated.View style={[barStyles.row, { transform: [{ translateY: bounceAnim }] }]}>
      <View style={barStyles.leftSection}>
        <TouchableOpacity onPress={onIconPress} style={barStyles.iconBtn} testID={`icon-btn-${participant.id}`}>
          <View style={[barStyles.iconCircle, { borderColor: participant.color + '60' }]}>
            {participant.icon ? (
              <Text style={barStyles.iconEmoji}>{participant.icon}</Text>
            ) : (
              <UserCircle color={participant.color} size={22} />
            )}
          </View>
        </TouchableOpacity>
        <View style={barStyles.nameArea}>
          <View style={barStyles.nameRow}>
            {rankBadge ? <Text style={barStyles.rankEmoji}>{rankBadge}</Text> : null}
            <Text style={[barStyles.name, isLeader && barStyles.leaderName]} numberOfLines={1}>
              {participant.name}
            </Text>
          </View>
        </View>
      </View>

      <View style={barStyles.barArea}>
        <View style={barStyles.barTrack}>
          <Animated.View
            style={[
              barStyles.barFill,
              {
                width: barWidth,
                backgroundColor: participant.color,
              },
            ]}
          >
            <View style={barStyles.barShine} />
            <Text style={barStyles.countInBar}>{count}</Text>
          </Animated.View>
          <Animated.View style={[barStyles.fishContainer, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
              onPress={handlePress}
              activeOpacity={0.5}
              testID={`fish-tap-${participant.id}`}
              style={barStyles.fishTapArea}
            >
              <ComicalFishTip color={participant.color} size={34} />
              <SplashEffect visible={showSplash} />
            </TouchableOpacity>
          </Animated.View>
        </View>
        {count > 0 && (
          <TouchableOpacity
            onPress={handleDecrementPress}
            style={barStyles.decrementBtn}
            testID={`decrement-${participant.id}`}
          >
            <Minus color="rgba(255,255,255,0.4)" size={12} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const barStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  leftSection: {
    width: 90,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  iconEmoji: {
    fontSize: 18,
  },
  nameArea: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rankEmoji: {
    fontSize: 12,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  leaderName: {
    color: Colors.warmAmber,
  },
  barArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  barTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18,
    overflow: 'visible',
  },
  barFill: {
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 10,
    minWidth: 24,
    overflow: 'hidden',
  },
  barShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 14,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  countInBar: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800' as const,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  fishContainer: {
    marginLeft: -6,
  },
  fishTapArea: {
    padding: 6,
    position: 'relative',
  },
  decrementBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});

export default function DerbyScreen() {
  const router = useRouter();
  const {
    activeDerby,
    totalCatchCount,
    incrementCatch,
    decrementCatch,
    setParticipantIcon,
    endDerby,
    getCatchCount,
  } = useDerby();

  const [iconModalVisible, setIconModalVisible] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const totalBounce = useRef(new Animated.Value(1)).current;
  const prevTotal = useRef(totalCatchCount);
  const { particles, triggerCelebration } = useCelebration();

  useEffect(() => {
    if (!activeDerby) {
      router.replace('/');
    }
  }, [activeDerby]);

  useEffect(() => {
    if (totalCatchCount > prevTotal.current) {
      Animated.sequence([
        Animated.timing(totalBounce, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(totalBounce, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevTotal.current = totalCatchCount;
  }, [totalCatchCount]);

  const maxCount = useMemo(() => {
    if (!activeDerby) return 0;
    return Math.max(
      ...activeDerby.participants.map(p => getCatchCount(p.id)),
      1
    );
  }, [activeDerby, getCatchCount]);

  const sortedParticipants = useMemo(() => {
    if (!activeDerby) return [];
    return [...activeDerby.participants].sort((a, b) => {
      return getCatchCount(b.id) - getCatchCount(a.id);
    });
  }, [activeDerby, getCatchCount]);

  const handleOpenIconModal = useCallback((participantId: string) => {
    setSelectedParticipantId(participantId);
    setIconModalVisible(true);
  }, []);

  const handleSelectEmoji = useCallback((emoji: string) => {
    if (selectedParticipantId) {
      setParticipantIcon(selectedParticipantId, emoji);
    }
    setIconModalVisible(false);
    setSelectedParticipantId(null);
  }, [selectedParticipantId, setParticipantIcon]);

  const handleEndDerby = useCallback(() => {
    Alert.alert(
      'ダービー終了',
      '本当にダービーを終了しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '終了',
          style: 'destructive',
          onPress: () => {
            endDerby();
            router.replace('/');
          },
        },
      ]
    );
  }, [endDerby, router]);

  const handleIncrementWithCelebration = useCallback((participantId: string) => {
    incrementCatch(participantId);
    triggerCelebration();
  }, [incrementCatch, triggerCelebration]);

  if (!activeDerby) return null;

  const selectedParticipant = activeDerby.participants.find(p => p.id === selectedParticipantId);

  return (
    <View style={styles.root}>
      <View style={styles.bgGradientTop} />
      <View style={styles.bgGradientBottom} />
      <FloatingFishDecor />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.eventName} numberOfLines={1}>{activeDerby.name}</Text>
            {activeDerby.location ? (
              <View style={styles.locationRow}>
                <MapPin color={Colors.icyBlue} size={11} />
                <Text style={styles.locationText}>{activeDerby.location}</Text>
              </View>
            ) : null}
          </View>

          <Animated.View style={[styles.totalBubble, { transform: [{ scale: totalBounce }] }]}>
            <Text style={styles.totalFishEmoji}>🐟</Text>
            <Text style={styles.totalNumber}>{totalCatchCount}</Text>
            <Text style={styles.totalLabel}>匹</Text>
          </Animated.View>
        </View>

        <View style={styles.hintBar}>
          <View style={styles.hintPill}>
            <Text style={styles.hintText}>🐟 ← タップで +1 ！</Text>
          </View>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {sortedParticipants.map((participant, index) => {
            const count = getCatchCount(participant.id);
            return (
              <BarRow
                key={participant.id}
                participant={participant}
                count={count}
                maxCount={maxCount}
                rank={index + 1}
                onTapFish={() => handleIncrementWithCelebration(participant.id)}
                onLongPress={() => decrementCatch(participant.id)}
                onIconPress={() => handleOpenIconModal(participant.id)}
              />
            );
          })}

          <View style={styles.waterLine}>
            <View style={styles.waveDot} />
            <View style={[styles.waveDot, { width: 30, opacity: 0.15 }]} />
            <View style={[styles.waveDot, { width: 16, opacity: 0.08 }]} />
            <View style={[styles.waveDot, { width: 24, opacity: 0.12 }]} />
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.endFab}
          onPress={handleEndDerby}
          activeOpacity={0.7}
          testID="end-derby"
        >
          <Square color="#E85454" size={14} fill="#E85454" />
        </TouchableOpacity>

        <Modal
          visible={iconModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIconModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setIconModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedParticipant?.name ?? ''} のアイコン
                </Text>
                <View style={styles.modalFishDecor}>
                  <FishIcon width={40} height={20} color={Colors.icyBlue} opacity={0.3} comical />
                </View>
              </View>
              <View style={styles.emojiGrid}>
                {EMOJI_OPTIONS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiBtn,
                      selectedParticipant?.icon === emoji && styles.emojiBtnActive,
                    ]}
                    onPress={() => handleSelectEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>

      <CelebrationLayer particles={particles} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B1520',
  },
  bgGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#0E1D2E',
    opacity: 0.8,
  },
  bgGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#0A1824',
    opacity: 0.6,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  eventName: {
    fontSize: 20,
    fontWeight: '800' as const,
    color: '#FFF',
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: Colors.icyBlue,
    opacity: 0.7,
  },
  totalBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(168,213,226,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(168,213,226,0.15)',
  },
  totalFishEmoji: {
    fontSize: 16,
  },
  totalNumber: {
    fontSize: 22,
    fontWeight: '900' as const,
    color: '#FFF',
  },
  totalLabel: {
    fontSize: 11,
    color: Colors.icyBlue,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  hintBar: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  hintPill: {
    backgroundColor: 'rgba(168,213,226,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 12,
  },
  hintText: {
    fontSize: 11,
    color: Colors.icyBlue,
    fontWeight: '500' as const,
    opacity: 0.6,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 24,
  },
  waterLine: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingTop: 20,
    paddingBottom: 8,
  },
  waveDot: {
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.icyBlue,
    opacity: 0.1,
  },
  endFab: {
    position: 'absolute',
    left: 16,
    bottom: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(232,84,84,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(232,84,84,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH - 48,
    backgroundColor: '#162232',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(168,213,226,0.12)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFF',
    textAlign: 'center',
  },
  modalFishDecor: {
    opacity: 0.6,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBtnActive: {
    backgroundColor: 'rgba(168,213,226,0.2)',
    borderWidth: 2,
    borderColor: Colors.icyBlue,
  },
  emojiText: {
    fontSize: 24,
  },
});
