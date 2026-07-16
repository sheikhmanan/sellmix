import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Share, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const handleRateApp = () => {
    Linking.openURL('market://details?id=com.sellmix.SellMix').catch(() =>
      Linking.openURL('https://play.google.com/store/apps/details?id=com.sellmix.SellMix')
    );
  };

  const handleShareApp = () => {
    Share.share({
      message: 'Shop groceries & daily essentials with SellMix! Free delivery in Chichawatni. Download now: https://play.google.com/store/apps/details?id=com.sellmix.SellMix',
      title: 'SellMix - Daily Essentials',
    });
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://sellmix.pk/privacy');
  };

  const handleTerms = () => {
    Alert.alert(
      'Terms & Conditions',
      '1. SellMix delivers within Chichawatni city only.\n\n2. Orders must meet a minimum value of Rs. 999.\n\n3. Delivery slots: Morning (10AM–1PM) and Afternoon (4PM–7PM).\n\n4. Orders once placed cannot be cancelled without contacting support.\n\n5. Prices are subject to change without prior notice.\n\n6. SellMix reserves the right to cancel any order due to stock unavailability.',
      [{ text: 'OK' }]
    );
  };

  const items = [
    { icon: '🔒', label: 'Privacy Policy', onPress: handlePrivacyPolicy },
    { icon: '📋', label: 'Terms & Conditions', onPress: handleTerms },
    { icon: '⭐', label: 'Rate the App', onPress: handleRateApp },
    { icon: '📤', label: 'Share the App', onPress: handleShareApp },
  ];

  return (
    <View style={[s.root, { paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={[s.header, { paddingTop: Math.max(50, insets.top + 10) }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <View style={{ width: 11, height: 11, borderLeftWidth: 2.5, borderBottomWidth: 2.5, borderColor: '#fff', transform: [{ rotate: '45deg' }], marginLeft: 5 }} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* App section */}
        <Text style={s.sectionLabel}>APP</Text>
        <View style={s.card}>
          {items.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[s.row, i < items.length - 1 && s.rowBorder]}
              onPress={item.onPress}
            >
              <View style={s.iconBox}>
                <Text style={s.icon}>{item.icon}</Text>
              </View>
              <Text style={s.label}>{item.label}</Text>
              <Text style={s.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* App info */}
        <View style={s.infoBox}>
          <Text style={s.appName}>SellMix - Daily Essentials</Text>
          <Text style={s.appVersion}>Version 0.10</Text>
          <Text style={s.appCity}>Serving Chichawatni, Pakistan</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, paddingHorizontal: 16,
    paddingBottom: 14, borderBottomWidth: 1, borderColor: '#eee',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  content: { padding: 16 },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: '#aaa',
    letterSpacing: 1.2, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase',
  },
  card: {
    backgroundColor: COLORS.white, borderRadius: 16,
    overflow: 'hidden', marginBottom: 20,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 15,
  },
  rowBorder: { borderBottomWidth: 1, borderColor: '#f0f0f0' },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#f0f5ff', alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  icon: { fontSize: 18 },
  label: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
  arrow: { fontSize: 22, color: '#bbb' },
  infoBox: { alignItems: 'center', paddingVertical: 20 },
  appName: { fontSize: 14, fontWeight: '700', color: '#555', marginBottom: 4 },
  appVersion: { fontSize: 13, color: '#aaa', marginBottom: 4 },
  appCity: { fontSize: 12, color: '#bbb' },
});
