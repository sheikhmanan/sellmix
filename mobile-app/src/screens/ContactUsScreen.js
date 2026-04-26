import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { COLORS } from '../constants/colors';

export default function ContactUsScreen({ navigation }) {
  return (
    <View style={s.root}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.brand}>SellMix</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.pageTitle}>Contact Us</Text>
        <Text style={s.subtitle}>Get in touch — we're always happy to help.</Text>

        {/* Contact Action Cards */}
        <TouchableOpacity style={s.actionCard} onPress={() => Linking.openURL('tel:03178384342')}>
          <Text style={s.actionIcon}>📞</Text>
          <View style={s.actionInfo}>
            <Text style={s.actionLabel}>Call Us</Text>
            <Text style={s.actionValue}>03178384342</Text>
            <Text style={s.actionNote}>9:00 AM – 9:00 PM, 7 days</Text>
          </View>
          <Text style={s.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.actionCard, s.waCard]}
          onPress={() => Linking.openURL('whatsapp://send?phone=923178384342&text=Hi SellMix!')}
        >
          <Text style={s.actionIcon}>💬</Text>
          <View style={s.actionInfo}>
            <Text style={[s.actionLabel, { color: '#25D366' }]}>WhatsApp</Text>
            <Text style={s.actionValue}>03178384342</Text>
            <Text style={s.actionNote}>Quick replies on WhatsApp</Text>
          </View>
          <Text style={s.actionArrow}>›</Text>
        </TouchableOpacity>

        <View style={[s.actionCard, { opacity: 1 }]}>
          <Text style={s.actionIcon}>📍</Text>
          <View style={s.actionInfo}>
            <Text style={s.actionLabel}>Our Location</Text>
            <Text style={s.actionValue}>Chichawatni</Text>
            <Text style={s.actionNote}>Punjab, Pakistan</Text>
          </View>
        </View>

        {/* Info Block */}
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>GET IN TOUCH WITH US</Text>
          <Text style={s.infoSub}>
            If you need any help, please contact us via phone or WhatsApp. We will get back to you
            as soon as possible.
          </Text>
          <View style={s.infoRow}><Text style={s.infoKey}>📞 Mobile:</Text><Text style={s.infoVal}>03178384342</Text></View>
          <View style={s.infoRow}><Text style={s.infoKey}>🕐 Hours:</Text><Text style={s.infoVal}>Mon – Sun, 9:00am – 9:00pm</Text></View>
          <View style={s.infoRow}><Text style={s.infoKey}>📍 Address:</Text><Text style={s.infoVal}>Block #16, Govt Crescent Girls College Road, Chichawatni</Text></View>
          <View style={s.infoRow}><Text style={s.infoKey}>🚚 Delivery:</Text><Text style={s.infoVal}>Chichawatni city only • Rs. 150 flat</Text></View>
        </View>

        {/* Delivery Slots */}
        <View style={s.slotsCard}>
          <Text style={s.slotsTitle}>Delivery Slots</Text>
          <View style={s.slotsRow}>
            <View style={s.slotBox}>
              <Text style={s.slotIcon}>🌅</Text>
              <Text style={s.slotName}>Morning</Text>
              <Text style={s.slotTime}>10:00 AM – 1:00 PM</Text>
            </View>
            <View style={s.slotBox}>
              <Text style={s.slotIcon}>🌆</Text>
              <Text style={s.slotName}>Afternoon</Text>
              <Text style={s.slotTime}>4:00 PM – 7:00 PM</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, borderBottomWidth: 1, borderColor: COLORS.border },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 20, color: '#fff', fontWeight: '700', lineHeight: 24 },
  brand: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  content: { padding: 16 },
  pageTitle: { fontSize: 24, fontWeight: '900', color: COLORS.black, marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 20 },

  actionCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  waCard: { borderWidth: 1.5, borderColor: '#25D36630' },
  actionIcon: { fontSize: 30 },
  actionInfo: { flex: 1 },
  actionLabel: { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
  actionValue: { fontSize: 16, fontWeight: '800', color: COLORS.black },
  actionNote: { fontSize: 12, color: '#888', marginTop: 2 },
  actionArrow: { fontSize: 24, color: COLORS.textMuted },

  infoCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 20, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  infoTitle: { fontSize: 13, fontWeight: '800', color: '#1a1a1a', letterSpacing: 0.5, marginBottom: 8 },
  infoSub: { fontSize: 13, color: '#888', lineHeight: 20, marginBottom: 16 },
  infoRow: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
  infoKey: { fontSize: 13, fontWeight: '700', color: '#333', width: 100 },
  infoVal: { flex: 1, fontSize: 13, color: '#555', lineHeight: 18 },

  slotsCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  slotsTitle: { fontSize: 16, fontWeight: '800', color: COLORS.black, marginBottom: 16, textAlign: 'center' },
  slotsRow: { flexDirection: 'row', gap: 12 },
  slotBox: { flex: 1, backgroundColor: '#f5f0ff', borderRadius: 12, padding: 16, alignItems: 'center', borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  slotIcon: { fontSize: 26, marginBottom: 6 },
  slotName: { fontSize: 13, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
  slotTime: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
});
