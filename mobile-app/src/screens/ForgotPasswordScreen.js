import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, StatusBar,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import { COLORS } from '../constants/colors';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1 = enter mobile, 2 = new password, 3 = success
  const [mobile, setMobile] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!mobile) return setError('Please enter your mobile number');
    setError('');
    setStep(2);
  };

  const handleReset = async () => {
    if (!newPassword) return setError('Please enter a new password');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, { mobile, newPassword });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.brand}>SellMix</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

        {step === 1 && (
          <>
            <Text style={s.title}>Forgot Password</Text>
            <Text style={s.sub}>Enter the mobile number linked to your account.</Text>

            <Text style={s.label}>Mobile Number</Text>
            <TextInput
              style={s.input}
              placeholder="0300 1234567"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              placeholderTextColor={COLORS.textMuted}
            />

            {!!error && <Text style={s.error}>⚠️ {error}</Text>}

            <TouchableOpacity style={s.btn} onPress={handleNext}>
              <Text style={s.btnTxt}>Continue</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={s.title}>Set New Password</Text>
            <Text style={s.sub}>Choose a new password for <Text style={{ fontWeight: '700' }}>{mobile}</Text>.</Text>

            <Text style={s.label}>New Password</Text>
            <View style={s.passRow}>
              <TextInput
                style={s.passInput}
                placeholder="At least 6 characters"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPass}
                placeholderTextColor={COLORS.textMuted}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
                <Text style={s.eye}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.label}>Confirm Password</Text>
            <TextInput
              style={s.input}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholderTextColor={COLORS.textMuted}
            />

            {!!error && <Text style={s.error}>⚠️ {error}</Text>}

            <TouchableOpacity style={s.btn} onPress={handleReset} disabled={loading}>
              {loading
                ? <ActivityIndicator color={COLORS.white} />
                : <Text style={s.btnTxt}>Reset Password</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={s.backLink} onPress={() => { setStep(1); setError(''); }}>
              <Text style={s.backLinkTxt}>← Back</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 3 && (
          <View style={s.successBox}>
            <Text style={s.successIcon}>✅</Text>
            <Text style={s.successTitle}>Password Reset!</Text>
            <Text style={s.successSub}>Your password has been updated successfully.</Text>
            <TouchableOpacity style={s.btn} onPress={() => navigation.replace('Login')}>
              <Text style={s.btnTxt}>Login Now</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.white },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, paddingHorizontal: 16,
    paddingTop: 50, paddingBottom: 12,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 20, color: '#fff', fontWeight: '700', lineHeight: 24 },
  brand: { fontSize: 22, fontWeight: '800', color: COLORS.primary },

  content: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },

  title: { fontSize: 22, fontWeight: '800', color: COLORS.black, marginBottom: 8 },
  sub: { fontSize: 14, color: COLORS.textLight, marginBottom: 28, lineHeight: 20 },

  label: { fontSize: 13, color: COLORS.text, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    padding: 14, fontSize: 15, color: COLORS.text,
    backgroundColor: COLORS.secondary, marginBottom: 20,
  },
  passRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    backgroundColor: COLORS.secondary, paddingHorizontal: 14, marginBottom: 20,
  },
  passInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: COLORS.text },
  eyeBtn: { padding: 6 },
  eye: { fontSize: 18 },

  error: { fontSize: 13, color: COLORS.error, backgroundColor: '#FFF3F3', padding: 12, borderRadius: 8, marginBottom: 16 },

  btn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  btnTxt: { color: COLORS.white, fontSize: 16, fontWeight: '700' },

  backLink: { alignItems: 'center', paddingVertical: 8 },
  backLinkTxt: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },

  successBox: { paddingTop: 40, alignItems: 'stretch' },
  successIcon: { fontSize: 56, marginBottom: 16, textAlign: 'center' },
  successTitle: { fontSize: 22, fontWeight: '800', color: COLORS.black, marginBottom: 8, textAlign: 'center' },
  successSub: { fontSize: 14, color: COLORS.textLight, marginBottom: 32, textAlign: 'center', lineHeight: 20 },
});
