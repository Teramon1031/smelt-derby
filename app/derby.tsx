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
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Trophy, Minus, Square, UserCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useDerby } from '@/contexts/DerbyContext';
import MountainBackground from '@/components/MountainBackground';
import FishIcon from '@/components/FishIcon';
import type { Participant } from '@/types/derby';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_AREA_WIDTH = SCREEN_WIDTH - 130;

const EMOJI_OPTIONS = [
  '🎣', '🐟', '⛄', '🏔️', '🌊', '❄️', '🔥', '⭐',
  '🐧', '🦊', '🐻', '🐱', '🐶', '🐸', '🦅', '🐺',
  '😎', '🤠', '👑', '💪', '🎯', '🏆', '🍺', '☕',
];

function WakasagiFishTip({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <FishIcon width={size} height={size * 0.6} color={color} opacity={1} />
    </View>
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
  const prevCountRef = useRef(count);

  const targetWidth = useMemo(() => {
    if (maxCount === 0) return 20;
    return Math.max(20, (count / Math.max(maxCount, 1)) * (BAR_AREA_WIDTH - 40));
  }, [count, maxCount]);

  useEffect(() => {
    Animated.spring(barWidth, {
      toValue: targetWidth,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [targetWidth]);

  useEffect(() => {
    if (count > prevCountRef.current) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
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

  const rankBadge = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `${rank}`;

  return (
    <View style={barStyles.row}>
      <View style={barStyles.leftSection}>
        <TouchableOpacity onPress={onIconPress} style={barStyles.iconBtn} testID={`icon-btn-${participant.id}`}>
          {participant.icon ? (
            <Text style={barStyles.iconEmoji}>{participant.icon}</Text>
          ) : (
            <UserCircle color={participant.color} size={24} />
          )}
        </TouchableOpacity>
        <View style={barStyles.nameArea}>
          <Text style={barStyles.name} numberOfLines={1}>{participant.name}</Text>
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
            <Text style={barStyles.countInBar}>{count}</Text>
          </Animated.View>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              onPress={handlePress}
              activeOpacity={0.6}
              testID={`fish-tap-${participant.id}`}
              style={barStyles.fishTapArea}
            >
              <WakasagiFishTip color={participant.color} size={32} />
            </TouchableOpacity>
          </Animated.View>
        </View>
        <View style={barStyles.actions}>
          {count > 0 && (
            <TouchableOpacity
              onPress={handleDecrementPress}
              style={barStyles.decrementBtn}
              testID={`decrement-${participant.id}`}
            >
              <Minus color={Colors.textMuted} size={14} />
            </TouchableOpacity>
          )}
          <Text style={barStyles.rankText}>{rankBadge}</Text>
        </View>
      </View>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  leftSection: {
    width: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 20,
  },
  nameArea: {
    flex: 1,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  barArea: {
    flex: 1,
    gap: 4,
  },
  barTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    overflow: 'visible',
  },
  barFill: {
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 8,
    minWidth: 20,
  },
  countInBar: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700' as const,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  fishTapArea: {
    padding: 4,
    marginLeft: -4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  decrementBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});

export default function DerbyScreen() {
  const router = useRouter();
  const {
    activeDerby,
    rankings,
    totalCatchCount,
    incrementCatch,
    decrementCatch,
    setParticipantIcon,
    endDerby,
    getCatchCount,
  } = useDerby();

  const [iconModalVisible, setIconModalVisible] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeDerby) {
      router.replace('/');
    }
  }, [activeDerby]);

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

  if (!activeDerby) return null;

  const selectedParticipant = activeDerby.participants.find(p => p.id === selectedParticipantId);

  return (
    <View style={styles.root}>
      <MountainBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <View style={styles.eventInfo}>
            <Text style={styles.eventName} numberOfLines={1}>{activeDerby.name}</Text>
            {activeDerby.location ? (
              <View style={styles.locationRow}>
                <MapPin color={Colors.textMuted} size={12} />
                <Text style={styles.locationText}>{activeDerby.location}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.totalBadge}>
            <Trophy color={Colors.warmAmber} size={14} />
            <Text style={styles.totalText}>{totalCatchCount}</Text>
          </View>
        </View>

        <Text style={styles.hintText}>🐟 ← タップで+1</Text>

        <ScrollView style={styles.flex} contentContainerStyle={styles.listContent}>
          {sortedParticipants.map((participant, index) => {
            const count = getCatchCount(participant.id);
            const rank = sortedParticipants.findIndex(
              p => getCatchCount(p.id) >= count && p.id !== participant.id
            ) === -1
              ? index + 1
              : index + 1;
            return (
              <BarRow
                key={participant.id}
                participant={participant}
                count={count}
                maxCount={maxCount}
                rank={index + 1}
                onTapFish={() => incrementCatch(participant.id)}
                onLongPress={() => decrementCatch(participant.id)}
                onIconPress={() => handleOpenIconModal(participant.id)}
              />
            );
          })}
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.endBtn}
            onPress={handleEndDerby}
            activeOpacity={0.8}
            testID="end-derby"
          >
            <Square color={Colors.danger} size={16} />
            <Text style={styles.endBtnText}>ダービー終了</Text>
          </TouchableOpacity>
        </View>

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
              <Text style={styles.modalTitle}>
                {selectedParticipant?.name ?? ''} のアイコン
              </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.deepNavy,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  eventInfo: {
    flex: 1,
    marginRight: 12,
  },
  eventName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  totalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(232,168,56,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.warmAmber,
  },
  hintText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  endBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(232,84,84,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(232,84,84,0.2)',
  },
  endBtnText: {
    color: Colors.danger,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH - 48,
    backgroundColor: Colors.navy,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
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
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
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
