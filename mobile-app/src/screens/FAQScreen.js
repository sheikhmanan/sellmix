import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { COLORS } from '../constants/colors';

const FAQS = [
  { q: 'What is SellMix?', a: "SellMix is Chichawatni's most convenient online grocery store. Order fresh groceries, recipe mixes, cooking oil, tea, rice, and hundreds of daily-use products directly from your phone." },
  { q: 'What kind of products do you sell?', a: 'We sell grocery essentials, recipe mixes (masala), cooking oil, rice & grains, tea, biscuits, dairy, and much more — all sourced fresh for Chichawatni households.' },
  { q: 'Do you deliver to my location?', a: 'We currently deliver within Chichawatni city only. Call us at 03178384342 to confirm if we deliver to your area.' },
  { q: 'Do you charge any taxes over the rates shown?', a: 'No. The prices shown are the final prices. We do not charge anything over and above the rates shown.' },
  { q: 'Is there a minimum order value?', a: 'There is no minimum order requirement. You can order any amount.' },
  { q: 'What is the delivery fee?', a: 'We charge a flat delivery fee of Rs. 150 within Chichawatni city.' },
  { q: 'How can I change my order before confirmation?', a: 'You can edit your cart freely before placing your order. Once placed, please call 03178384342 immediately to request changes before it is confirmed.' },
  { q: 'What payment methods do you accept?', a: 'We currently accept Cash on Delivery only. Please have the exact amount ready when our rider arrives.' },
  { q: 'What if I have a complaint?', a: 'Call us at 03178384342 (9:00am – 9:00pm) or message us on WhatsApp. Our customer care team is always happy to help.' },
  { q: 'Can I track my order?', a: 'Yes! Go to "My Orders" in your account to track your order status in real time.' },
  { q: 'How do I find products?', a: 'Browse by category using the Categories tab, or use the Search tab to find products by name.' },
];

function Item({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity style={[s.item, open && s.itemOpen]} onPress={() => setOpen(!open)} activeOpacity={0.85}>
      <View style={s.qRow}>
        <Text style={s.qTxt}>{q}</Text>
        <Text style={s.chev}>{open ? '▲' : '▼'}</Text>
      </View>
      {open && <Text style={s.aTxt}>{a}</Text>}
    </TouchableOpacity>
  );
}

export default function FAQScreen({ navigation }) {
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
        <Text style={s.pageTitle}>Frequently Asked Questions</Text>
        <Text style={s.subtitle}>Everything you need to know about SellMix.</Text>
        <View style={s.list}>
          {FAQS.map((f) => <Item key={f.q} q={f.q} a={f.a} />)}
        </View>
        <View style={s.contactCard}>
          <Text style={s.contactTitle}>Didn't find your answer?</Text>
          <Text style={s.contactSub}>Available 9:00 AM – 9:00 PM, 7 days a week.</Text>
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
  root: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, borderBottomWidth: 1, borderColor: COLORS.border },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 20, color: '#fff', fontWeight: '700', lineHeight: 24 },
  brand: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  content: { padding: 16 },
  pageTitle: { fontSize: 22, fontWeight: '900', color: COLORS.black, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 20 },
  list: { backgroundColor: COLORS.white, borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
  item: { borderBottomWidth: 1, borderColor: '#f0f0f0', paddingHorizontal: 16, paddingVertical: 14 },
  itemOpen: { backgroundColor: '#fafeff' },
  qRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  qTxt: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1a1a1a', lineHeight: 20 },
  chev: { fontSize: 10, color: '#aaa', marginTop: 3 },
  aTxt: { fontSize: 13, color: '#555', lineHeight: 20, marginTop: 10 },
  contactCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.primary + '30' },
  contactTitle: { fontSize: 16, fontWeight: '800', color: COLORS.black, marginBottom: 4 },
  contactSub: { fontSize: 12, color: '#888', marginBottom: 16, textAlign: 'center' },
  callBtn: { backgroundColor: COLORS.primary, width: '100%', paddingVertical: 13, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  callBtnTxt: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  waBtn: { backgroundColor: '#25D366', width: '100%', paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  waBtnTxt: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});
