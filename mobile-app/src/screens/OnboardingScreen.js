import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

const slides = [
  { id: '1', bg: '#F4A227', icon: '🧺', title: 'Pure and Clean Products', subtitle: 'Quality you trust, now at your fingertips.\nWe deliver only the purest and cleanest\nKaryāna products.' },
  { id: '2', bg: '#E8A020', icon: '🌾', title: 'Everything in One Place', subtitle: 'From your daily Karyāna needs—daals,\nspices, and tea—to household essentials.\nYour authentic local store, now just a tap\naway in Chichawatni.' },
  { id: '3', isPayment: true, title: 'Secure & Easy', subtitle: 'Pay securely with local favorites\nor choose Cash on Delivery.' },
];

const PAY = [
  { icon: '🔴', label: 'JazzCash' }, { icon: '🟢', label: 'Easypaisa' },
  { icon: '💵', label: 'COD' },       { icon: '💳', label: 'Cards' },
];

export default function OnboardingScreen({ navigation }) {
  const [current, setCurrent] = useState(0);
  const listRef = useRef(null);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('onboarding_seen', 'true');
    navigation.replace('Main');
  };

  const goNext = () => {
    if (current < slides.length - 1) {
      const n = current + 1;
      listRef.current?.scrollToIndex({ index: n, animated: true });
      setCurrent(n);
    } else {
      finishOnboarding();
    }
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <Text style={s.brand}>SellMix</Text>

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(i) => i.id}
        horizontal pagingEnabled scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[s.slide, { width }]}>
            {item.isPayment ? (
              <View style={[s.box, { backgroundColor: '#F8F9FA' }]}>
                <View style={s.shieldBadge}><Text style={{ fontSize: 24 }}>🛡️</Text></View>
                <View style={s.payCard}>
                  <Text style={s.payTitle}>SECURE PAYMENTS</Text>
                  <View style={s.payGrid}>
                    {PAY.map((p) => (
                      <View key={p.label} style={s.payItem}>
                        <Text style={s.payIcon}>{p.icon}</Text>
                        <Text style={s.payLabel}>{p.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              <View style={[s.box, { backgroundColor: item.bg }]}>
                <Text style={s.boxIcon}>{item.icon}</Text>
              </View>
            )}
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={s.dots}>
        {slides.map((_, i) => <View key={i} style={[s.dot, i === current && s.dotActive]} />)}
      </View>

      <TouchableOpacity style={s.nextBtn} onPress={goNext}>
        <Text style={s.nextText}>{current === 2 ? 'Start Shopping  →' : 'Next  →'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.skipBtn} onPress={finishOnboarding}>
        <Text style={s.skipText}>Skip for now</Text>
      </TouchableOpacity>

      <View style={s.authRow}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={s.authLink}>Login</Text>
        </TouchableOpacity>
        <Text style={s.authSep}>  |  </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={s.authLink}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white, alignItems: 'center', paddingTop: 52 },
  brand: { fontSize: 22, fontWeight: '800', color: COLORS.primary, marginBottom: 24 },
  slide: { alignItems: 'center', paddingHorizontal: 28 },
  box: { width: width * 0.74, height: width * 0.74, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  boxIcon: { fontSize: 110 },
  shieldBadge: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#34C759', alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#34C759', shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  payCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: COLORS.border, width: '90%' },
  payTitle: { fontSize: 12, fontWeight: '800', color: COLORS.primary, textAlign: 'center', letterSpacing: 1.5, marginBottom: 14 },
  payGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  payItem: { width: 96, height: 76, backgroundColor: COLORS.lightGrey, borderRadius: 12, alignItems: 'center', justifyContent: 'center', gap: 6 },
  payIcon: { fontSize: 26 },
  payLabel: { fontSize: 11, fontWeight: '700', color: COLORS.text },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.black, textAlign: 'center', marginBottom: 12, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, color: COLORS.textLight, textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', gap: 8, marginTop: 28, marginBottom: 22 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { width: 28, borderRadius: 4, backgroundColor: COLORS.primary },
  nextBtn: { width: width - 64, paddingVertical: 17, borderRadius: 40, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', marginBottom: 14 },
  nextText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  skipBtn: { padding: 10 },
  skipText: { fontSize: 14, color: COLORS.grey },
  authRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 16 },
  authLink: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  authSep: { fontSize: 14, color: COLORS.grey },
});
