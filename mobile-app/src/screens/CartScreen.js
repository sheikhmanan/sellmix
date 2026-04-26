import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet,
  Image, TextInput, Alert, Modal,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { fixImageUrl, ordersAPI } from '../services/api';
import { COLORS } from '../constants/colors';

function BuyAgainRow({ user, addItem }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!user) return;
    ordersAPI.getMyOrders().then((r) => {
      const seen = new Set();
      const list = [];
      (r.data || []).forEach((order) => {
        (order.items || []).forEach((item) => {
          const p = item.product;
          if (p && p._id && !seen.has(p._id)) {
            seen.add(p._id);
            list.push({ ...p, _orderPrice: item.price });
          }
        });
      });
      setProducts(list.slice(0, 12));
    }).catch(() => {});
  }, [user]);

  if (!user || products.length === 0) return null;

  return (
    <View style={ba.wrap}>
      <Text style={ba.heading}>🔄  Buy Again</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ba.row}>
        {products.map((p) => (
          <View key={p._id} style={ba.card}>
            <View style={ba.imgBox}>
              {p.images?.[0]
                ? <Image source={{ uri: fixImageUrl(p.images[0]) }} style={ba.img} />
                : <Text style={{ fontSize: 24 }}>🛒</Text>}
            </View>
            <Text style={ba.name} numberOfLines={2}>{p.name}</Text>
            <Text style={ba.price}>Rs. {(p.discountPrice || p.price || p._orderPrice || 0).toLocaleString()}</Text>
            <TouchableOpacity style={ba.btn} onPress={() => addItem(p, 1, null)}>
              <Text style={ba.btnTxt}>+ Add</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const DELIVERY_FEE = 150;

export default function CartScreen({ navigation }) {
  const { items, addItem, updateQty, removeItem, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const applyPromo = async () => {
    try {
      const res = await ordersAPI.validatePromo(promo, subtotal);
      setDiscount(res.data.discount);
      setPromoApplied(true);
      Alert.alert('✅ Promo Applied!', `You saved Rs. ${res.data.discount}!`);
    } catch {
      Alert.alert('Invalid Code', 'This promo code is not valid.');
    }
  };

  const total = subtotal - discount + DELIVERY_FEE;

  if (items.length === 0) {
    return (
      <View style={s.emptyWrap}>
        <Text style={s.emptyIcon}>🛒</Text>
        <Text style={s.emptyTitle}>Your cart is empty</Text>
        <Text style={s.emptySub}>Add some items from the store</Text>
        <TouchableOpacity style={s.shopBtn} onPress={() => navigation.navigate('Search')}>
          <Text style={s.shopBtnTxt}>Browse Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.back}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>My Cart</Text>
        <TouchableOpacity onPress={() =>
          Alert.alert('Clear Cart', 'Remove all items?', [
            { text: 'Cancel' },
            { text: 'Clear', style: 'destructive', onPress: clearCart },
          ])
        }>
          <Text style={s.clearTxt}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Location */}
      <View style={s.locationBar}>
        <Text style={s.locationTxt}>📍 Delivering to <Text style={s.locationCity}>Chichawatni City</Text></Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => `${i._id}-${i.selectedWeight}`}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const unitPrice = item.discountPrice || item.price;
          const itemTotal = unitPrice * item.quantity;
          const MAX = Math.min(5, item.stock > 0 ? item.stock : 5);
          return (
            <View style={s.cartCard}>
              {/* Product image */}
              <View style={s.itemImgBox}>
                {item.images?.[0]
                  ? <Image source={{ uri: fixImageUrl(item.images[0]) }} style={s.itemImg} />
                  : <Text style={{ fontSize: 30 }}>🛒</Text>}
              </View>

              {/* Info */}
              <View style={s.itemInfo}>
                <View style={s.itemTopRow}>
                  <Text style={s.itemName} numberOfLines={2}>{item.name}</Text>
                  <TouchableOpacity
                    style={s.deleteBtn}
                    onPress={() => removeItem(item._id, item.selectedWeight)}
                  >
                    <Text style={s.deleteTxt}>🗑️</Text>
                  </TouchableOpacity>
                </View>
                <Text style={s.itemSub}>
                  {item.selectedWeight ? `${item.selectedWeight} • ` : ''}Rs. {unitPrice.toLocaleString()} / unit
                </Text>
                <View style={s.qtyPriceRow}>
                  <View style={s.qtyRow}>
                    <TouchableOpacity
                      style={s.qtyBtn}
                      onPress={() => updateQty(item._id, item.selectedWeight, item.quantity - 1)}
                    >
                      <Text style={s.qtyBtnTxt}>−</Text>
                    </TouchableOpacity>
                    <Text style={s.qty}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={[s.qtyBtn, item.quantity >= MAX && { opacity: 0.4 }]}
                      onPress={() => item.quantity < MAX && updateQty(item._id, item.selectedWeight, item.quantity + 1)}
                    >
                      <Text style={s.qtyBtnTxt}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={s.itemTotal}>Rs. {itemTotal.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <View>
            {/* Buy Again */}
            <BuyAgainRow user={user} addItem={addItem} />

            {/* Promo Code */}
            <View style={s.promoCard}>
              <Text style={s.promoLabel}>PROMO CODE</Text>
              <View style={s.promoRow}>
                <TextInput
                  style={s.promoInput}
                  placeholder="Enter code (e.g. SELLMIX20)"
                  value={promo}
                  onChangeText={setPromo}
                  editable={!promoApplied}
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={[s.promoBtn, promoApplied && { backgroundColor: COLORS.success }]}
                  onPress={applyPromo}
                  disabled={promoApplied}
                >
                  <Text style={s.promoBtnTxt}>{promoApplied ? '✓' : 'Apply'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Summary */}
            <View style={s.summaryCard}>
              <View style={s.sumRow}>
                <Text style={s.sumLabel}>Subtotal ({items.length} items)</Text>
                <Text style={s.sumVal}>Rs. {subtotal.toLocaleString()}</Text>
              </View>
              {discount > 0 && (
                <View style={s.sumRow}>
                  <Text style={s.sumLabel}>Promo Discount</Text>
                  <Text style={[s.sumVal, { color: COLORS.success }]}>- Rs. {discount.toLocaleString()}</Text>
                </View>
              )}
              <View style={s.sumRow}>
                <Text style={s.sumLabel}>Delivery Fee (Chichawatni)</Text>
                <Text style={[s.sumVal, { color: COLORS.success }]}>Rs. {DELIVERY_FEE}</Text>
              </View>
              <View style={s.sumRow}>
                <Text style={s.sumLabel}>Tax</Text>
                <Text style={s.sumVal}>Rs. 0</Text>
              </View>
              <View style={[s.sumRow, s.totalRow]}>
                <Text style={s.totalLabel}>Order Total</Text>
                <Text style={s.totalVal}>Rs. {total.toLocaleString()}</Text>
              </View>
            </View>

            <View style={{ height: 110 }} />
          </View>
        }
      />

      {/* Bottom Checkout */}
      <View style={s.bottomBar}>
        <TouchableOpacity
          style={s.checkoutBtn}
          onPress={() => {
            if (!user) {
              setShowAuthModal(true);
            } else {
              navigation.navigate('Checkout', {
                subtotal, discount, deliveryFee: DELIVERY_FEE, total,
                promoCode: promoApplied ? promo : '',
              });
            }
          }}
        >
          <Text style={s.checkoutTxt}>Checkout</Text>
        </TouchableOpacity>
      </View>

      {/* Auth Required Modal */}
      <Modal visible={showAuthModal} transparent animationType="slide" onRequestClose={() => setShowAuthModal(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowAuthModal(false)}>
          <View style={s.modalCard}>
            <Text style={s.modalIcon}>🔐</Text>
            <Text style={s.modalTitle}>Login Required</Text>
            <Text style={s.modalSub}>
              Please login or create an account to proceed with your order.
            </Text>
            <TouchableOpacity
              style={s.modalLoginBtn}
              onPress={() => { setShowAuthModal(false); navigation.navigate('Login'); }}
            >
              <Text style={s.modalLoginTxt}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.modalSignupBtn}
              onPress={() => { setShowAuthModal(false); navigation.navigate('SignUp'); }}
            >
              <Text style={s.modalSignupTxt}>Create Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.modalCancelBtn} onPress={() => setShowAuthModal(false)}>
              <Text style={s.modalCancelTxt}>Continue Browsing</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  // Empty state
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.textLight, marginBottom: 28 },
  shopBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 36, paddingVertical: 14, borderRadius: 12 },
  shopBtnTxt: { color: COLORS.white, fontWeight: '700', fontSize: 15 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, paddingHorizontal: 16, paddingTop: 50, paddingBottom: 14,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  back: { fontSize: 20, color: '#fff', fontWeight: '700', lineHeight: 24 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  clearTxt: { fontSize: 14, color: COLORS.error, fontWeight: '600' },

  // Location bar
  locationBar: {
    backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  locationTxt: { fontSize: 13, color: COLORS.textLight },
  locationCity: { color: COLORS.primary, fontWeight: '600' },

  // List
  listContent: { padding: 14 },

  // Cart Card
  cartCard: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    borderRadius: 14, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  itemImgBox: {
    width: 76, height: 76, borderRadius: 10,
    backgroundColor: COLORS.lightGrey, alignItems: 'center', justifyContent: 'center',
    marginRight: 12, overflow: 'hidden',
  },
  itemImg: { width: 76, height: 76, resizeMode: 'cover' },
  itemInfo: { flex: 1 },
  itemTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  itemName: { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 8, lineHeight: 20 },
  deleteBtn: { padding: 2 },
  deleteTxt: { fontSize: 18 },
  itemSub: { fontSize: 12, color: COLORS.textLight, marginBottom: 10 },
  qtyPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnTxt: { fontSize: 17, color: COLORS.text, lineHeight: 19 },
  qty: { fontSize: 15, fontWeight: '700', color: COLORS.text, minWidth: 20, textAlign: 'center' },
  itemTotal: { fontSize: 15, fontWeight: '800', color: COLORS.primary },

  // Promo
  promoCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 12 },
  promoLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1.2, marginBottom: 10 },
  promoRow: { flexDirection: 'row', gap: 10 },
  promoInput: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: 10, padding: 12, fontSize: 14, color: COLORS.text,
    backgroundColor: COLORS.secondary,
  },
  promoBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, borderRadius: 10, justifyContent: 'center' },
  promoBtnTxt: { color: COLORS.white, fontWeight: '700', fontSize: 14 },

  // Summary
  summaryCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sumLabel: { fontSize: 14, color: COLORS.textLight },
  sumVal: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  totalRow: { borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 14, marginTop: 2, marginBottom: 0 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  totalVal: { fontSize: 20, fontWeight: '800', color: COLORS.primary },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white, padding: 16, paddingBottom: 28,
    borderTopWidth: 1, borderColor: COLORS.border,
  },
  checkoutBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  checkoutTxt: { color: COLORS.white, fontWeight: '700', fontSize: 16 },

  // Auth modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.white, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 40, alignItems: 'center',
  },
  modalIcon: { fontSize: 48, marginBottom: 12 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  modalSub: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalLoginBtn: {
    width: '100%', backgroundColor: COLORS.primary, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', marginBottom: 10,
  },
  modalLoginTxt: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  modalSignupBtn: {
    width: '100%', backgroundColor: COLORS.white, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center', marginBottom: 8,
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  modalSignupTxt: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
  modalCancelBtn: { padding: 10, marginTop: 4 },
  modalCancelTxt: { color: COLORS.textMuted, fontSize: 14 },
});

const ba = StyleSheet.create({
  wrap: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 12 },
  heading: { fontSize: 15, fontWeight: '800', color: '#1a1a1a', marginBottom: 12 },
  row: { gap: 10, paddingRight: 4 },
  card: { width: 120, backgroundColor: COLORS.secondary, borderRadius: 12, padding: 10, alignItems: 'center' },
  imgBox: { width: 80, height: 80, borderRadius: 10, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 8 },
  img: { width: 80, height: 80, resizeMode: 'contain' },
  name: { fontSize: 11, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginBottom: 4, lineHeight: 15 },
  price: { fontSize: 12, fontWeight: '800', color: COLORS.primary, marginBottom: 8 },
  btn: { backgroundColor: COLORS.primary, width: '100%', paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  btnTxt: { color: COLORS.white, fontWeight: '700', fontSize: 12 },
});
