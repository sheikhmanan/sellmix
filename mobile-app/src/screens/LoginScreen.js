import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, StatusBar, Dimensions,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

const { height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [tab, setTab] = useState('login');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!mobile || !password) return Alert.alert('Error', 'Please fill all fields');
    setLoading(true);
    try {
      await login(mobile, password);
      navigation.replace('Main');
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* Hero header — food background feel */}
      <View style={s.hero}>
        {/* Overlay pattern using emoji */}
        <View style={s.emojiRow}>
          {['🥕','🥦','🍅','🧅','🌽','🫑','🍆','🥝'].map((e, i) => (
            <Text key={i} style={s.heroEmoji}>{e}</Text>
          ))}
        </View>
        <View style={s.heroOverlay} />
        <Text style={s.heroBrand}>SELLMIX</Text>
        <Text style={s.heroSub}>CHICHAWATNI'S FINEST</Text>
      </View>

      {/* Card */}
      <ScrollView style={s.card} contentContainerStyle={s.cardContent} keyboardShouldPersistTaps="handled">
        {/* Tabs */}
        <View style={s.tabs}>
          <TouchableOpacity style={[s.tab, tab === 'login' && s.tabActive]} onPress={() => setTab('login')}>
            <Text style={[s.tabText, tab === 'login' && s.tabTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tab]} onPress={() => navigation.navigate('SignUp')}>
            <Text style={s.tabText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.label}>Email or Mobile Number</Text>
        <TextInput
          style={s.input}
          placeholder="e.g. 0300 1234567"
          value={mobile}
          onChangeText={setMobile}
          keyboardType="phone-pad"
          placeholderTextColor={COLORS.textMuted}
        />

        <Text style={s.label}>Password</Text>
        <View style={s.passRow}>
          <TextInput
            style={s.passInput}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            placeholderTextColor={COLORS.textMuted}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
            <Text style={s.eye}>{showPass ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.forgotRow}>
          <Text style={s.forgot}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.loginBtn} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={s.loginBtnText}>Login to Sellmix</Text>
          }
        </TouchableOpacity>

        <View style={s.orRow}>
          <View style={s.orLine} />
          <Text style={s.orText}>Or continue with</Text>
          <View style={s.orLine} />
        </View>

        <TouchableOpacity style={s.googleBtn}>
          <Text style={s.googleText}>🅖  Sign in with Google</Text>
        </TouchableOpacity>

        <Text style={s.terms}>
          By continuing, you agree to SellMix's{' '}
          <Text style={s.link}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={s.link}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.white },

  // Hero section
  hero: { height: height * 0.28, backgroundColor: '#1a5f2a', overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 24 },
  emojiRow: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', flexWrap: 'wrap', opacity: 0.25 },
  heroEmoji: { fontSize: 48, margin: 4 },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  heroBrand: { fontSize: 36, fontWeight: '900', color: COLORS.white, letterSpacing: 6, zIndex: 2 },
  heroSub: { fontSize: 12, color: COLORS.white, opacity: 0.85, letterSpacing: 3, marginTop: 4, zIndex: 2 },

  // Card
  card: { flex: 1, backgroundColor: COLORS.white },
  cardContent: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 40 },

  tabs: { flexDirection: 'row', borderBottomWidth: 1.5, borderColor: COLORS.border, marginBottom: 26 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2.5, borderColor: COLORS.primary },
  tabText: { fontSize: 15, color: COLORS.grey, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary, fontWeight: '700' },

  label: { fontSize: 13, color: COLORS.text, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    padding: 14, fontSize: 15, color: COLORS.text,
    backgroundColor: COLORS.secondary, marginBottom: 18,
  },
  passRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    backgroundColor: COLORS.secondary, paddingHorizontal: 14, marginBottom: 10,
  },
  passInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: COLORS.text },
  eyeBtn: { padding: 6 },
  eye: { fontSize: 18 },
  forgotRow: { alignSelf: 'flex-end', marginBottom: 22 },
  forgot: { color: COLORS.primary, fontSize: 13, fontWeight: '500' },

  loginBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 22 },
  loginBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  orRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 10 },
  orLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  orText: { fontSize: 13, color: COLORS.grey },

  googleBtn: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 24 },
  googleText: { fontSize: 15, fontWeight: '600', color: COLORS.text },

  terms: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },
  link: { color: COLORS.primary, fontWeight: '600' },
});
