import Constants from 'expo-constants';

// Production URL takes priority — falls back to emulator URL for local dev
export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrlProd || 'https://api.sellmix.pk/api';
