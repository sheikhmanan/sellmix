import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const t = setTimeout(async () => {
      // First time ever → show Onboarding; returning user → go straight to Main
      const seen = await AsyncStorage.getItem('onboarding_seen');
      navigation.replace(seen ? 'Main' : 'Onboarding');
    }, 2800);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <Text style={s.logo}>SellMix</Text>
      <View style={s.imageBox}>
        <Text style={s.scooter}>🛵</Text>
      </View>
      <Text style={s.tagline}>
        Get your groceries delivered right to{'\n'}
        your doorstep in Chichawatni. Enjoy{'\n'}
        the convenience of shopping from home.
      </Text>
      <View style={s.btnWrap}>
        <Text style={s.btnText}>Get Started</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
  },
  logo: { fontSize: 56, fontWeight: '800', color: COLORS.white, letterSpacing: -1, marginBottom: 36 },
  imageBox: {
    width: width * 0.72, height: width * 0.72,
    backgroundColor: COLORS.secondary, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginBottom: 40,
  },
  scooter: { fontSize: 110 },
  tagline: { fontSize: 16, color: COLORS.white, textAlign: 'center', lineHeight: 26, opacity: 0.95, marginBottom: 44 },
  btnWrap: { backgroundColor: COLORS.secondary, paddingVertical: 16, paddingHorizontal: 56, borderRadius: 40 },
  btnText: { color: COLORS.primary, fontSize: 16, fontWeight: '700' },
});
