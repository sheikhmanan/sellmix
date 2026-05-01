import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator,
} from 'react-native';
import { productsAPI, fixImageUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { COLORS } from '../constants/colors';

export default function ProductDetailScreen({ route, navigation }) {
  const { productId, selectedWeight: initWeight = null } = route.params;
  const [product, setProduct] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(initWeight);
  const [loading, setLoading] = useState(true);
  const [expandNutrition, setExpandNutrition] = useState(false);
  const [expandCooking, setExpandCooking] = useState(false);
  const [related, setRelated] = useState([]);
  const { addItem, updateQty, items, itemCount } = useCart();

  useEffect(() => {
    setLoading(true);
    productsAPI.getById(productId).then((res) => {
      const p = res.data;
      setProduct(p);
      // Auto-select first variant if none passed in
      const defaultWeight = initWeight || p.weightOptions?.[0]?.weight || null;
      setSelectedWeight(defaultWeight);
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

  const selectedOption = product.weightOptions?.find((w) => w.weight === selectedWeight);
  const variantImg = selectedOption?.image || null;
  const mainImg = variantImg || product.images?.[0] || null;

  const discountRatio = product.price > 0 && product.discountPrice > 0
    ? product.discountPrice / product.price
    : 1;
  const mrpPrice = selectedOption ? selectedOption.price : product.price;
  const price = selectedOption
    ? (selectedOption.salePrice > 0 ? selectedOption.salePrice : Math.round(selectedOption.price * discountRatio))
    : (product.discountPrice > 0 ? product.discountPrice : product.price);
  const hasDiscount = price < mrpPrice;
  const discountPct = hasDiscount ? Math.round((1 - price / mrpPrice) * 100) : 0;

  const inCart = items.find((i) => i._id === product._id && i.selectedWeight === selectedWeight);
  const MAX_QTY = Math.min(5, product.stock > 0 ? product.stock : 5);
  const outOfStock = product.stock === 0;

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.brand}>SellMix</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={s.cartWrap}>
          <Text style={s.cartIco}>🛒</Text>
          {itemCount > 0 && (
            <View style={s.cartBadge}><Text style={s.cartBadgeTxt}>{itemCount}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      {/* Location */}
      <View style={s.locationBar}>
        <Text style={s.locationTxt}>📍 Delivering to Chichawatni, Pakistan</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={s.imgBox}>
          {mainImg
            ? <Image source={{ uri: fixImageUrl(mainImg) }} style={s.img} />
            : <View style={s.imgPlaceholder}><Text style={{ fontSize: 72 }}>🛒</Text></View>}
          {hasDiscount && (
            <View style={s.discBadge}><Text style={s.discTxt}>{discountPct}% OFF</Text></View>
          )}
        </View>

        <View style={s.content}>
          {/* Category */}
          <Text style={s.catLabel}>{product.category?.name?.toUpperCase()}</Text>

          {/* Name + heart */}
          <View style={s.nameRow}>
            <Text style={s.name}>{product.name}</Text>
            <TouchableOpacity><Text style={s.heart}>🤍</Text></TouchableOpacity>
          </View>

          {/* Unit / Weight */}
          {(selectedWeight || product.unit) ? (
            <Text style={s.unitLabel}>{selectedWeight || product.unit}</Text>
          ) : null}

          {/* Price Row */}
          <View style={s.priceRow}>
            <Text style={s.price}>Rs. {price.toLocaleString()}</Text>
            {hasDiscount && <Text style={s.oldPrice}>Rs. {mrpPrice.toLocaleString()}</Text>}
          </View>

          {/* Description */}
          {product.description ? (
            <>
              <Text style={s.sLabel}>Description</Text>
              <Text style={s.desc}>{product.description}</Text>
            </>
          ) : null}

          {/* Badges */}
          <View style={s.badgesRow}>
            <View style={s.badge}><Text style={s.badgeTxt}>✅ Quality Guaranteed</Text></View>
            <View style={s.badge}><Text style={s.badgeTxt}>🚚 Express Delivery</Text></View>
          </View>

          {/* Frequently Bought Together */}
          {related.length > 0 && (
            <>
              <Text style={[s.sLabel, { marginTop: 28 }]}>Frequently Bought Together</Text>
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

          <View style={{ height: 160 }} />
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={s.bottomBar}>
        {outOfStock ? (
          <View style={[s.addBasketBtn, { backgroundColor: '#ccc' }]}>
            <Text style={s.addBasketTxt}>Out of Stock</Text>
          </View>
        ) : !inCart ? (
          <TouchableOpacity
            style={s.addBasketBtn}
            onPress={() => addItem({ ...product, price, discountPrice: 0 }, 1, selectedWeight)}
          >
            <Text style={s.addBasketTxt}>+ Add to Cart</Text>
          </TouchableOpacity>
        ) : (
          <>
            <View style={s.cartQtyRow}>
              <TouchableOpacity
                style={s.cartQtyBtn}
                onPress={() => updateQty(product._id, selectedWeight, inCart.quantity - 1)}
              >
                <Text style={s.cartQtyBtnTxt}>−</Text>
              </TouchableOpacity>
              <Text style={s.cartQtyNum}>{inCart.quantity}</Text>
              <TouchableOpacity
                style={[s.cartQtyBtn, inCart.quantity >= MAX_QTY && s.cartQtyBtnDisabled]}
                onPress={() => inCart.quantity < MAX_QTY && updateQty(product._id, selectedWeight, inCart.quantity + 1)}
              >
                <Text style={s.cartQtyBtnTxt}>+</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.primary,
  },
  backArrow: { fontSize: 20, color: '#fff', fontWeight: '700', lineHeight: 24 },
  brand: { fontSize: 26, fontWeight: '800', color: COLORS.primary, letterSpacing: 2 },
  cartIco: { fontSize: 24 },
  cartWrap: { position: 'relative', padding: 4 },
  cartBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.error, width: 19, height: 19, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cartBadgeTxt: { color: COLORS.white, fontSize: 10, fontWeight: '800' },

  // Location
  locationBar: {
    backgroundColor: COLORS.white, paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  locationTxt: { fontSize: 12, color: COLORS.textLight },

  // Image
  imgBox: { width: '100%', height: 260, backgroundColor: '#f9f9f9' },
  img: { width: '100%', height: '100%', resizeMode: 'contain' },
  imgPlaceholder: { width: '100%', height: '100%', backgroundColor: COLORS.lightGrey, alignItems: 'center', justifyContent: 'center' },

  // Content
  content: { padding: 18 },
  catLabel: { fontSize: 11, color: COLORS.primary, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.black, flex: 1, marginRight: 8, lineHeight: 28 },
  heart: { fontSize: 22 },
  unit: { fontSize: 15, color: COLORS.primary, fontWeight: '700', marginBottom: 14 },
  unitLabel: { fontSize: 15, color: COLORS.primary, fontWeight: '700', marginBottom: 10, marginTop: -2 },

  // Price
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  price: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  oldPrice: { fontSize: 15, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  discBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: COLORS.success, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
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
  wPrice: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

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
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28, gap: 12,
  },
  addBasketBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  addBasketTxt: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  cartQtyRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.primary, borderRadius: 12, overflow: 'hidden' },
  cartQtyBtn: { paddingHorizontal: 18, paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  cartQtyBtnDisabled: { opacity: 0.4 },
  cartQtyBtnTxt: { fontSize: 22, color: COLORS.white, fontWeight: '700', lineHeight: 24 },
  cartQtyNum: { fontSize: 18, fontWeight: '800', color: COLORS.white, minWidth: 28, textAlign: 'center' },
});
