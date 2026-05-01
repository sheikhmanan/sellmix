import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, StatusBar, Image,
} from 'react-native';
import { productsAPI, fixImageUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { COLORS } from '../constants/colors';
import QtyControl from '../components/QtyControl';

function expandVariants(products) {
  return products.flatMap((p) => {
    if (p.weightOptions?.length > 0) {
      const discountRatio = p.price > 0 && p.discountPrice > 0 ? p.discountPrice / p.price : 1;
      return p.weightOptions.map((w) => {
        const variantSalePrice = w.salePrice > 0 ? w.salePrice : Math.round(w.price * discountRatio);
        return {
          ...p, _cardId: `${p._id}-${w.weight}`, _variantWeight: w.weight,
          _variantImage: w.image || p.images?.[0] || null,
          price: w.price,
          discountPrice: variantSalePrice < w.price ? variantSalePrice : 0,
        };
      });
    }
    return [{ ...p, _cardId: p._id }];
  });
}

function ProductRow({ product, navigation, addItem, items, updateQty }) {
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const price = hasDiscount ? product.discountPrice : product.price;
  const weight = product._variantWeight || null;
  const inCart = items?.find((i) => i._id === product._id && i.selectedWeight === weight);
  const qty = inCart?.quantity || 0;
  const imgSrc = product._variantImage || product.images?.[0];
  return (
    <TouchableOpacity style={r.card} activeOpacity={0.85} onPress={() => navigation.navigate('ProductDetail', { productId: product._id, selectedWeight: weight })}>
      <View style={r.imgBox}>
        {imgSrc
          ? <Image source={{ uri: fixImageUrl(imgSrc) }} style={r.img} resizeMode="contain" />
          : <Text style={{ fontSize: 40 }}>🛒</Text>}
      </View>
      <View style={r.info}>
        {hasDiscount && <View style={r.badge}><Text style={r.badgeTxt}>Price Cut</Text></View>}
        <Text style={r.name} numberOfLines={2}>
          {product._variantImage && product._variantWeight
            ? `${product.name} ${product._variantWeight}`
            : product.name}
        </Text>
        {!(product._variantImage && product._variantWeight) && (product._variantWeight || product.unit) && (
          <Text style={r.unit}>{product._variantWeight || product.unit}</Text>
        )}
        {hasDiscount && <Text style={r.oldPrice}>RS {product.price.toLocaleString()}</Text>}
        <Text style={r.price}>RS {price.toLocaleString()}</Text>
      </View>
      <QtyControl
        qty={qty}
        onAdd={() => addItem(product, 1, weight)}
        onIncrease={() => updateQty(product._id, weight, qty + 1)}
        onDecrease={() => updateQty(product._id, weight, qty - 1)}
      />
    </TouchableOpacity>
  );
}

const r = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#f0f0f0', paddingVertical: 12, paddingHorizontal: 16, gap: 14 },
  imgBox: { width: 90, height: 90, borderRadius: 10, backgroundColor: '#f9f9f9', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  img: { width: 90, height: 90 },
  info: { flex: 1 },
  badge: { backgroundColor: '#e74c3c', alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: '700' },
  name: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 2, lineHeight: 20 },
  unit: { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginBottom: 3 },
  oldPrice: { fontSize: 12, color: '#999', textDecorationLine: 'line-through', marginBottom: 1 },
  price: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
});

const CLOUD = 'dnhuilgay';
const BIMG = (id) => `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_800/${id}`;
const BANNERS = [
  { img: BIMG('SellMix_Banner_image-1_400x230_jmtdjm'), link: 'Search' },
  { img: BIMG('SellMix_Banner_image-2_400x230_dtzdbi'), link: 'Search' },
  { img: BIMG('SellMix_Banner_image-3_400x230_f8cxur'), link: 'Search' },
  { img: BIMG('SellMix_Banner_image-4_400x230_awtb0p'), link: 'Search' },
  { img: BIMG('SellMix_Banner_image-5_400x230_moclhp'), link: 'Search' },
];

export default function HomeScreen({ navigation }) {
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [bannerSlide, setBannerSlide] = useState(0);
  const { itemCount, addItem, updateQty, items } = useCart();

  useEffect(() => {
    const t = setInterval(() => setBannerSlide((p) => (p + 1) % BANNERS.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setOffline(false);
    try {
      const [featRes, dealsRes] = await Promise.all([
        productsAPI.getFeatured(),
        productsAPI.getAll({ limit: 6 }),
      ]);
      setFeatured(expandVariants(featRes.data.products || []));
      setDeals(expandVariants(dealsRes.data.products || []));
    } catch {
      setOffline(true);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View style={s.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={s.loaderText}>Loading SellMix...</Text>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {offline && (
        <TouchableOpacity style={s.offlineBanner} onPress={load} activeOpacity={0.8}>
          <Text style={s.offlineTxt}>⚠️  No connection — tap to retry</Text>
        </TouchableOpacity>
      )}

      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={s.header}>
        <View>
          <Text style={s.brand}>SellMix</Text>
          <Text style={s.location}>📍 Chichawatni, Pakistan  ▾</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={s.cartWrap}>
          <Text style={s.cartIcon}>🛒</Text>
          {itemCount > 0 && (
            <View style={s.cartBadge}><Text style={s.cartBadgeText}>{itemCount}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Search bar ─────────────────────────────────────────── */}
        <TouchableOpacity style={s.searchBar} onPress={() => navigation.navigate('Search')} activeOpacity={0.8}>
          <Text style={s.searchIcon}>🔍</Text>
          <Text style={s.searchPlaceholder}>Search for flour, oil, or spices...</Text>
        </TouchableOpacity>

        {/* ── Hero Banner Carousel ───────────────────────────────── */}
        <TouchableOpacity activeOpacity={0.95} onPress={() => navigation.navigate(BANNERS[bannerSlide].link)}>
          <Image
            source={{ uri: BANNERS[bannerSlide].img }}
            style={s.bannerImg}
            resizeMode="cover"
          />
        </TouchableOpacity>
        <View style={s.bannerDots}>
          {BANNERS.map((_, i) => (
            <View key={i} style={[s.dot, i === bannerSlide && s.dotActive]} />
          ))}
        </View>

        {/* ── Why Choose Us ─────────────────────────────────────── */}
        <View style={s.whyBar}>
          <Text style={s.whyLabel}>Why choose us?</Text>
          <View style={s.whyRow}>
            {[
              { icon: '◷', title: 'Value for money', sub: 'Discount on 100+ Products' },
              { icon: '⊡', title: 'Fast Delivery', sub: 'Rs. 150 flat • Chichawatni' },
              { icon: '✓', title: 'Quality assurance', sub: 'You Can Trust us' },
            ].map((w, i) => (
              <View key={i} style={s.whyItem}>
                <View style={s.whyIconBox}>
                  <Text style={s.whyIconTxt}>{w.icon}</Text>
                </View>
                <View style={s.whyTextBlock}>
                  <Text style={s.whyTitle} numberOfLines={1}>{w.title}</Text>
                  <Text style={s.whySub} numberOfLines={1}>{w.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Daily Deals ────────────────────────────────────────── */}
        {deals.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionRow}>
              <View style={s.dealsTitle}>
                <Text style={s.sectionTitle}>Daily Deals</Text>
                <View style={s.flashBadge}><Text style={s.flashText}>FLASH SALE</Text></View>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Text style={s.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            {deals.slice(0, 6).map((p) => <ProductRow key={p._cardId || p._id} product={p} navigation={navigation} addItem={addItem} updateQty={updateQty} items={items} />)}
          </View>
        )}

        {/* ── Featured Products ─────────────────────────────────── */}
        {featured.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Featured Products</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Text style={s.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            {featured.map((p) => <ProductRow key={p._cardId || p._id} product={p} navigation={navigation} addItem={addItem} updateQty={updateQty} items={items} />)}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loaderText: { color: COLORS.textLight, fontSize: 15 },
  offlineBanner: { backgroundColor: '#FF9500', paddingVertical: 8, paddingHorizontal: 16 },
  offlineTxt: { color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, paddingHorizontal: 18, paddingTop: 50, paddingBottom: 14,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  brand: { fontSize: 26, fontWeight: '900', color: COLORS.primary, letterSpacing: 2.5 },
  location: { fontSize: 12, color: COLORS.textLight, marginTop: 3 },
  cartWrap: { position: 'relative', padding: 4 },
  cartIcon: { fontSize: 26 },
  cartBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.error, width: 19, height: 19, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    margin: 16, backgroundColor: COLORS.white,
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13,
    borderWidth: 1.5, borderColor: COLORS.border,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  searchIcon: { fontSize: 16 },
  searchPlaceholder: { color: COLORS.textMuted, fontSize: 14 },

  // Banner
  bannerImg: { width: '100%', height: 180 },
  bannerDots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ccc' },
  dotActive: { backgroundColor: COLORS.primary, width: 18 },
  whyBar: { backgroundColor: '#f0f0f0', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e0e0e0', paddingHorizontal: 12, paddingVertical: 10 },
  whyLabel: { fontSize: 12, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  whyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  whyItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  whyIconBox: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#27ae60', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  whyIconTxt: { fontSize: 15, color: '#fff', fontWeight: '700' },
  whyTextBlock: { flex: 1 },
  whyTitle: { fontSize: 11, fontWeight: '700', color: '#1a1a1a' },
  whySub: { fontSize: 9, color: '#666' },

  // Sections
  section: { marginHorizontal: 16, marginTop: 22 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.black },
  viewAll: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  dealsTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flashBadge: { backgroundColor: COLORS.error, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  flashText: { color: COLORS.white, fontSize: 9, fontWeight: '800', letterSpacing: 1 },

});
