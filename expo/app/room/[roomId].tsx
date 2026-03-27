import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Minus, Thermometer } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/colors';
import FloatingFishDecor from '@/components/FloatingFishDecor';
import FishIcon from '@/components/FishIcon';
import RoomBanner from '@/components/RoomBanner';
import { useRoomDerby } from '@/hooks/useRoomDerby';
import { useWeather } from '@/hooks/useWeather';
import type { Participant } from '@/types/derby';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BAR_AREA_WIDTH = SCREEN_WIDTH - 80;
const MAX_BAR_WIDTH = BAR_AREA_WIDTH - 60;

// --- BarRow components (same as derby.tsx) ---

function ComicalFishTip({ color, size = 52 }: { color: string; size?: number }) {
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
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 600, delay: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;
  return (
    <Animated.View style={{ position: 'absolute', left: -8, top: -8, opacity: opacityAnim, transform: [{ scale: scaleAnim }] }}>
      <Text style={{ fontSize: 16 }}>💧</Text>
    </Animated.View>
  );
}

const MAX_CATCH_FISH = 30;
const FISH_Y_POSITIONS = Array.from({ length: 30 }, (_, i) => Math.round((i / 30) * (SCREEN_HEIGHT - 40) + (i % 3) * 20));
const FISH_SIZES      = [20,16,24,18,22,14,26,18,20,16,24,22,18,14,20,26,16,22,18,24,20,16,22,18,14,24,20,26,18,16];
const FISH_DURATIONS  = [14000,18000,12000,20000,15000,22000,13000,17000,19000,11000,16000,21000,14500,18500,13500,20500,15500,12500,19500,16500,14000,18000,22000,13000,17000,20000,15000,12000,19000,16000];
const FISH_DELAYS     = [0,1500,3000,500,2000,4000,1000,2500,3500,700,1800,3200,400,2200,4200,900,1600,3800,600,2800,1200,3600,200,2600,4400,800,1400,3400,1100,2900];
const FISH_OPACITIES  = [0.10,0.14,0.18,0.12,0.16,0.10,0.18,0.14,0.12,0.16,0.10,0.18,0.14,0.12,0.16,0.18,0.10,0.14,0.16,0.12,0.18,0.10,0.14,0.16,0.12,0.18,0.14,0.10,0.16,0.12];

function CatchFish({ index }: { index: number }) {
  const direction = index % 2 === 0 ? 'right' : 'left';
  const size      = FISH_SIZES[index];
  const y         = FISH_Y_POSITIONS[index];
  const duration  = FISH_DURATIONS[index];
  const delay     = FISH_DELAYS[index];
  const opacity   = FISH_OPACITIES[index];
  const swimAnim  = useRef(new Animated.Value(direction === 'right' ? -60 : SCREEN_WIDTH + 20)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: opacity, duration: 1200, useNativeDriver: true }).start();
    const startSwim = () => {
      const from = direction === 'right' ? -60 : SCREEN_WIDTH + 20;
      const to   = direction === 'right' ? SCREEN_WIDTH + 60 : -60;
      swimAnim.setValue(from);
      Animated.timing(swimAnim, { toValue: to, duration, useNativeDriver: true }).start(() => startSwim());
    };
    const t = setTimeout(startSwim, delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View style={{ position: 'absolute', top: y, opacity: fadeAnim, transform: [{ translateX: swimAnim }, { scaleX: direction === 'right' ? -1 : 1 }] }}>
      <FishIcon width={size * 2} height={size} color="rgba(168,213,226,0.9)" opacity={1} comical />
    </Animated.View>
  );
}

function CatchFishBackground({ count }: { count: number }) {
  const capped = Math.min(count, MAX_CATCH_FISH);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: capped }).map((_, i) => <CatchFish key={i} index={i} />)}
    </View>
  );
}

interface BarRowProps {
  participant: Participant;
  count: number;
  maxCount: number;
  rank: number;
  onTapFish: () => void;
  onDecrement: () => void;
}

function BarRow({ participant, count, maxCount, rank, onTapFish, onDecrement }: BarRowProps) {
  const barWidth  = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const prevCountRef = useRef(count);
  const [showSplash, setShowSplash] = useState(false);

  const targetWidth = useMemo(() => {
    if (count === 0 || maxCount === 0) return 0;
    return Math.max(28, (count / maxCount) * MAX_BAR_WIDTH);
  }, [count, maxCount]);

  useEffect(() => {
    Animated.timing(barWidth, { toValue: targetWidth, duration: 180, useNativeDriver: false }).start();
  }, [targetWidth]);

  useEffect(() => {
    if (count > prevCountRef.current) {
      setShowSplash(true);
      setTimeout(() => setShowSplash(false), 800);
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 80, useNativeDriver: true }),
        Animated.spring(pulseAnim, { toValue: 1, friction: 3, tension: 120, useNativeDriver: true }),
      ]).start();
    }
    prevCountRef.current = count;
  }, [count]);

  const handlePress = useCallback(() => {
    onTapFish();
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [onTapFish]);

  const handleDecrementPress = useCallback(() => {
    onDecrement();
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [onDecrement]);

  const rankBadge = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : null;
  const isLeader  = rank === 1 && count > 0;

  return (
    <View style={barStyles.row}>
      <View style={barStyles.nameRow}>
        {rankBadge ? <Text style={barStyles.rankEmoji}>{rankBadge}</Text> : null}
        <Text style={[barStyles.name, isLeader && barStyles.leaderName]}>{participant.name}</Text>
      </View>
      <View style={barStyles.barArea}>
        <View style={barStyles.barTrack}>
          <Animated.View style={[barStyles.barFill, { width: barWidth, backgroundColor: participant.color }]}>
            <View style={barStyles.barShine} />
            <Text style={barStyles.countInBar}>{count}</Text>
          </Animated.View>
          <Animated.View style={[barStyles.fishContainer, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity onPress={handlePress} activeOpacity={0.5} style={barStyles.fishTapArea}>
              <ComicalFishTip color={participant.color} size={52} />
              <SplashEffect visible={showSplash} />
            </TouchableOpacity>
          </Animated.View>
        </View>
        {count > 0 && (
          <TouchableOpacity onPress={handleDecrementPress} style={barStyles.decrementBtn}>
            <Minus color="rgba(255,255,255,0.4)" size={12} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// --- Main Screen ---

export default function RoomDerbyScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { temperature } = useWeather();

  const { room, counts, isLoading, error, isCreator, incrementCatch, decrementCatch, endDerby } =
    useRoomDerby(roomId ?? '');

  const totalCatchCount = useMemo(
    () => Object.values(counts).reduce((s, c) => s + c, 0),
    [counts]
  );

  const totalBounce  = useRef(new Animated.Value(1)).current;
  const prevTotal    = useRef(totalCatchCount);

  useEffect(() => {
    if (totalCatchCount > prevTotal.current) {
      Animated.sequence([
        Animated.timing(totalBounce, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.spring(totalBounce, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }
    prevTotal.current = totalCatchCount;
  }, [totalCatchCount]);

  const maxCount = useMemo(() => {
    if (!room) return 0;
    return Math.max(...room.participants.map(p => counts[p.id] ?? 0), 1);
  }, [room, counts]);

  const rankMap = useMemo(() => {
    if (!room) return {} as Record<string, number>;
    const sorted = [...room.participants].sort(
      (a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0)
    );
    const map: Record<string, number> = {};
    sorted.forEach((p, i) => { map[p.id] = i + 1; });
    return map;
  }, [room, counts]);

  const handleEndDerby = useCallback(() => {
    Alert.alert(
      t('derby_confirm_title'),
      t('derby_confirm_message'),
      [
        { text: t('derby_cancel'), style: 'cancel' },
        { text: t('room_confirm_end'), onPress: () => endDerby() },
      ]
    );
  }, [endDerby, t]);

  if (isLoading) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator color={Colors.icyBlue} size="large" />
      </View>
    );
  }

  if (error || !room) {
    return (
      <View style={styles.centerScreen}>
        <Text style={styles.errorText}>{t('room_not_found')}</Text>
        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/')}>
          <Text style={styles.homeBtnText}>{t('results_home_btn')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FloatingFishDecor />
      <CatchFishBackground count={totalCatchCount} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.eventName} numberOfLines={1}>{room.name}</Text>
            {room.location ? (
              <View style={styles.locationRow}>
                <MapPin color={Colors.icyBlue} size={11} />
                <Text style={styles.locationText}>{room.location}</Text>
              </View>
            ) : null}
            {temperature !== null && (
              <View style={styles.tempRow}>
                <Thermometer color={Colors.icyBlue} size={11} />
                <Text style={styles.tempText}>{temperature}°C</Text>
              </View>
            )}
          </View>
          <Animated.View style={[styles.totalBubble, { transform: [{ scale: totalBounce }] }]}>
            <Text style={styles.totalFishEmoji}>🐟</Text>
            <Text style={styles.totalNumber}>{totalCatchCount}</Text>
            <Text style={styles.totalLabel}>{t('derby_unit')}</Text>
          </Animated.View>
        </View>

        <RoomBanner roomId={roomId ?? ''} />

        <View style={styles.hintBar}>
          <View style={styles.hintPill}>
            <Text style={styles.hintText}>{t('derby_hint')}</Text>
          </View>
        </View>

        <ScrollView style={styles.flex} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {room.participants.map(participant => {
            const count = counts[participant.id] ?? 0;
            return (
              <BarRow
                key={participant.id}
                participant={participant}
                count={count}
                maxCount={maxCount}
                rank={rankMap[participant.id] ?? 0}
                onTapFish={() => incrementCatch(participant.id)}
                onDecrement={() => decrementCatch(participant.id)}
              />
            );
          })}
        </ScrollView>

        {isCreator && (
          <TouchableOpacity style={styles.endFab} onPress={handleEndDerby} activeOpacity={0.7}>
            <Text style={styles.endFabText}>{t('room_end_btn')}</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: {
    flexDirection: 'column',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  rankEmoji: { fontSize: 11 },
  name: { color: Colors.textPrimary, fontSize: 12, fontWeight: '600' as const },
  leaderName: { color: Colors.warmAmber },
  barArea: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  barTrack: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 36, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, overflow: 'visible' },
  barFill: { height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 10, minWidth: 24, overflow: 'hidden' },
  barShine: { position: 'absolute', top: 0, left: 0, right: 0, height: 14, borderTopLeftRadius: 18, borderTopRightRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)' },
  countInBar: { color: '#FFF', fontSize: 13, fontWeight: '800' as const, textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  fishContainer: { marginLeft: -6 },
  fishTapArea: { padding: 6, position: 'relative' },
  decrementBtn: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1520' },
  safe: { flex: 1 },
  flex: { flex: 1 },
  centerScreen: { flex: 1, backgroundColor: '#0B1520', alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600' as const, textAlign: 'center' },
  homeBtn: { backgroundColor: Colors.teal, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  homeBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' as const },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  headerLeft: { flex: 1, marginRight: 12 },
  eventName: { fontSize: 20, fontWeight: '800' as const, color: '#FFF', letterSpacing: -0.3 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { fontSize: 12, color: Colors.icyBlue, opacity: 0.7 },
  tempRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4, marginTop: 3 },
  tempText: { fontSize: 12, color: Colors.icyBlue, fontWeight: '600' as const, opacity: 0.8 },
  totalBubble: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(168,213,226,0.12)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: 'rgba(168,213,226,0.15)' },
  totalFishEmoji: { fontSize: 16 },
  totalNumber: { fontSize: 22, fontWeight: '900' as const, color: '#FFF' },
  totalLabel: { fontSize: 11, color: Colors.icyBlue, fontWeight: '600' as const, marginTop: 4 },
  hintBar: { alignItems: 'center', paddingBottom: 6 },
  hintPill: { backgroundColor: 'rgba(168,213,226,0.08)', paddingHorizontal: 16, paddingVertical: 5, borderRadius: 12 },
  hintText: { fontSize: 11, color: Colors.icyBlue, fontWeight: '500' as const, opacity: 0.6 },
  listContent: { paddingTop: 4, paddingBottom: 100 },
  endFab: { position: 'absolute', right: 20, bottom: 28, backgroundColor: Colors.teal, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.teal, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  endFabText: { fontSize: 15, fontWeight: '700' as const, color: '#FFF' },
});
