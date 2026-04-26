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

export default function TermsConditionsScreen({ navigation }) {
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
        <Text style={s.pageTitle}>Terms & Conditions</Text>
        <Text style={s.intro}>Please read these terms carefully before using our app.</Text>

        <Section title="1. Terms of Site">
          <Item text="By using SellMix you agree to these Terms & Conditions. We may update or change the app at any time without notice." />
          <Item text="When you register, you create a mobile number and password which you must keep confidential." />
          <Item text="We reserve the right to decline a new registration or suspend any account at any time." />
          <Item text="You must not misuse the app by introducing viruses or attempting to gain unauthorised access to our systems." />
        </Section>

        <Section title="2. Terms of Sale">
          <Item text="Delivery is available within Chichawatni city only." />
          <Item text="All prices shown are inclusive of any applicable tax." />
          <Item text="Goods are supplied for personal use only." />
          <Item text="Products are subject to availability. If unavailable, we will contact you to offer an alternative." />
          <Item text="SellMix reserves the right to cancel any order before delivery." />
          <Item text="If your items are delivered damaged, please contact us immediately at 03178384342." />
          <Item text="It is not possible to return perishable food items unless the goods are faulty." />
        </Section>

        <Section title="3. Delivery">
          <Item text="We deliver twice daily — Morning (10 AM – 1 PM) and Afternoon (4 PM – 7 PM)." />
          <Item text="Delivery fee: Rs. 150 flat within Chichawatni city." />
          <Item text="Someone aged 18 or over must be available to receive the delivery." />
          <Item text="Delivery times are subject to availability and may change without notice." />
        </Section>

        <Section title="4. Payment">
          <Item text="We currently accept Cash on Delivery only." />
          <Item text="Please have the exact amount ready at the time of delivery." />
        </Section>

        <Section title="5. Termination">
          <Text style={s.body}>
            These Terms are effective unless terminated by you or SellMix. We may terminate access
            immediately and without notice if you fail to comply with any term of these Terms of Use.
          </Text>
        </Section>

        <Section title="6. Changes">
          <Text style={s.body}>
            We reserve the right to amend these Terms at any time. Continued use of SellMix after
            any changes means you accept the new terms.
          </Text>
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
  pageTitle: { fontSize: 26, fontWeight: '900', color: COLORS.black, marginBottom: 6 },
  intro: { fontSize: 13, color: '#888', marginBottom: 20 },

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
