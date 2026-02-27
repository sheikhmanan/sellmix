import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
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
        .catch(() => {})
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
            <TouchableOpacity
              style={s.card}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('OrderTracking', { orderId: item.orderId })}
            >
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

              {/* Items info */}
              <View style={s.cardMid}>
                <Text style={s.itemCount}>{item.items?.length || 0} item(s)</Text>
                <Text style={s.payMethod}>{item.paymentMethod}</Text>
              </View>

              {/* Footer */}
              <View style={s.cardFooter}>
                <Text style={s.totalLabel}>Order Total</Text>
                <View style={s.footerRight}>
                  <Text style={s.totalAmt}>Rs. {item.total?.toLocaleString()}</Text>
                  <Text style={s.trackArrow}>Track  →</Text>
                </View>
              </View>
            </TouchableOpacity>
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
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  count: { fontSize: 13, color: COLORS.textLight, marginBottom: 2 },

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

  cardMid: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.lightGrey,
    marginBottom: 12,
  },
  itemCount: { fontSize: 13, color: COLORS.textLight },
  payMethod: { fontSize: 13, color: COLORS.textLight },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, color: COLORS.textLight },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  totalAmt: { fontSize: 17, fontWeight: '800', color: COLORS.primary },
  trackArrow: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  // Empty
  emptyWrap: { alignItems: 'center', paddingTop: 60, padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  shopBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 36, paddingVertical: 14, borderRadius: 12 },
  shopBtnTxt: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
