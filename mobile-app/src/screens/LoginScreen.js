import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, StatusBar, Dimensions, Image,
} from 'react-native';

const LOGIN_IMG = 'https://res.cloudinary.com/dnhuilgay/image/upload/f_auto,q_auto,w_800/ChatGPT_Image_Apr_7_2026_03_22_38_PM_hp4voo';
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

      {/* Hero header — image */}
      <Image source={{ uri: LOGIN_IMG }} style={s.hero} resizeMode="cover" />

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

        <TouchableOpacity style={s.forgotRow} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={s.forgot}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.loginBtn} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color={COLORS.white} />
            : <Text style={s.loginBtnText}>Login to SellMix</Text>
          }
        </TouchableOpacity>

        <Text style={s.registerRow}>
          Don't have an account?{'  '}
          <Text style={s.link} onPress={() => navigation.navigate('SignUp')}>Register</Text>
          {'  or  '}
          <Text style={s.link} onPress={() => navigation.replace('Main')}>Skip</Text>
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.white },

  // Hero section
  hero: { width: '100%', height: height * 0.30 },

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

  registerRow: { fontSize: 14, color: COLORS.text, textAlign: 'center', marginTop: 8 },
  link: { color: COLORS.primary, fontWeight: '600' },
});
