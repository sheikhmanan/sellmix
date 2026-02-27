import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, StatusBar,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

export default function SignUpScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', mobile: '', password: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { register } = useAuth();

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleRegister = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Please enter your name');
    if (!form.mobile.trim()) return Alert.alert('Error', 'Please enter your mobile number');
    if (form.password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');

    setLoading(true);
    try {
      await register(form);
      navigation.replace('Main');
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.secondary} />

      {/* Brand */}
      <Text style={s.brand}>SellMix</Text>

      {/* Spacer */}
      <View style={{ height: 32 }} />

      {/* Heading */}
      <Text style={s.heading}>Create your account</Text>
      <Text style={s.sub}>Enter your details to get started.</Text>

      {/* Name */}
      <Text style={s.label}>Name</Text>
      <TextInput
        style={s.input}
        placeholder="e.g. Ali Ahmed"
        value={form.name}
        onChangeText={(v) => set('name', v)}
        placeholderTextColor={COLORS.textMuted}
        autoCapitalize="words"
      />

      {/* Mobile */}
      <Text style={s.label}>Mobile Number</Text>
      <TextInput
        style={s.input}
        placeholder="0300 1234567"
        value={form.mobile}
        onChangeText={(v) => set('mobile', v)}
        keyboardType="phone-pad"
        placeholderTextColor={COLORS.textMuted}
      />

      {/* Password */}
      <Text style={s.label}>Password</Text>
      <View style={s.passWrap}>
        <TextInput
          style={s.passInput}
          placeholder="Enter your password"
          value={form.password}
          onChangeText={(v) => set('password', v)}
          secureTextEntry={!showPass}
          placeholderTextColor={COLORS.textMuted}
        />
        <TouchableOpacity style={s.eyeBtn} onPress={() => setShowPass(!showPass)}>
          <Text style={s.eyeTxt}>{showPass ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>

      {/* Delivery Address */}
      <Text style={s.label}>Delivery Address</Text>
      <TextInput
        style={[s.input, s.multiInput]}
        placeholder="e.g. House #123, Street 4, Chichawatni"
        value={form.address}
        onChangeText={(v) => set('address', v)}
        multiline
        numberOfLines={2}
        textAlignVertical="top"
        placeholderTextColor={COLORS.textMuted}
      />

      {/* Register Button */}
      <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
        {loading
          ? <ActivityIndicator color={COLORS.white} />
          : <Text style={s.btnTxt}>Register</Text>
        }
      </TouchableOpacity>

      {/* Terms */}
      <Text style={s.terms}>
        By registering, you agree to our{' '}
        <Text style={s.link}>Terms of Service</Text>.
      </Text>

      {/* Login link */}
      <TouchableOpacity style={s.loginLink} onPress={() => navigation.navigate('Login')}>
        <Text style={s.loginTxt}>
          Already have an account?{' '}
          <Text style={s.link}>Login</Text>
        </Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.secondary },
  container: { paddingHorizontal: 24, paddingTop: 60 },

  // Brand
  brand: {
    fontSize: 32, fontWeight: '800', color: COLORS.primary,
    textAlign: 'center', letterSpacing: 0.5,
  },

  // Heading
  heading: { fontSize: 28, fontWeight: '800', color: COLORS.black, marginBottom: 8 },
  sub: { fontSize: 14, color: COLORS.textLight, marginBottom: 28, lineHeight: 22 },

  // Form
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 14, padding: 15, fontSize: 15, color: COLORS.text, marginBottom: 18,
  },
  multiInput: { height: 76 },

  // Password field with eye
  passWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 14, marginBottom: 18, overflow: 'hidden',
  },
  passInput: { flex: 1, padding: 15, fontSize: 15, color: COLORS.text },
  eyeBtn: { paddingHorizontal: 14 },
  eyeTxt: { fontSize: 18 },

  // Button
  btn: {
    backgroundColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 17, alignItems: 'center', marginBottom: 18,
  },
  btnTxt: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  // Terms & Login
  terms: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 12, lineHeight: 20 },
  loginLink: { alignItems: 'center', paddingVertical: 8 },
  loginTxt: { fontSize: 14, color: COLORS.textLight },
  link: { color: COLORS.primary, fontWeight: '700' },
});
