import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

function Section({ title, children }) {
  return (
    <View style={s.section}>
      <Text style={s.sTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Item({ text }) {
  return (
    <View style={s.item}>
      <Text style={s.bullet}>•</Text>
      <Text style={s.itemTxt}>{text}</Text>
    </View>
  );
}

export default function PrivacyPolicyScreen({ navigation }) {
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
        <Text style={s.pageTitle}>Privacy Policy</Text>

        <Section title="Our Promise">
          <Text style={s.body}>
            SellMix is all about you — our customers, our community, and our partners. We understand
            that your privacy and personal information is extremely important, and we truly value the
            trust you place in us. Your data is safe and secure with us.
          </Text>
        </Section>

        <Section title="What We Collect">
          <Item text="Name" />
          <Item text="Address" />
          <Item text="Mobile Number" />
          <Item text="Order History" />
        </Section>

        <Section title="How We Use Your Information">
          <Item text="To process and deliver your orders" />
          <Item text="To improve your shopping experience" />
          <Item text="For safety and security" />
          <Item text="To contact you about your orders" />
          <Item text="To inform you about new products and offers" />
        </Section>

        <Section title="Security">
          <Item text="Access to your account is protected by a password you create and control." />
          <Item text="We use strong data encryption to protect your personal information." />
          <Item text="We regularly monitor our systems for possible vulnerabilities." />
          <Item text="We never share your personal information with third parties without your consent." />
        </Section>

        <View style={s.section}>
          <Text style={s.sTitle}>Contact</Text>
          <Text style={s.body}>📞  03178384342</Text>
          <Text style={s.body}>📍  Block #16, Govt Crescent Girls College Road, Chichawatni</Text>
        </View>

        <View style={{ height: 40 }} />
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

  content: { padding: 20 },
  pageTitle: { fontSize: 26, fontWeight: '900', color: COLORS.black, marginBottom: 20 },

  section: {
    marginBottom: 24, paddingBottom: 24,
    borderBottomWidth: 1, borderColor: '#f0f0f0',
  },
  sTitle: { fontSize: 16, fontWeight: '800', color: COLORS.black, marginBottom: 12 },
  body: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 6 },

  item: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  bullet: { fontSize: 14, color: COLORS.primary, fontWeight: '800', marginTop: 1 },
  itemTxt: { flex: 1, fontSize: 14, color: '#555', lineHeight: 20 },
});
