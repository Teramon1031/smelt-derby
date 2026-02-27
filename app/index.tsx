import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Users, Plus, X, ChevronRight, Snowflake } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useDerby } from '@/contexts/DerbyContext';
import MountainBackground from '@/components/MountainBackground';
import FishIcon from '@/components/FishIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SetupScreen() {
  const router = useRouter();
  const { activeDerby, createDerby } = useDerby();
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [participants, setParticipants] = useState<string[]>(['']);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (activeDerby && activeDerby.isActive) {
      router.replace('/derby');
      return;
    }
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeDerby]);

  const addParticipantField = useCallback(() => {
    setParticipants(prev => [...prev, '']);
  }, []);

  const removeParticipant = useCallback((index: number) => {
    setParticipants(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateParticipant = useCallback((index: number, value: string) => {
    setParticipants(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);

  const handleStart = useCallback(() => {
    const trimmedName = eventName.trim();
    const trimmedLocation = location.trim();
    const validParticipants = participants.map(p => p.trim()).filter(p => p.length > 0);

    if (!trimmedName) {
      setError('イベント名を入力してください');
      return;
    }
    if (validParticipants.length < 2) {
      setError('2人以上の参加者を入力してください');
      return;
    }

    setError('');
    createDerby(trimmedName, trimmedLocation, validParticipants);
    router.replace('/derby');
  }, [eventName, location, participants, createDerby, router]);

  return (
    <View style={styles.root}>
      <MountainBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={[
                styles.header,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <View style={styles.titleRow}>
                <FishIcon width={48} height={24} color={Colors.icyBlue} opacity={0.8} />
                <Snowflake color={Colors.icyBlue} size={16} style={styles.snowflake} />
              </View>
              <Text style={styles.title}>ワカサギダービー</Text>
              <Text style={styles.subtitle}>冬の湖で、仲間と釣果を競おう</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.form,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <View style={styles.inputGroup}>
                <Text style={styles.label}>イベント名</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={eventName}
                    onChangeText={setEventName}
                    placeholder="例: 2024冬の陣"
                    placeholderTextColor={Colors.textMuted}
                    testID="event-name-input"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <MapPin color={Colors.icyBlue} size={14} />
                  <Text style={styles.label}>場所</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="例: 諏訪湖"
                    placeholderTextColor={Colors.textMuted}
                    testID="location-input"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Users color={Colors.icyBlue} size={14} />
                  <Text style={styles.label}>参加者</Text>
                </View>
                {participants.map((p, index) => (
                  <View key={index} style={styles.participantRow}>
                    <View style={[styles.inputWrapper, styles.participantInput]}>
                      <View
                        style={[
                          styles.colorDot,
                          {
                            backgroundColor:
                              Colors.participantColors[
                                index % Colors.participantColors.length
                              ],
                          },
                        ]}
                      />
                      <TextInput
                        style={[styles.input, styles.participantTextInput]}
                        value={p}
                        onChangeText={(val) => updateParticipant(index, val)}
                        placeholder={`参加者 ${index + 1}`}
                        placeholderTextColor={Colors.textMuted}
                        testID={`participant-input-${index}`}
                      />
                    </View>
                    {participants.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => removeParticipant(index)}
                        testID={`remove-participant-${index}`}
                      >
                        <X color={Colors.textMuted} size={18} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={addParticipantField}
                  testID="add-participant"
                >
                  <Plus color={Colors.icyBlue} size={18} />
                  <Text style={styles.addBtnText}>参加者を追加</Text>
                </TouchableOpacity>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                style={styles.startBtn}
                onPress={handleStart}
                activeOpacity={0.8}
                testID="start-derby"
              >
                <Text style={styles.startBtnText}>ダービー開始</Text>
                <ChevronRight color="#FFF" size={20} />
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 36,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  snowflake: {
    marginLeft: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.textPrimary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participantInput: {
    flex: 1,
  },
  participantTextInput: {
    paddingLeft: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 14,
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168,213,226,0.2)',
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  addBtnText: {
    color: Colors.icyBlue,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  error: {
    color: Colors.danger,
    fontSize: 13,
    textAlign: 'center',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.teal,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 6,
    marginTop: 8,
  },
  startBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700' as const,
  },
});
