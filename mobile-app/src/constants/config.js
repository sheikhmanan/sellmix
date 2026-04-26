import Constants from 'expo-constants';

// Priority: app.json extra.apiUrl → fallback
// To change for real device: update apiUrl in app.json to your PC's local IP
// e.g. "http://192.168.1.100:5000/api"
// For production: set to your live API URL
export const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:5000/api';
