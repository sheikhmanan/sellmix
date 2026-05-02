import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image,
} from 'react-native';
import { fixImageUrl } from '../services/api';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

const STATUS_CONFIG = {
  placed:           { label: 'Pending',          color: COLORS.warning,  bg: '#FFF8E1' },
  packed:           { label: 'Packed',            color: '#9B59B6',       bg: '#F4EDFB' },
  out_for_delivery: { label: 'Out for Delivery',  color: COLORS.primary,  bg: '#E8F4FD' },
  delivered:        { label: 'Delivered',         color: COLORS.success,  bg: '#E8F8F0' },
  cancelled:        { label: 'Cancelled',         color: COLORS.error,    bg: '#FEECEC' },
};

export default function OrdersScreen({ navigation }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      ordersAPI.getMyOrders()
        .then((r) => setOrders(r.data))
        .catch((err) => Alert.alert('Error', err.message || 'Could not load orders'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <View style={s.center}>
        <Text style={s.bigIcon}>📦</Text>
        <Text style={s.guestTitle}>Login to view your orders</Text>
        <Text style={s.guestSub}>Track and manage all your SellMix orders in one place.</Text>
        <TouchableOpacity style={s.loginBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={s.loginBtnTxt}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 120 }} />;
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>My Orders</Text>
        <Text style={s.count}>{orders.length} order{orders.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(i) => i._id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.placed;
          return (
            <View style={s.card}>
              {/* Card Header */}
              <View style={s.cardTop}>
                <View>
                  <Text style={s.orderId}>#{item.orderId}</Text>
                  <Text style={s.orderDate}>
                    {new Date(item.createdAt).toLocaleDateString('en-PK', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: st.bg }]}>
                  <Text style={[s.statusTxt, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>

              {/* Product list */}
              <View style={s.itemsList}>
                {item.items?.map((prod, i) => (
                  <View key={i} style={s.itemRow}>
                    <View style={s.itemImgBox}>
                      {prod.image
                        ? <Image source={{ uri: fixImageUrl(prod.image) }} style={s.itemImg} />
                        : <Text style={{ fontSize: 18 }}>🛒</Text>}
                    </View>
                    <View style={s.itemInfo}>
                      <Text style={s.itemName} numberOfLines={1}>{prod.name}</Text>
                      {prod.weight ? <Text style={s.itemWeight}>{prod.weight}</Text> : null}
                      <Text style={s.itemQty}>Qty: {prod.quantity}</Text>
                    </View>
                    <Text style={s.itemPrice}>Rs. {(prod.price * prod.quantity).toLocaleString()}</Text>
                  </View>
                ))}
              </View>

              {/* Summary */}
              <View style={s.summaryBox}>
                {item.discount > 0 && (
                  <View style={s.sumRow}>
                    <Text style={s.sumLabel}>Discount</Text>
                    <Text style={[s.sumVal, { color: COLORS.success }]}>− Rs. {item.discount?.toLocaleString()}</Text>
                  </View>
                )}
                <View style={s.sumRow}>
                  <Text style={s.sumLabel}>Delivery</Text>
                  <Text style={[s.sumVal, { color: COLORS.success }]}>Free</Text>
                </View>
                <View style={[s.sumRow, s.totalRow]}>
                  <Text style={s.totalLabel}>Order Total</Text>
                  <Text style={s.totalAmt}>Rs. {item.total?.toLocaleString()}</Text>
                </View>
              </View>

              {/* Footer */}
              <View style={s.cardFooter}>
                <Text style={s.payMethod}>💳 {item.paymentMethod}</Text>
                <TouchableOpacity
                  style={s.trackBtn}
                  onPress={() => navigation.navigate('OrderTracking', { orderId: item.orderId })}
                >
                  <Text style={s.trackBtnTxt}>Track Order →</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.bigIcon}>📦</Text>
            <Text style={s.emptyTitle}>No orders yet</Text>
            <Text style={s.emptySub}>Start shopping and your orders will appear here.</Text>
            <TouchableOpacity style={s.shopBtn} onPress={() => navigation.navigate('Search')}>
              <Text style={s.shopBtnTxt}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  // Guest / center
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: COLORS.background },
  bigIcon: { fontSize: 64, marginBottom: 16 },
  guestTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  guestSub: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  loginBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12 },
  loginBtnTxt: { color: COLORS.white, fontWeight: '700', fontSize: 15 },

  // Header
  header: {
    backgroundColor: COLORS.white, paddingHorizontal: 18,
    paddingTop: 50, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 20, color: '#fff', fontWeight: '700', lineHeight: 24 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, flex: 1 },
  count: { fontSize: 13, color: COLORS.textLight },

  // List
  listContent: { padding: 14 },

  // Card
  card: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderId: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  orderDate: { fontSize: 12, color: COLORS.textMuted },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusTxt: { fontSize: 12, fontWeight: '700' },

  // Items list
  itemsList: { borderTopWidth: 1, borderColor: COLORS.lightGrey, paddingTop: 12, marginBottom: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  itemImgBox: { width: 50, height: 50, borderRadius: 8, backgroundColor: COLORS.lightGrey, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemImg: { width: 50, height: 50, resizeMode: 'contain' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  itemWeight: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginBottom: 2 },
  itemQty: { fontSize: 12, color: COLORS.textMuted },
  itemPrice: { fontSize: 13, fontWeight: '700', color: COLORS.text },

  // Summary
  summaryBox: { backgroundColor: COLORS.background, borderRadius: 10, padding: 12, marginBottom: 12 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  sumLabel: { fontSize: 13, color: COLORS.textLight },
  sumVal: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  totalRow: { borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 10, marginTop: 4, marginBottom: 0 },
  totalLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  totalAmt: { fontSize: 16, fontWeight: '800', color: COLORS.primary },

  // Footer
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  payMethod: { fontSize: 13, color: COLORS.textMuted },
  trackBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
  trackBtnTxt: { color: COLORS.white, fontWeight: '700', fontSize: 13 },

  // Empty
  emptyWrap: { alignItems: 'center', paddingTop: 60, padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  shopBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 36, paddingVertical: 14, borderRadius: 12 },
  shopBtnTxt: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
