import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Linking, Image,
} from 'react-native';
import { ordersAPI, fixImageUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';
import { MAX_RADIUS_MILES } from '../utils/deliveryZone';

const ADMIN_WHATSAPP = '923178384342';

const SLOTS = [
  { key: '10:00 AM – 1:00 PM', label: '🌅 Morning', time: '10:00 AM – 1:00 PM', cutoffHour: 10 },
  { key: '4:00 PM – 7:00 PM',  label: '🌆 Afternoon', time: '4:00 PM – 7:00 PM',  cutoffHour: 16 },
];

function buildDates() {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const isToday = i === 0;
    const label = isToday ? 'Today'
      : i === 1 ? 'Tomorrow'
      : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return { label, d, isToday };
  });
}

function isSlotClosed(dateEntry, slot) {
  if (!dateEntry.isToday) return false;
  return new Date().getHours() >= slot.cutoffHour;
}

const PAYMENT_METHODS = [
  { key: 'COD', label: 'Cash on Delivery (COD)', sub: 'Pay when your groceries arrive at your door.', icon: '💵' },
];

export default function CheckoutScreen({ route, navigation }) {
  const { subtotal, discount = 0, deliveryFee = 150, total, promoCode = '' } = route.params;
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState({
    customerName: user?.name || '',
    whatsapp: user?.mobile || '',
    address: user?.address || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const dates = buildDates();

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const placeOrder = async () => {
    if (!form.customerName || !form.whatsapp || !form.address) {
      return Alert.alert('Error', 'Please fill all delivery details');
    }
    if (!selectedSlot) {
      return Alert.alert('Error', 'Please select a delivery time slot');
    }

    setLoading(true);
    try {
      const orderData = {
        user: user?._id,
        customerName: form.customerName,
        whatsapp: form.whatsapp,
        address: form.address,
        items: items.map((i) => ({
          product: i._id,
          name: i.name,
          price: i.discountPrice || i.price,
          quantity: i.quantity,
          weight: i.selectedWeight,
          image: i.images?.[0] || '',
        })),
        subtotal, deliveryFee, discount, total,
        paymentMethod, promoCode,
        deliverySlot: { date: selectedDate, slot: selectedSlot },
      };

      const res = await ordersAPI.place(orderData);
      clearCart();

      const orderSummary = items.map((i) =>
        `• ${i.name}${i.selectedWeight ? ` (${i.selectedWeight})` : ''} x${i.quantity} = Rs.${((i.discountPrice || i.price) * i.quantity).toLocaleString()}`
      ).join('\n');

      const msg =
        `🛒 *New SellMix Order — #${res.data.orderId}*\n` +
        `━━━━━━━━━━━━━━\n` +
        `👤 Name: ${form.customerName}\n` +
        `📱 WhatsApp: ${form.whatsapp}\n` +
        `📍 Address: ${form.address}\n` +
        `━━━━━━━━━━━━━━\n` +
        `${orderSummary}\n` +
        `━━━━━━━━━━━━━━\n` +
        `💰 Total: *Rs. ${total.toLocaleString()}*\n` +
        `💳 Payment: ${paymentMethod}\n` +
        `🕐 Delivery: ${selectedDate} | ${selectedSlot}\n` +
        `📦 Deliver to Chichawatni`;

      const waUrl = `whatsapp://send?phone=${ADMIN_WHATSAPP}&text=${encodeURIComponent(msg)}`;

      // Replace CheckoutScreen immediately so user can't accidentally place a second order
      navigation.replace('OrderTracking', { orderId: res.data.orderId });

      Alert.alert(
        '✅ Order Placed!',
        `Order #${res.data.orderId} confirmed!\n\nTotal: Rs. ${total.toLocaleString()}\n\nConfirm your order on WhatsApp?`,
        [
          {
            text: 'Confirm on WhatsApp',
            onPress: () => Linking.openURL(waUrl).catch(() =>
              Alert.alert('WhatsApp Not Found', 'Please install WhatsApp to confirm.')
            ),
          },
          { text: 'Done' },
        ]
      );
    } catch (err) {
      Alert.alert('Order Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      {/* Delivery Zone Notice */}
      <View style={s.zoneBanner}>
        <Text style={s.zoneText}>📍 Delivering within {MAX_RADIUS_MILES} miles of Chichawatni only</Text>
      </View>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>Secure Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Progress Indicator */}
      <View style={s.progressBar}>
        {[0, 1, 2].map((i) => (
          <React.Fragment key={i}>
            <View style={[s.progressDot, i <= 1 && s.progressDotActive]} />
            {i < 2 && <View style={[s.progressLine, i === 0 && s.progressLineActive]} />}
          </React.Fragment>
        ))}
      </View>

      {/* Cart Items */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Cart Items ({items.length})</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.editTxt}>Edit</Text>
          </TouchableOpacity>
        </View>
        {items.map((item) => (
          <View key={`${item._id}-${item.selectedWeight}`} style={s.orderItem}>
            <View style={s.orderImgBox}>
              {item.images?.[0]
                ? <Image source={{ uri: fixImageUrl(item.images[0]) }} style={s.orderImg} />
                : <Text style={{ fontSize: 20 }}>🛒</Text>}
            </View>
            <View style={s.orderInfo}>
              <Text style={s.orderName} numberOfLines={1}>{item.name}</Text>
              {item.selectedWeight && <Text style={s.orderSub}>{item.selectedWeight}</Text>}
              <Text style={s.orderQty}>Qty: {item.quantity}</Text>
            </View>
            <Text style={s.orderPrice}>Rs. {((item.discountPrice || item.price) * item.quantity).toLocaleString()}</Text>
          </View>
        ))}
        <View style={s.subtotalRow}>
          <Text style={s.subtotalLabel}>Cart Subtotal</Text>
          <Text style={s.subtotalVal}>Rs. {subtotal.toLocaleString()}</Text>
        </View>
      </View>

      {/* Delivery Details */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>📍 Delivery in Chichawatni</Text>

        <Text style={s.fieldLabel}>FULL NAME</Text>
        <TextInput
          style={s.input}
          placeholder="e.g. Muhammad Ahmed"
          value={form.customerName}
          onChangeText={(v) => set('customerName', v)}
          placeholderTextColor={COLORS.textMuted}
        />

        <Text style={s.fieldLabel}>WHATSAPP / PHONE NUMBER</Text>
        <TextInput
          style={s.input}
          placeholder="+92 300 1234567"
          value={form.whatsapp}
          onChangeText={(v) => set('whatsapp', v)}
          keyboardType="phone-pad"
          placeholderTextColor={COLORS.textMuted}
        />

        <Text style={s.fieldLabel}>DETAILED ADDRESS & LANDMARK</Text>
        <TextInput
          style={[s.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder={'House #, Street, Block, or Nearby Landmark\n(e.g. Near Rai Ali Nawaz Hospital)'}
          value={form.address}
          onChangeText={(v) => set('address', v)}
          multiline
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      {/* Delivery Slot */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>🕐 Delivery Time Slot</Text>
        {dates.map((dt) => (
          <View key={dt.label}>
            <Text style={s.dateLabel}>{dt.label}</Text>
            <View style={s.slotRow}>
              {SLOTS.map((slot) => {
                const closed = isSlotClosed(dt, slot);
                const chosen = selectedDate === dt.label && selectedSlot === slot.key;
                if (closed) return (
                  <View key={slot.key} style={s.slotClosed}>
                    <Text style={s.slotClosedTxt}>{slot.label}</Text>
                    <Text style={s.slotClosedSub}>Closed</Text>
                  </View>
                );
                return (
                  <TouchableOpacity
                    key={slot.key}
                    style={[s.slotBtn, chosen && s.slotBtnActive]}
                    onPress={() => { setSelectedDate(dt.label); setSelectedSlot(slot.key); }}
                  >
                    <Text style={[s.slotBtnLabel, chosen && s.slotBtnLabelActive]}>{slot.label}</Text>
                    <Text style={[s.slotBtnTime, chosen && s.slotBtnLabelActive]}>{slot.time}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </View>

      {/* Payment Method */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>💳 Payment Method</Text>
        {PAYMENT_METHODS.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[s.payOption, paymentMethod === m.key && s.payOptionActive]}
            onPress={() => setPaymentMethod(m.key)}
          >
            <View style={{ flex: 1 }}>
              <Text style={s.payLabel}>{m.icon}  {m.label}</Text>
              <Text style={s.paySub}>{m.sub}</Text>
            </View>
            <View style={[s.radio, paymentMethod === m.key && s.radioActive]}>
              {paymentMethod === m.key && <View style={s.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Total */}
      <View style={s.totalSection}>
        <View style={s.totalHeaderRow}>
          <Text style={s.totalLabel}>Total Amount</Text>
          <Text style={s.deliveryNote}>Delivery Fee: Rs. {deliveryFee}</Text>
        </View>
        <Text style={s.totalAmt}>Rs. {total.toLocaleString()}</Text>
      </View>

      {/* Place Order Button */}
      <TouchableOpacity style={s.placeBtn} onPress={placeOrder} disabled={loading}>
        {loading
          ? <ActivityIndicator color={COLORS.white} />
          : <Text style={s.placeBtnTxt}>Place Order</Text>
        }
      </TouchableOpacity>

      <Text style={s.disclaimer}>By placing order, you agree to SellMix Terms of Service</Text>
      <View style={{ height: 28 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: COLORS.background },
  container: { paddingBottom: 24 },
  zoneBanner: { backgroundColor: '#e8f4fd', paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#bee3f8' },
  zoneText: { fontSize: 13, color: COLORS.primary, fontWeight: '600', textAlign: 'center' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, paddingHorizontal: 16, paddingTop: 50, paddingBottom: 14,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  back: { fontSize: 20, color: '#fff', fontWeight: '700', lineHeight: 24 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },

  // Progress
  progressBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, backgroundColor: COLORS.white, marginBottom: 1,
  },
  progressDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.border,
  },
  progressDotActive: { backgroundColor: COLORS.primary },
  progressLine: { width: 60, height: 3, backgroundColor: COLORS.border, marginHorizontal: 4 },
  progressLineActive: { backgroundColor: COLORS.primary },

  // Section
  section: { backgroundColor: COLORS.white, margin: 12, borderRadius: 16, padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  editTxt: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },

  // Order item row
  orderItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderColor: COLORS.lightGrey,
  },
  orderImgBox: {
    width: 46, height: 46, borderRadius: 8, backgroundColor: COLORS.lightGrey,
    alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden',
  },
  orderImg: { width: 46, height: 46, resizeMode: 'cover' },
  orderInfo: { flex: 1 },
  orderName: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  orderSub: { fontSize: 11, color: COLORS.textLight, marginBottom: 2 },
  orderQty: { fontSize: 12, color: COLORS.textLight },
  orderPrice: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  // Subtotal
  subtotalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: COLORS.border,
  },
  subtotalLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  subtotalVal: { fontSize: 15, fontWeight: '800', color: COLORS.text },

  // Fields
  fieldLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1, marginBottom: 8, marginTop: 14 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    padding: 13, fontSize: 14, color: COLORS.text, backgroundColor: COLORS.secondary,
  },

  // Slot picker
  dateLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, marginTop: 12, marginBottom: 6, letterSpacing: 0.5 },
  slotRow: { flexDirection: 'row', gap: 10 },
  slotBtn: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10,
    padding: 10, alignItems: 'center',
  },
  slotBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '12' },
  slotBtnLabel: { fontSize: 13, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  slotBtnTime: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  slotBtnLabelActive: { color: COLORS.primary },
  slotClosed: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10,
    padding: 10, alignItems: 'center', backgroundColor: '#f5f5f5',
  },
  slotClosedTxt: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  slotClosedSub: { fontSize: 11, color: '#aaa', marginTop: 2 },

  // Payment
  payOption: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 14, marginBottom: 10,
  },
  payOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '08' },
  payLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  paySub: { fontSize: 12, color: COLORS.textLight },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },

  // Total section
  totalSection: { backgroundColor: COLORS.white, marginHorizontal: 12, borderRadius: 16, padding: 16, marginBottom: 4 },
  totalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  deliveryNote: { fontSize: 12, color: COLORS.textLight },
  totalAmt: { fontSize: 28, fontWeight: '900', color: COLORS.primary },

  // Place order
  placeBtn: {
    backgroundColor: COLORS.primary, marginHorizontal: 12, marginTop: 12,
    borderRadius: 14, paddingVertical: 17, alignItems: 'center',
  },
  placeBtnTxt: { color: COLORS.white, fontWeight: '700', fontSize: 17 },
  disclaimer: { textAlign: 'center', fontSize: 12, color: COLORS.textMuted, marginTop: 12 },
});
