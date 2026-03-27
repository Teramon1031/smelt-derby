import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/colors';

export default function ModalScreen() {
  const { t } = useTranslation();
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      onRequestClose={() => router.back()}
    >
      <Pressable style={styles.overlay} onPress={() => router.back()}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{t('modal_title')}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Text style={styles.closeButtonText}>{t('modal_close')}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.navy,
    borderRadius: 20,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    minWidth: 300,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 16,
    color: Colors.textPrimary,
  },
  closeButton: {
    backgroundColor: Colors.warmAmber,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 100,
  },
  closeButtonText: {
    color: Colors.deepNavy,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
});
