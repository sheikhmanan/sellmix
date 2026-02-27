import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Alert,
} from 'react-native';
import { productsAPI, fixImageUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { COLORS } from '../constants/colors';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandNutrition, setExpandNutrition] = useState(false);
  const [expandCooking, setExpandCooking] = useState(false);
  const [related, setRelated] = useState([]);
  const { addItem } = useCart();

  useEffect(() => {
    productsAPI.getById(productId).then((res) => {
      const p = res.data;
      setProduct(p);
      if (p.weightOptions?.length) setSelectedWeight(p.weightOptions[0].weight);
      if (p.category?._id) {
        productsAPI.getAll({ category: p.category._id, limit: 6 })
          .then((r) => setRelated((r.data.products || []).filter((x) => x._id !== productId).slice(0, 2)))
          .catch(() => {});
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [productId]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!product) return <View style={s.center}><Text>Product not found</Text></View>;

  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPct = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;

  const handleAdd = () => {
    addItem(product, quantity, selectedWeight);
    Alert.alert('Added to Basket!', `${product.name} has been added.`, [
      { text: 'Continue Shopping' },
      { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
    ]);
  };

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.brand}>SELLMIX</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Text style={s.cartIco}>🛒</Text>
        </TouchableOpacity>
      </View>

      {/* Location */}
      <View style={s.locationBar}>
        <Text style={s.locationTxt}>📍 Delivering to Chichawatni, Pakistan</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={s.imgBox}>
          {product.images?.[0]
            ? <Image source={{ uri: fixImageUrl(product.images[0]) }} style={s.img} />
            : <View style={s.imgPlaceholder}><Text style={{ fontSize: 72 }}>🛒</Text></View>}
          {/* Dots */}
          <View style={s.dotsRow}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[s.dot, i === 0 && s.dotActive]} />
            ))}
          </View>
        </View>

        <View style={s.content}>
          {/* Category */}
          <Text style={s.catLabel}>{product.category?.name?.toUpperCase()}</Text>

          {/* Name + heart */}
          <View style={s.nameRow}>
            <Text style={s.name}>{product.name}</Text>
            <TouchableOpacity><Text style={s.heart}>🤍</Text></TouchableOpacity>
          </View>

          {product.unit ? (
            <Text style={s.unit}>(Extra {product.unit}, {product.tags?.[0] || 'Premium Quality'})</Text>
          ) : null}

          {/* Price Row */}
          <View style={s.priceRow}>
            <Text style={s.price}>Rs. {price.toLocaleString()}</Text>
            {hasDiscount && <Text style={s.oldPrice}>Rs. {product.price.toLocaleString()}</Text>}
            {hasDiscount && (
              <View style={s.discBadge}><Text style={s.discTxt}>{discountPct}% OFF</Text></View>
            )}
          </View>

          {/* Description */}
          {product.description ? (
            <>
              <Text style={s.sLabel}>Description</Text>
              <Text style={s.desc}>{product.description}</Text>
            </>
          ) : null}

          {/* Weight Options */}
          {product.weightOptions?.length > 0 && (
            <View style={s.weightRow}>
              {product.weightOptions.map((w) => (
                <TouchableOpacity
                  key={w.weight}
                  style={[s.wChip, selectedWeight === w.weight && s.wChipActive]}
                  onPress={() => setSelectedWeight(w.weight)}
                >
                  <Text style={[s.wText, selectedWeight === w.weight && s.wTextActive]}>
                    {w.weight}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Badges */}
          <View style={s.badgesRow}>
            <View style={s.badge}><Text style={s.badgeTxt}>✅ Quality Guaranteed</Text></View>
            <View style={s.badge}><Text style={s.badgeTxt}>🚚 Express Delivery</Text></View>
          </View>

          {/* Frequently Bought Together */}
          {related.length > 0 && (
            <>
              <Text style={s.sLabel}>Frequently Bought Together</Text>
              <View style={s.relatedRow}>
                {related.map((rp) => (
                  <TouchableOpacity
                    key={rp._id}
                    style={s.relCard}
                    onPress={() => navigation.push('ProductDetail', { productId: rp._id })}
                  >
                    <View style={s.relImgBox}>
                      {rp.images?.[0]
                        ? <Image source={{ uri: fixImageUrl(rp.images[0]) }} style={s.relImg} />
                        : <Text style={{ fontSize: 28 }}>🛒</Text>}
                    </View>
                    <Text style={s.relName} numberOfLines={2}>{rp.name}</Text>
                    <Text style={s.relPrice}>Rs. {(rp.discountPrice || rp.price).toLocaleString()}</Text>
                    <TouchableOpacity
                      style={s.relAddBtn}
                      onPress={() => { addItem(rp, 1, null); Alert.alert('Added!', `${rp.name} added`); }}
                    >
                      <Text style={s.relAddTxt}>Add</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Nutritional Info */}
          {product.nutritionalInfo ? (
            <>
              <TouchableOpacity style={s.accordion} onPress={() => setExpandNutrition(!expandNutrition)}>
                <Text style={s.accordTxt}>Nutritional Information</Text>
                <Text style={s.accordChev}>{expandNutrition ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {expandNutrition && <Text style={s.accordContent}>{product.nutritionalInfo}</Text>}
            </>
          ) : null}

          {/* Cooking Instructions */}
          {product.cookingInstructions ? (
            <>
              <TouchableOpacity style={s.accordion} onPress={() => setExpandCooking(!expandCooking)}>
                <Text style={s.accordTxt}>Cooking Instructions</Text>
                <Text style={s.accordChev}>{expandCooking ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {expandCooking && <Text style={s.accordContent}>{product.cookingInstructions}</Text>}
            </>
          ) : null}

          {/* Reviews */}
          <TouchableOpacity style={s.accordion}>
            <Text style={s.accordTxt}>Reviews (128)</Text>
            <View style={s.ratingRow}>
              <Text style={s.ratingTxt}>⭐ 4.8</Text>
              <Text style={s.accordChev}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={s.bottomBar}>
        <View style={s.qtyRow}>
          <TouchableOpacity style={s.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
            <Text style={s.qtyBtnTxt}>−</Text>
          </TouchableOpacity>
          <Text style={s.qty}>{quantity}</Text>
          <TouchableOpacity style={s.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
            <Text style={s.qtyBtnTxt}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={s.addBasketBtn} onPress={handleAdd}>
          <Text style={s.addBasketTxt}>🛒  Add to Basket</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, paddingHorizontal: 16,
    paddingTop: 50, paddingBottom: 12,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: COLORS.lightGrey, alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: COLORS.text },
  brand: { fontSize: 16, fontWeight: '800', color: COLORS.primary, letterSpacing: 2 },
  cartIco: { fontSize: 24 },

  // Location
  locationBar: {
    backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  locationTxt: { fontSize: 12, color: COLORS.textLight },

  // Image
  imgBox: { width: '100%', height: 260, backgroundColor: '#111' },
  img: { width: '100%', height: '100%', resizeMode: 'cover' },
  imgPlaceholder: { width: '100%', height: '100%', backgroundColor: COLORS.lightGrey, alignItems: 'center', justifyContent: 'center' },
  dotsRow: { position: 'absolute', bottom: 12, alignSelf: 'center', flexDirection: 'row', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { width: 20, backgroundColor: COLORS.white },

  // Content
  content: { padding: 18 },
  catLabel: { fontSize: 11, color: COLORS.primary, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.black, flex: 1, marginRight: 8, lineHeight: 28 },
  heart: { fontSize: 22 },
  unit: { fontSize: 13, color: COLORS.textLight, marginBottom: 14 },

  // Price
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  price: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  oldPrice: { fontSize: 15, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  discBadge: { backgroundColor: COLORS.success, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  discTxt: { color: COLORS.white, fontSize: 12, fontWeight: '700' },

  // Section labels
  sLabel: { fontSize: 15, fontWeight: '700', color: COLORS.black, marginBottom: 10, marginTop: 2 },
  desc: { fontSize: 14, color: COLORS.textLight, lineHeight: 22, marginBottom: 20 },

  // Weight options
  weightRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  wChip: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8 },
  wChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '12' },
  wText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  wTextActive: { color: COLORS.primary },

  // Badges
  badgesRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  badge: { backgroundColor: COLORS.lightGrey, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  badgeTxt: { fontSize: 13, color: COLORS.text },

  // Related products
  relatedRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  relCard: { flex: 1, backgroundColor: COLORS.lightGrey, borderRadius: 14, padding: 12, alignItems: 'center' },
  relImgBox: {
    width: '100%', height: 90, borderRadius: 10, overflow: 'hidden',
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  relImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  relName: { fontSize: 12, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginBottom: 4 },
  relPrice: { fontSize: 13, fontWeight: '700', color: COLORS.primary, marginBottom: 8 },
  relAddBtn: { backgroundColor: COLORS.primary, width: '100%', paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  relAddTxt: { color: COLORS.white, fontSize: 13, fontWeight: '700' },

  // Accordion
  accordion: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 15, borderTopWidth: 1, borderColor: COLORS.border,
  },
  accordTxt: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  accordChev: { fontSize: 13, color: COLORS.textMuted },
  accordContent: {
    padding: 14, fontSize: 13, color: COLORS.textLight, lineHeight: 20,
    backgroundColor: COLORS.lightGrey, borderRadius: 10, marginBottom: 4,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingTxt: { fontSize: 14, fontWeight: '700', color: COLORS.text },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white, borderTopWidth: 1, borderColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28, gap: 16,
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnTxt: { fontSize: 20, color: COLORS.text, lineHeight: 22 },
  qty: { fontSize: 18, fontWeight: '700', color: COLORS.text, minWidth: 24, textAlign: 'center' },
  addBasketBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  addBasketTxt: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
});
