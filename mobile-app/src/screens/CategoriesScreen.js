import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, StatusBar, Image,
} from 'react-native';
import { productsAPI } from '../services/api';
import { COLORS } from '../constants/colors';
import ProductCard from '../components/ProductCard';

export default function CategoriesScreen({ route, navigation }) {
  const { categoryId, categoryName } = route.params || {};
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => { load(); }, [categoryId]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await productsAPI.getAll({ category: categoryId, limit: 50 });
      setProducts(res.data.products);
    } catch {}
    setLoading(false);
  };

  const allTags = ['All', ...new Set(products.flatMap((p) => p.tags || []))];
  const filtered = selectedTag === 'All' ? products : products.filter((p) => p.tags?.includes(selectedTag));

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{categoryName}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Text style={s.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      {/* Category Banner */}
      <View style={s.banner}>
        <View style={s.bannerBadge}>
          <Text style={s.bannerBadgeText}>CHICHAWATNI FRESH</Text>
        </View>
        <Text style={s.bannerTitle}>Premium {categoryName}{'\n'}Collection</Text>
        <Text style={s.bannerSub}>Best quality delivered to your doorstep.</Text>
      </View>

      {/* Tag Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.tagScroll}
        contentContainerStyle={s.tagContent}
      >
        {allTags.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[s.tag, selectedTag === tag && s.tagActive]}
            onPress={() => setSelectedTag(tag)}
          >
            <Text style={[s.tagText, selectedTag === tag && s.tagTextActive]}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count + Filter */}
      <View style={s.countRow}>
        <Text style={s.count}>Showing {filtered.length} products</Text>
        <TouchableOpacity style={s.filterBtn}>
          <Text style={s.filterText}>⚙️  Filters</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i._id}
          numColumns={2}
          contentContainerStyle={s.grid}
          columnWrapperStyle={s.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
            />
          )}
          ListFooterComponent={
            filtered.length > 0 ? (
              <TouchableOpacity style={s.viewAllBtn}>
                <Text style={s.viewAllText}>View All Products</Text>
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📦</Text>
              <Text style={s.emptyText}>No products in this category yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, paddingHorizontal: 16,
    paddingTop: 50, paddingBottom: 14, borderBottomWidth: 1, borderColor: COLORS.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.lightGrey, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: COLORS.text },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, flex: 1, textAlign: 'center' },
  cartIcon: { fontSize: 24 },
  banner: {
    backgroundColor: '#111827', marginHorizontal: 16, marginVertical: 14,
    borderRadius: 16, padding: 20, minHeight: 110,
  },
  bannerBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 10 },
  bannerBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  bannerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.white, lineHeight: 27, marginBottom: 6 },
  bannerSub: { fontSize: 13, color: COLORS.white, opacity: 0.7 },
  tagScroll: { flexShrink: 0 },
  tagContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  tag: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border },
  tagActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tagText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  tagTextActive: { color: COLORS.white },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  count: { fontSize: 13, color: COLORS.textLight },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  filterText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  grid: { paddingHorizontal: 16, paddingBottom: 30 },
  row: { justifyContent: 'space-between' },
  viewAllBtn: { backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  viewAllText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 15, color: COLORS.textLight },
});
