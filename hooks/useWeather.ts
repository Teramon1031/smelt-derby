import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

interface WeatherData {
  temperature: number | null;
  isLoading: boolean;
  error: string | null;
}

async function getLocation(): Promise<{ latitude: number; longitude: number } | null> {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('[Weather] Geolocation not supported on web');
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log('[Weather] Web location:', pos.coords.latitude, pos.coords.longitude);
          resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        },
        (err) => {
          console.log('[Weather] Web geolocation error:', err.message);
          resolve(null);
        },
        { timeout: 10000 }
      );
    });
  }

  try {
    const Location = await import('expo-location');

    // システムダイアログの前に説明を表示
    const allowed = await new Promise<boolean>((resolve) => {
      const { t } = require('i18next');
      Alert.alert(
        t('weather_permission_title'),
        t('weather_permission_message'),
        [
          { text: t('weather_permission_deny'), style: 'cancel', onPress: () => resolve(false) },
          { text: t('weather_permission_allow'), onPress: () => resolve(true) },
        ],
        { cancelable: true, onDismiss: () => resolve(false) }
      );
    });
    if (!allowed) return null;

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('[Weather] Location permission denied');
      return null;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
    console.log('[Weather] Native location:', loc.coords.latitude, loc.coords.longitude);
    return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
  } catch (e) {
    console.log('[Weather] Native location error:', e);
    return null;
  }
}

async function fetchTemperature(lat: number, lon: number): Promise<number | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    console.log('[Weather] Fetching:', url);
    const res = await fetch(url);
    const data = await res.json();
    console.log('[Weather] Response:', JSON.stringify(data.current_weather));
    return data?.current_weather?.temperature ?? null;
  } catch (e) {
    console.log('[Weather] Fetch error:', e);
    return null;
  }
}

export function useWeather(): WeatherData {
  const { t } = useTranslation();
  const [temperature, setTemperature] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const loc = await getLocation();
        if (cancelled) return;
        if (!loc) {
          setError(t('weather_error_location'));
          setIsLoading(false);
          return;
        }
        const temp = await fetchTemperature(loc.latitude, loc.longitude);
        if (cancelled) return;
        if (temp !== null) {
          setTemperature(temp);
        } else {
          setError(t('weather_error_temperature'));
        }
      } catch {
        if (!cancelled) setError(t('weather_error_fetch'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { temperature, isLoading, error };
}
