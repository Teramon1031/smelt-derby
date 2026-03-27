import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import ja from './translations/ja';
import en from './translations/en';

const deviceLanguage = getLocales()[0]?.languageCode ?? 'en';
const language = deviceLanguage === 'ja' ? 'ja' : 'en';

i18n.use(initReactI18next).init({
  resources: {
    ja: { translation: ja },
    en: { translation: en },
  },
  lng: language,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
