import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Home, Fish } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useDerby } from '@/contexts/DerbyContext';
import FishIcon from '@/components/FishIcon';
import FloatingFishDecor from '@/components/FloatingFishDecor';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PodiumEntryData {
  name: string;
  icon?: string;
  color: string;
  count: number;
  rank: number;
}

function PodiumBlock({ entry, height, delay }: { entry: PodiumEntryData; height: number; delay: number }) {
  const growAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.spring(growAnim, {
          toValue: height,
          friction: 6,
          tension: 40,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -8,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.spring(bounceAnim, {
            toValue: 0,
            friction: 3,
            tension: 100,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  const rankLabels = ['🥇', '🥈', '🥉'];
  const rankLabel = entry.rank <= 3 ? rankLabels[entry.rank - 1] : `${entry.rank}`;
  const isWinner = entry.rank === 1;

  return (
    <View style={podiumStyles.column}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: bounceAnim }] }}>
        <View style={podiumStyles.avatarArea}>
          {isWinner && (
            <View style={podiumStyles.crownArea}>
              <Text style={podiumStyles.crownEmoji}>👑</Text>
            </View>
          )}
          <View style={[podiumStyles.avatar, { borderColor: entry.color }]}>
            {entry.icon ? (
              <Text style={podiumStyles.avatarEmoji}>{entry.icon}</Text>
            ) : (
              <Text style={[podiumStyles.avatarInitial, { color: entry.color }]}>
                {entry.name.charAt(0)}
              </Text>
            )}
          </View>
          <Text style={podiumStyles.playerName} numberOfLines={1}>{entry.name}</Text>
          <View style={podiumStyles.countBadge}>
            <FishIcon width={16} height={10} color={entry.color} opacity={0.8} comical />
            <Text style={[podiumStyles.countText, { color: entry.color }]}>{entry.count}</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          podiumStyles.bar,
          {
            height: growAnim,
            backgroundColor: entry.color,
          },
        ]}
      >
        <View style={podiumStyles.barShine} />
        <Text style={podiumStyles.rankEmoji}>{rankLabel}</Text>
      </Animated.View>
    </View>
  );
}

function ConfettiParticle({ delay, startX }: { delay: number; startX: number }) {
  const fallAnim = useRef(new Animated.Value(-20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;
  const color = useMemo(() => {
    const colors = [Colors.warmAmber, Colors.icyBlue, '#E85454', '#4ADE80', '#A78BFA', '#F472B6'];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);
  const size = useMemo(() => 4 + Math.random() * 6, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fallAnim, {
          toValue: 500,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(swayAnim, {
            toValue: 30,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(swayAnim, {
            toValue: -30,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(swayAnim, {
            toValue: 15,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        top: 0,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: opacityAnim,
        transform: [{ translateY: fallAnim }, { translateX: swayAnim }],
      }}
    />
  );
}

export default function ResultsScreen() {
  const router = useRouter();
  const { derbyId } = useLocalSearchParams<{ derbyId: string }>();
  const { derbies } = useDerby();
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.5)).current;
  const listFade = useRef(new Animated.Value(0)).current;
  const buttonFade = useRef(new Animated.Value(0)).current;

  const derby = useMemo(() => {
    return derbies.find(d => d.id === derbyId) ?? null;
  }, [derbies, derbyId]);

  const rankings = useMemo(() => {
    if (!derby) return [];
    const mapped = derby.participants.map(p => {
      const total = derby.catches
        .filter(c => c.participantId === p.id)
        .reduce((sum, c) => sum + c.count, 0);
      return { ...p, count: total };
    });
    mapped.sort((a, b) => b.count - a.count);
    return mapped.map((m, i) => ({ ...m, rank: i + 1 }));
  }, [derby]);

  const totalCatch = useMemo(() => {
    return rankings.reduce((sum, r) => sum + r.count, 0);
  }, [rankings]);

  const podiumOrder = useMemo(() => {
    const top3 = rankings.slice(0, 3);
    if (top3.length === 3) return [top3[1], top3[0], top3[2]];
    if (top3.length === 2) return [top3[1], top3[0]];
    return top3;
  }, [rankings]);

  const confettiParticles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      delay: Math.random() * 1500,
      startX: Math.random() * SCREEN_WIDTH,
    }));
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(titleScale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(listFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(buttonFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!derby) return null;

  const maxCount = rankings.length > 0 ? Math.max(...rankings.map(r => r.count), 1) : 1;
  const podiumDelays = [600, 200, 900];

  return (
    <View style={styles.root}>
      <View style={styles.bgGradientTop} />
      <View style={styles.bgGradientBottom} />
      <FloatingFishDecor />

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {confettiParticles.map(p => (
          <ConfettiParticle key={p.id} delay={p.delay} startX={p.startX} />
        ))}
      </View>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.titleArea, { opacity: titleFade, transform: [{ scale: titleScale }] }]}>
            <Trophy color={Colors.warmAmber} size={32} />
            <Text style={styles.title}>結果発表</Text>
            <Text style={styles.subtitle}>{derby.name}</Text>
            <View style={styles.totalRow}>
              <Fish color={Colors.icyBlue} size={16} />
              <Text style={styles.totalText}>合計 {totalCatch} 匹</Text>
            </View>
          </Animated.View>

          <View style={styles.podiumArea}>
            {podiumOrder.map((entry, i) => {
              const heightIndex = entry.rank - 1;
              const proportionalHeight = maxCount > 0
                ? Math.max(40, (entry.count / maxCount) * 170)
                : 40;
              return (
                <PodiumBlock
                  key={entry.id}
                  entry={entry}
                  height={proportionalHeight}
                  delay={podiumDelays[heightIndex] ?? 1000}
                />
              );
            })}
          </View>

          <Animated.View style={[styles.fullRankingArea, { opacity: listFade }]}>
            <Text style={styles.sectionTitle}>全順位</Text>
            {rankings.map((entry, index) => (
              <View
                key={entry.id}
                style={[
                  styles.rankRow,
                  index === 0 && styles.rankRowFirst,
                ]}
              >
                <View style={styles.rankBadge}>
                  <Text style={[
                    styles.rankNumber,
                    index < 3 && { color: [Colors.warmAmber, Colors.silver, Colors.bronze][index] },
                  ]}>
                    {index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}`}
                  </Text>
                </View>
                <View style={[styles.rankAvatar, { borderColor: entry.color + '60' }]}>
                  {entry.icon ? (
                    <Text style={styles.rankAvatarEmoji}>{entry.icon}</Text>
                  ) : (
                    <Text style={[styles.rankAvatarInitial, { color: entry.color }]}>
                      {entry.name.charAt(0)}
                    </Text>
                  )}
                </View>
                <Text style={styles.rankName} numberOfLines={1}>{entry.name}</Text>
                <View style={styles.rankCountArea}>
                  <FishIcon width={18} height={11} color={entry.color} opacity={0.7} comical />
                  <Text style={[styles.rankCount, { color: entry.color }]}>{entry.count}</Text>
                  <Text style={styles.rankUnit}>匹</Text>
                </View>
              </View>
            ))}
          </Animated.View>

          <Animated.View style={[styles.buttonArea, { opacity: buttonFade }]}>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => router.replace('/')}
              activeOpacity={0.7}
              testID="go-home"
            >
              <Home color="#FFF" size={18} />
              <Text style={styles.homeButtonText}>ホームに戻る</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const podiumStyles = StyleSheet.create({
  column: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  avatarArea: {
    alignItems: 'center',
    marginBottom: 8,
  },
  crownArea: {
    marginBottom: -4,
  },
  crownEmoji: {
    fontSize: 22,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: '800' as const,
  },
  playerName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700' as const,
    marginTop: 6,
    maxWidth: 90,
    textAlign: 'center',
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countText: {
    fontSize: 14,
    fontWeight: '800' as const,
  },
  bar: {
    width: '80%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
    overflow: 'hidden',
  },
  barShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  rankEmoji: {
    fontSize: 20,
  },
});

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
  scrollContent: {
    paddingBottom: 40,
  },
  titleArea: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '900' as const,
    color: '#FFF',
    letterSpacing: 2,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.icyBlue,
    fontWeight: '600' as const,
    opacity: 0.7,
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: 'rgba(168,213,226,0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  totalText: {
    fontSize: 14,
    color: Colors.icyBlue,
    fontWeight: '700' as const,
  },
  podiumArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    height: 320,
  },
  fullRankingArea: {
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.icyBlue,
    marginBottom: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    gap: 10,
  },
  rankRowFirst: {
    backgroundColor: 'rgba(232,168,56,0.06)',
    borderRadius: 12,
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  rankBadge: {
    width: 28,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '800' as const,
    color: Colors.textSecondary,
  },
  rankAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankAvatarEmoji: {
    fontSize: 16,
  },
  rankAvatarInitial: {
    fontSize: 15,
    fontWeight: '800' as const,
  },
  rankName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  rankCountArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankCount: {
    fontSize: 18,
    fontWeight: '900' as const,
  },
  rankUnit: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  buttonArea: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 24,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.deepTeal,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 20,
  },
  homeButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFF',
  },
});
