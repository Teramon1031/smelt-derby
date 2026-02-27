import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'smelt_session_id';

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // フォールバック（古い環境向け）
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// セッションをまたいで同一デバイスを識別する匿名UUID
export function useSessionId(): string {
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    if (Platform.OS === 'web') {
      let id = localStorage.getItem(SESSION_KEY);
      if (!id) {
        id = generateSessionId();
        localStorage.setItem(SESSION_KEY, id);
      }
      setSessionId(id);
    } else {
      AsyncStorage.getItem(SESSION_KEY).then(id => {
        if (id) {
          setSessionId(id);
        } else {
          const newId = generateSessionId();
          AsyncStorage.setItem(SESSION_KEY, newId);
          setSessionId(newId);
        }
      });
    }
  }, []);

  return sessionId;
}

// 非フック版（非コンポーネントから使う場合）
export async function getSessionId(): Promise<string> {
  if (Platform.OS === 'web') {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = generateSessionId();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } else {
    const id = await AsyncStorage.getItem(SESSION_KEY);
    if (id) return id;
    const newId = generateSessionId();
    await AsyncStorage.setItem(SESSION_KEY, newId);
    return newId;
  }
}
