import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Link2, Copy, Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/colors';

interface RoomBannerProps {
  roomId: string;
}

export default function RoomBanner({ roomId }: RoomBannerProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = Platform.OS === 'web'
      ? window.location.href
      : `https://smelt-derby.rork.app/room/${roomId}`;

    if (Platform.OS === 'web' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <Link2 color={Colors.icyBlue} size={12} />
        <Text style={styles.label}>{t('room_banner_label')}</Text>
        <Text style={styles.code}>{roomId}</Text>
      </View>
      <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.7}>
        {copied ? (
          <Check color={Colors.teal} size={14} />
        ) : (
          <Copy color={Colors.icyBlue} size={14} />
        )}
        <Text style={[styles.copyText, copied && styles.copiedText]}>
          {copied ? t('room_copied') : t('room_copy_link')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(168,213,226,0.07)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginHorizontal: 16,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(168,213,226,0.12)',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    opacity: 0.7,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  code: {
    fontSize: 13,
    fontWeight: '800' as const,
    color: Colors.icyBlue,
    letterSpacing: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  copyText: {
    fontSize: 11,
    color: Colors.icyBlue,
    fontWeight: '600' as const,
  },
  copiedText: {
    color: Colors.teal,
  },
});
