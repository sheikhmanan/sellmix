import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
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

export default function ReturnRefundScreen({ navigation }) {
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
        <Text style={s.pageTitle}>Return & Refund</Text>

        <Section title="Our Return & Refund Policy">
          <Text style={s.body}>
            If you discover a product is faulty or are not happy with it, please call{' '}
            <Text style={s.bold}>03178384342</Text> (9:00am – 9:00pm). If your product is faulty
            or damaged, we'll gladly refund it.
          </Text>
        </Section>

        <Section title="What If I Want to Return Something?">
          <Text style={s.body}>You are eligible for a refund or replacement if the item was:</Text>
          <Item text="(i) Incorrect" />
          <Item text="(ii) Damaged" />
          <Item text="(iii) Expired" />
          <Item text="(iv) Missing" />
          <Text style={[s.body, { marginTop: 12 }]}>
            Call <Text style={s.bold}>03178384342</Text> within{' '}
            <Text style={s.bold}>2 hours</Text> for perishable items (bread, eggs, butter, frozen)
            and <Text style={s.bold}>24 hours</Text> for all other items. We will refund or replace
            within <Text style={s.bold}>24 hours</Text> if verified.
          </Text>
          <Text style={[s.body, { marginTop: 8 }]}>
            We do not accept returns on perishable food items or items that cannot be re-sold for
            hygiene reasons once unwrapped.
          </Text>
        </Section>

        <Section title="What If My Order Is Not Complete?">
          <Text style={s.body}>
            If an item is missing when your delivery arrives, let your driver know immediately and
            your bill will be recalculated. If you notice after the driver leaves, call{' '}
            <Text style={s.bold}>03178384342</Text> within 24 hours.
          </Text>
        </Section>

        <Section title="How Long Will My Refund Take?">
          <Text style={s.body}>
            Our delivery rider will refund you as soon as he receives the item back from you.
          </Text>
        </Section>

        <Section title="What If My Refund Is Cancelled?">
          <Text style={s.body}>
            All refund requests are checked before processing. A refund may be cancelled if it
            hasn't met our returns criteria.
          </Text>
        </Section>

        <Section title="How Can I Make a Complaint?">
          <Text style={s.body}>
            Complaints and feedback are always welcome. Call us at{' '}
            <Text style={s.bold}>03178384342</Text> (9:00am – 9:00pm) or message us on WhatsApp.
            Our customer care team is always happy to help.
          </Text>
        </Section>

        <View style={s.contactCard}>
          <Text style={s.contactTitle}>Report an Issue</Text>
          <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL('tel:03178384342')}>
            <Text style={s.callBtnTxt}>📞  Call 03178384342</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.waBtn} onPress={() => Linking.openURL('whatsapp://send?phone=923178384342')}>
            <Text style={s.waBtnTxt}>💬  Chat on WhatsApp</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, borderBottomWidth: 1, borderColor: COLORS.border },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 20, color: '#fff', fontWeight: '700', lineHeight: 24 },
  brand: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  content: { padding: 20 },
  pageTitle: { fontSize: 24, fontWeight: '900', color: COLORS.black, marginBottom: 20 },
  section: { marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  sTitle: { fontSize: 15, fontWeight: '800', color: COLORS.black, marginBottom: 10 },
  body: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 6 },
  bold: { fontWeight: '700', color: COLORS.black },
  item: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  bullet: { fontSize: 14, color: COLORS.primary, fontWeight: '800' },
  itemTxt: { flex: 1, fontSize: 14, color: '#555', lineHeight: 20 },
  contactCard: { backgroundColor: COLORS.secondary, borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 8 },
  contactTitle: { fontSize: 15, fontWeight: '800', color: COLORS.black, marginBottom: 14 },
  callBtn: { backgroundColor: COLORS.primary, width: '100%', paddingVertical: 13, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  callBtnTxt: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  waBtn: { backgroundColor: '#25D366', width: '100%', paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  waBtnTxt: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});
