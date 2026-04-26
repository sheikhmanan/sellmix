import { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, StatusBar, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

const LOGIN_IMG = 'https://res.cloudinary.com/dnhuilgay/image/upload/f_auto,q_auto,w_800/ChatGPT_Image_Apr_7_2026_03_22_38_PM_hp4voo';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    bg: '#F4A227',
    icon: '🧺',
    title: 'Everything in One Place',
    subtitle: 'From your daily Karyāna needs—daals,\nspices, and tea—to household essentials.\nYour authentic local store, now just a tap\naway in Chichawatni.',
  },
  {
    id: '2',
    isPayment: true,
    title: 'Secure Payments',
    subtitle: 'Pay securely with local favorites\nor choose Cash on Delivery\nfor your peace of mind.',
  },
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Logo — fixed position, same on every slide */}
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
              <View style={s.payBox}>
                <View style={s.payRow}>
                  <View style={s.payCard}><Text style={s.payCardText}>EASYPAISA</Text></View>
                  <View style={s.payCard}><Text style={s.payCardText}>JAZZCASH</Text></View>
                </View>
                <View style={[s.payCard, s.codCard]}>
                  <Text style={s.codIcon}>💵</Text>
                  <View>
                    <Text style={s.codTitle}>Cash on Delivery</Text>
                    <Text style={s.codSub}>Pay at your doorstep</Text>
                  </View>
                </View>
              </View>
            ) : (
              <Image source={{ uri: LOGIN_IMG }} style={s.box} resizeMode="cover" />
            )}
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={s.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[s.dot, i === current && s.dotActive]} />
        ))}
      </View>

      {/* CTA button */}
      <TouchableOpacity style={s.nextBtn} onPress={goNext}>
        <Text style={s.nextText}>
          {current === slides.length - 1 ? 'Get Started  🚀' : 'Next'}
        </Text>
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
  container:   { flex: 1, backgroundColor: COLORS.primary, alignItems: 'center', paddingTop: 52 },
  brand:       { fontSize: 26, fontWeight: '800', color: COLORS.white, marginBottom: 28, letterSpacing: 0.5 },

  slide:       { alignItems: 'center', paddingHorizontal: 28 },
  box:         { width: width * 0.74, height: width * 0.74, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  boxIcon:     { fontSize: 110 },

  // Payment slide
  payBox:      { width: width * 0.74, height: width * 0.74, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 32, padding: 20 },
  payRow:      { flexDirection: 'row', gap: 14, width: '100%' },
  payCard:     { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  payCardText: { fontSize: 12, fontWeight: '800', color: COLORS.white, letterSpacing: 1 },
  codCard:     { flex: undefined, width: '100%', flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 16, borderRadius: 14 },
  codIcon:     { fontSize: 28 },
  codTitle:    { fontSize: 15, fontWeight: '700', color: COLORS.white },
  codSub:      { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  title:       { fontSize: 26, fontWeight: '800', color: COLORS.white, textAlign: 'center', marginBottom: 12, letterSpacing: -0.3 },
  subtitle:    { fontSize: 15, color: 'rgba(255,255,255,0.82)', textAlign: 'center', lineHeight: 24 },

  dots:        { flexDirection: 'row', gap: 8, marginTop: 28, marginBottom: 22 },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive:   { width: 28, borderRadius: 4, backgroundColor: COLORS.white },

  nextBtn:     { width: width - 64, paddingVertical: 17, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)', alignItems: 'center', marginBottom: 14 },
  nextText:    { fontSize: 16, fontWeight: '700', color: COLORS.white },

  skipBtn:     { padding: 10 },
  skipText:    { fontSize: 14, color: 'rgba(255,255,255,0.65)' },

  authRow:     { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 16 },
  authLink:    { fontSize: 14, color: COLORS.white, fontWeight: '700' },
  authSep:     { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
});
