import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { Audio } from 'expo-av';
import { ordersAPI } from '../services/api';
import { COLORS } from '../constants/colors';

// Different sound URLs per status transition
const STATUS_SOUNDS = {
  packed:           'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  out_for_delivery: 'https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3',
  delivered:        'https://assets.mixkit.co/active_storage/sfx/2866/2866-preview.mp3',
  cancelled:        'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3',
};

async function playStatusSound(status) {
  try {
    const url = STATUS_SOUNDS[status];
    if (!url) return;
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync({ uri: url });
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((s) => {
      if (s.didJustFinish) sound.unloadAsync();
    });
  } catch (_) {}
}

const STEPS = [
  { key: 'placed', label: 'Order\nPlaced', icon: '✅' },
  { key: 'packed', label: 'Packed', icon: '📦' },
  { key: 'out_for_delivery', label: 'Out for\nDelivery', icon: '🛵' },
  { key: 'delivered', label: 'Delivered', icon: '🏠' },
];
const STATUS_INDEX = { placed: 0, packed: 1, out_for_delivery: 2, delivered: 3 };

const STATUS_LABEL = {
  placed: 'Order Placed',
  packed: 'Packed',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderTrackingScreen({ route, navigation }) {
  const initialId = route.params?.orderId || '';
  const [orderId, setOrderId] = useState(initialId);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!initialId);
  const prevStatusRef = useRef(null);
  const pollRef = useRef(null);
  const trackingIdRef = useRef('');

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const pollStatus = useCallback(async () => {
    const id = trackingIdRef.current;
    if (!id) return;
    try {
      const res = await ordersAPI.track(id);
      const newStatus = res.data?.status;
      setOrder(res.data);
      if (prevStatusRef.current && newStatus && newStatus !== prevStatusRef.current) {
        await playStatusSound(newStatus);
        prevStatusRef.current = newStatus;
        if (newStatus === 'delivered') stopPolling(); // stop once delivered
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (initialId) trackOrder(initialId);
    return () => stopPolling();
  }, []);

  const trackOrder = async (id = orderId) => {
    const trimmed = id.trim();
    if (!trimmed) return Alert.alert('Error', 'Please enter an Order ID');
    stopPolling();
    setLoading(true);
    try {
      const res = await ordersAPI.track(trimmed);
      setOrder(res.data);
      prevStatusRef.current = res.data?.status;
      trackingIdRef.current = trimmed;
      if (res.data?.status !== 'delivered' && res.data?.status !== 'cancelled') {
        pollRef.current = setInterval(pollStatus, 15000);
      }
    } catch {
      Alert.alert('Not Found', 'Order not found. Please check the Order ID.');
      setOrder(null);
    }
    setLoading(false);
  };

  const currentStep = order ? (STATUS_INDEX[order.status] ?? 0) : -1;

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.brand}>SellMix Tracking</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Title */}
      <Text style={s.heading}>Track your delivery</Text>
      <Text style={s.subTxt}>
        Enter your Order ID to see live updates from our Chichawatni store.
      </Text>

      {/* Input */}
      <TextInput
        style={s.input}
        placeholder="Enter Order ID (e.g. SLX-9921)"
        value={orderId}
        onChangeText={setOrderId}
        placeholderTextColor={COLORS.textMuted}
        autoCapitalize="characters"
      />

      <TouchableOpacity style={s.trackBtn} onPress={() => trackOrder()}>
        <Text style={s.trackBtnTxt}>Track Order</Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      )}

      {order && !loading && (
        <View style={s.resultCard}>
          {/* Status Header */}
          <View style={s.statusRow}>
            <View>
              <Text style={s.statusLabel}>CURRENT STATUS</Text>
              <Text style={s.statusTxt}>{STATUS_LABEL[order.status] || order.status}</Text>
            </View>
            <Text style={s.statusIcon}>{STEPS[currentStep]?.icon || '📦'}</Text>
          </View>

          {/* Progress Steps */}
          <View style={s.stepsRow}>
            {STEPS.map((step, i) => {
              const done = i <= currentStep;
              return (
                <View key={step.key} style={s.stepItem}>
                  <View style={s.stepLineWrap}>
                    {i > 0 && <View style={[s.stepLine, done && s.stepLineDone]} />}
                    <View style={[s.stepCircle, done && s.stepCircleDone]}>
                      {done
                        ? <Text style={s.checkMark}>✓</Text>
                        : <View style={s.stepDot} />}
                    </View>
                    {i < STEPS.length - 1 && <View style={[s.stepLine, i < currentStep && s.stepLineDone]} />}
                  </View>
                  <Text style={[s.stepLabel, done && s.stepLabelDone]}>{step.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Info Cards */}
          <View style={s.infoRow}>
            <View style={s.infoCard}>
              <Text style={s.infoLabel}>Delivery Slot</Text>
              <Text style={s.infoVal}>
                {order.deliverySlot?.slot
                  ? `${order.deliverySlot.date} · ${order.deliverySlot.slot}`
                  : 'Scheduled'}
              </Text>
            </View>
            <View style={s.infoCard}>
              <Text style={s.infoLabel}>Delivery Area</Text>
              <Text style={s.infoVal}>Chichawatni</Text>
            </View>
          </View>

          {/* Order Details */}
          <View style={s.detailsBox}>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>🔢 Order ID</Text>
              <Text style={s.detailVal}>{order.orderId}</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>💳 Payment</Text>
              <Text style={s.detailVal}>{order.paymentMethod}</Text>
            </View>
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>💰 Total</Text>
              <Text style={[s.detailVal, { color: COLORS.primary }]}>Rs. {order.total?.toLocaleString()}</Text>
            </View>
            <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={s.detailLabel}>📍 Address</Text>
              <Text style={[s.detailVal, { flex: 1, textAlign: 'right' }]}>{order.address}</Text>
            </View>
          </View>

          {/* Support */}
          <View style={s.supportBox}>
            <View style={{ flex: 1 }}>
              <Text style={s.supportTitle}>Need help?</Text>
              <Text style={s.supportSub}>Contact our Chichawatni support team.</Text>
            </View>
            <TouchableOpacity
              style={s.supportBtn}
              onPress={() => Linking.openURL('whatsapp://send?phone=923178384342&text=Hi, I need help with my order.')}
            >
              <Text style={s.supportBtnTxt}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 44, marginBottom: 22,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 20, color: '#fff', fontWeight: '700', lineHeight: 24 },
  brand: { fontSize: 26, fontWeight: '800', color: COLORS.text, letterSpacing: 0.5 },

  // Title
  heading: { fontSize: 24, fontWeight: '800', color: COLORS.black, marginBottom: 8 },
  subTxt: { fontSize: 14, color: COLORS.textLight, lineHeight: 22, marginBottom: 20 },

  // Input
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14,
    padding: 14, fontSize: 15, backgroundColor: COLORS.white, marginBottom: 12, color: COLORS.text,
  },
  trackBtn: {
    backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 20,
  },
  trackBtnTxt: { color: COLORS.white, fontWeight: '700', fontSize: 16 },

  // Result Card
  resultCard: { backgroundColor: COLORS.white, borderRadius: 18, padding: 20, gap: 16 },

  // Status
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '700', letterSpacing: 1.2, marginBottom: 4 },
  statusTxt: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  statusIcon: { fontSize: 36 },

  // Steps
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  stepItem: { flex: 1, alignItems: 'center' },
  stepLineWrap: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center' },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.lightGrey },
  stepLineDone: { backgroundColor: COLORS.primary },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.lightGrey, alignItems: 'center', justifyContent: 'center',
  },
  stepCircleDone: { backgroundColor: COLORS.primary },
  checkMark: { fontSize: 12, color: COLORS.white, fontWeight: '700' },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.grey },
  stepLabel: { fontSize: 10, textAlign: 'center', color: COLORS.textMuted, lineHeight: 14, marginTop: 6 },
  stepLabelDone: { color: COLORS.primary, fontWeight: '700' },

  // Info cards
  infoRow: { flexDirection: 'row', gap: 10 },
  infoCard: { flex: 1, backgroundColor: COLORS.lightGrey, borderRadius: 12, padding: 14 },
  infoLabel: { fontSize: 11, color: COLORS.textLight, marginBottom: 4 },
  infoVal: { fontSize: 14, fontWeight: '700', color: COLORS.text },

  // Details
  detailsBox: { backgroundColor: COLORS.secondary, borderRadius: 12, paddingHorizontal: 14 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 11, borderBottomWidth: 1, borderColor: COLORS.border,
  },
  detailLabel: { fontSize: 13, color: COLORS.textLight },
  detailVal: { fontSize: 13, fontWeight: '600', color: COLORS.text },

  // Map
  mapBox: {
    height: 140, backgroundColor: COLORS.lightGrey, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  mapIcon: { fontSize: 36, marginBottom: 4 },
  mapTxt: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },
  mapBadge: {
    position: 'absolute', bottom: 12,
    backgroundColor: COLORS.white, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  mapBadgeTxt: { fontSize: 12, fontWeight: '600', color: COLORS.text },

  // Support
  supportBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.secondary, borderRadius: 12, padding: 14, gap: 12,
  },
  supportTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  supportSub: { fontSize: 12, color: COLORS.textLight },
  supportBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 10 },
  supportBtnTxt: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
});
