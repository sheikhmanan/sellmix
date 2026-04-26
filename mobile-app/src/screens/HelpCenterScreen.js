import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { COLORS } from '../constants/colors';

const SECTIONS = [
  {
    title: 'Technical',
    items: [
      {
        q: 'Accessibility',
        a: 'We endeavour to make our app accessible for everyone. If you experience any issues, please try updating the app or contact our support team.',
      },
      {
        q: 'Problems adding or removing items from cart',
        a: 'Try closing and reopening the app. If the problem continues, please contact support at 03178384342.',
      },
      {
        q: 'Why do I get a "failed login" message?',
        a: 'There may be a problem with your password. Tap "Forgot Password?" on the login screen and follow the steps to reset your password using your mobile number.',
      },
    ],
  },
  {
    title: 'Return & Refund',
    items: [
      {
        q: "What is SellMix's return and refund policy?",
        a: 'If you discover a product is faulty or you are unhappy with it, please call us at 03178384342 (9:00am – 9:00pm). If your product is faulty or damaged, we will gladly refund it.',
      },
      {
        q: 'What if I want to return something?',
        a: 'You are eligible for a refund or replacement if the item was: (i) Incorrect, (ii) Damaged, (iii) Expired, or (iv) Missing.\n\nCall 03178384342 within 2 hours for perishable items (bread, eggs, butter, frozen products) and 24 hours for all other items. We will send you a replacement or refund within 24 hours if verified.',
      },
      {
        q: 'What if my order is not complete?',
        a: 'If an item is missing when your delivery arrives, let your driver know immediately. If you notice after the driver has left, call us at 03178384342 within 24 hours.',
      },
      {
        q: 'How long will my refund take?',
        a: 'Our driver will refund you as soon as he receives the item back from you.',
      },
      {
        q: 'How can I make a complaint?',
        a: 'Call us at 03178384342 (9:00am – 9:00pm) or message us on WhatsApp. Our customer care team is always happy to help.',
      },
    ],
  },
  {
    title: 'Payment & Delivery',
    items: [
      {
        q: 'Do you charge for delivery?',
        a: 'Yes, we charge a flat delivery fee of Rs. 150 within Chichawatni city.',
      },
      {
        q: 'What are your delivery times?',
        a: 'We deliver twice daily in Chichawatni:\n\n• Morning Slot: 10:00 AM – 1:00 PM\n• Afternoon Slot: 4:00 PM – 7:00 PM\n\nDelivery is available 7 days a week.',
      },
      {
        q: 'Can I choose my delivery slot?',
        a: 'Yes! At the checkout, you can select a delivery slot of your choice — Morning or Afternoon.',
      },
      {
        q: "What if I'm not home when you deliver?",
        a: 'Your shopping will be taken back. Please call us at 03178384342 to arrange another delivery time.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We currently accept Cash on Delivery only. Please have the exact amount ready at the time of delivery.',
      },
    ],
  },
  {
    title: 'Order Status',
    items: [
      {
        q: 'Can I track my order?',
        a: 'Yes! Go to the "My Orders" section in your account to track your order status.',
      },
      {
        q: 'What are the order statuses?',
        a: 'Your order goes through these stages:\n\n1. Pending — order received\n2. Confirmed — we have accepted your order\n3. Preparing — being packed\n4. Out for Delivery — on the way\n5. Delivered — completed',
      },
    ],
  },
  {
    title: 'Cancellation',
    items: [
      {
        q: "What is SellMix's cancellation policy?",
        a: 'You can cancel your order at any time before it is confirmed. After confirmation, you cannot cancel unless the item is damaged or faulty.',
      },
      {
        q: 'How can I cancel my order?',
        a: 'Call us at 03178384342 or message us on WhatsApp before your order is confirmed.',
      },
      {
        q: 'Why was my order cancelled?',
        a: "We always try our best to deliver. However, on rare occasions — extreme weather, customer not home, or circumstances beyond our control — we may have to cancel. We will contact you if this happens.",
      },
    ],
  },
  {
    title: 'Availability',
    items: [
      {
        q: 'How do I check if something is in stock?',
        a: 'All products shown on the app are currently in stock. If a product is not visible, it may be temporarily unavailable.',
      },
      {
        q: 'How do I find products?',
        a: 'You can browse by category using the Categories tab, or use the Search tab to search by product name.',
      },
      {
        q: 'Product suggestions',
        a: 'If you cannot find a product you need, contact us at 03178384342 or via WhatsApp and suggest which products you would like us to stock.',
      },
    ],
  },
];

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={[s.item, open && s.itemOpen]}
      onPress={() => setOpen(!open)}
      activeOpacity={0.8}
    >
      <View style={s.qRow}>
        <Text style={s.qTxt}>{q}</Text>
        <Text style={s.chev}>{open ? '▲' : '▼'}</Text>
      </View>
      {open && (
        <Text style={s.aTxt}>
          {a}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function HelpCenterScreen({ navigation }) {
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
        <Text style={s.pageTitle}>Help Centre</Text>
        <Text style={s.subtitle}>Find answers to common questions about SellMix.</Text>

        {SECTIONS.map((sec) => (
          <View key={sec.title} style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>{sec.title}</Text>
            </View>
            {sec.items.map((item) => (
              <AccordionItem key={item.q} q={item.q} a={item.a} />
            ))}
          </View>
        ))}

        <View style={s.contactCard}>
          <Text style={s.contactTitle}>Still need help?</Text>
          <Text style={s.contactSub}>Available 9:00 AM – 9:00 PM, 7 days a week.</Text>
          <TouchableOpacity
            style={s.callBtn}
            onPress={() => Linking.openURL('tel:03178384342')}
          >
            <Text style={s.callBtnTxt}>📞  Call 03178384342</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.waBtn}
            onPress={() => Linking.openURL('whatsapp://send?phone=923178384342&text=Hi SellMix, I need help!')}
          >
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

  content: { padding: 16 },
  pageTitle: { fontSize: 24, fontWeight: '900', color: COLORS.black, marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 20 },

  section: { marginBottom: 16 },
  sectionHeader: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 11, marginBottom: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.white },

  item: {
    backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderColor: '#f0f0f0',
  },
  itemOpen: { backgroundColor: '#fafeff' },
  qRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  qTxt: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1a1a1a', lineHeight: 20 },
  chev: { fontSize: 10, color: '#aaa', marginTop: 4 },
  aTxt: { fontSize: 13, color: '#555', lineHeight: 20, marginTop: 10 },

  contactCard: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 20,
    marginTop: 8, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.primary + '30',
  },
  contactTitle: { fontSize: 16, fontWeight: '800', color: COLORS.black, marginBottom: 4 },
  contactSub: { fontSize: 12, color: '#888', marginBottom: 16, textAlign: 'center' },
  callBtn: {
    backgroundColor: COLORS.primary, width: '100%',
    paddingVertical: 13, borderRadius: 10, alignItems: 'center', marginBottom: 10,
  },
  callBtnTxt: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  waBtn: {
    backgroundColor: '#25D366', width: '100%',
    paddingVertical: 13, borderRadius: 10, alignItems: 'center',
  },
  waBtnTxt: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});
