import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, StatusBar, Image, Dimensions,
} from 'react-native';
import { productsAPI, categoriesAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { COLORS } from '../constants/colors';
import ProductCard from '../components/ProductCard';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { itemCount } = useCart();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [catRes, featRes, dealsRes] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getFeatured(),
        productsAPI.getAll({ limit: 6 }),
      ]);
      setCategories(catRes.data);
      setFeatured(featRes.data.products);
      setDeals(dealsRes.data.products);
    } catch {}
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

      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={s.header}>
        <View>
          <Text style={s.brand}>SELLMIX</Text>
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

        {/* ── Hero Banner ────────────────────────────────────────── */}
        <View style={s.banner}>
          <View style={s.bannerLeft}>
            <Text style={s.bannerTitle}>Freshness{'\n'}Delivered.</Text>
            <Text style={s.bannerSub}>Quality groceries from{'\n'}your favourite Chichawatni store</Text>
            <TouchableOpacity style={s.shopNowBtn} onPress={() => navigation.navigate('Search')}>
              <Text style={s.shopNowText}>Shop Now</Text>
            </TouchableOpacity>
          </View>
          <View style={s.bannerRight}>
            <Text style={s.bannerEmoji}>🧺</Text>
          </View>
        </View>

        {/* ── Categories ─────────────────────────────────────────── */}
        <View style={s.section}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Categories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={s.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.catScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat._id}
                style={s.catItem}
                onPress={() => navigation.navigate('Categories', { categoryId: cat._id, categoryName: cat.name })}
                activeOpacity={0.75}
              >
                <View style={s.catIconBox}>
                  <Text style={s.catIcon}>{cat.icon}</Text>
                </View>
                <Text style={s.catName} numberOfLines={2}>{cat.name.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
            <View style={s.grid}>
              {deals.slice(0, 4).map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onPress={() => navigation.navigate('ProductDetail', { productId: p._id })}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── Fresh from Farm ─────────────────────────────────────── */}
        {featured.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>Fresh from Farm</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Text style={s.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={s.grid}>
              {featured.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onPress={() => navigation.navigate('ProductDetail', { productId: p._id })}
                />
              ))}
            </View>
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

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, paddingHorizontal: 18, paddingTop: 50, paddingBottom: 14,
    borderBottomWidth: 1, borderColor: COLORS.border,
  },
  brand: { fontSize: 19, fontWeight: '900', color: COLORS.primary, letterSpacing: 2.5 },
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
  banner: {
    marginHorizontal: 16, marginBottom: 8, borderRadius: 18, overflow: 'hidden',
    backgroundColor: COLORS.primary, flexDirection: 'row',
    minHeight: 140, paddingLeft: 22, paddingVertical: 22,
  },
  bannerLeft: { flex: 1, justifyContent: 'center' },
  bannerTitle: { fontSize: 22, fontWeight: '900', color: COLORS.white, lineHeight: 28, marginBottom: 8 },
  bannerSub: { fontSize: 12, color: COLORS.white, opacity: 0.85, lineHeight: 18, marginBottom: 16 },
  shopNowBtn: { backgroundColor: COLORS.white, paddingVertical: 9, paddingHorizontal: 20, borderRadius: 20, alignSelf: 'flex-start' },
  shopNowText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  bannerRight: { width: 100, alignItems: 'center', justifyContent: 'center' },
  bannerEmoji: { fontSize: 70 },

  // Sections
  section: { marginHorizontal: 16, marginTop: 22 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.black },
  viewAll: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  dealsTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flashBadge: { backgroundColor: COLORS.error, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  flashText: { color: COLORS.white, fontSize: 9, fontWeight: '800', letterSpacing: 1 },

  // Categories
  catScroll: { gap: 12, paddingRight: 4, paddingBottom: 4 },
  catItem: { alignItems: 'center', width: 68 },
  catIconBox: { width: 60, height: 60, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginBottom: 7, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  catIcon: { fontSize: 28 },
  catName: { fontSize: 11, fontWeight: '600', color: COLORS.text, textAlign: 'center' },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
