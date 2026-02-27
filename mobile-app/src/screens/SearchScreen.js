import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, StatusBar,
} from 'react-native';
import { productsAPI, categoriesAPI } from '../services/api';
import { COLORS } from '../constants/colors';
import ProductCard from '../components/ProductCard';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    categoriesAPI.getAll().then((r) => setCategories(r.data)).catch(() => {});
    loadProducts();
  }, []);

  useEffect(() => {
    const t = setTimeout(loadProducts, 350);
    return () => clearTimeout(t);
  }, [query, selectedCat]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = { limit: 40 };
      if (query.trim()) params.search = query.trim();
      if (selectedCat) params.category = selectedCat;
      const res = await productsAPI.getAll(params);
      setProducts(res.data.products);
    } catch {}
    setLoading(false);
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.brand}>SELLMIX</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Text style={s.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      {/* Search input */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          ref={inputRef}
          style={s.searchInput}
          placeholder="Search groceries..."
          value={query}
          onChangeText={setQuery}
          placeholderTextColor={COLORS.textMuted}
          returnKeyType="search"
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={s.clearBtn}>
            <Text style={s.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.chipScroll}
        contentContainerStyle={s.chipContent}
      >
        <TouchableOpacity
          style={[s.chip, !selectedCat && s.chipActive]}
          onPress={() => setSelectedCat(null)}
        >
          <Text style={[s.chipText, !selectedCat && s.chipTextActive]}>All</Text>
        </TouchableOpacity>
        {categories.map((c) => (
          <TouchableOpacity
            key={c._id}
            style={[s.chip, selectedCat === c._id && s.chipActive]}
            onPress={() => setSelectedCat(selectedCat === c._id ? null : c._id)}
          >
            <Text style={[s.chipText, selectedCat === c._id && s.chipTextActive]}>
              {c.icon} {c.name.split(' ')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter row */}
      <View style={s.filterRow}>
        <Text style={s.resultCount}>{products.length} products</Text>
        <TouchableOpacity style={s.filterBtn}>
          <Text style={s.filterText}>⚙️  Filter</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={products}
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
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🔍</Text>
              <Text style={s.emptyTitle}>No products found</Text>
              <Text style={s.emptySub}>Try a different search or category</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: 18, paddingTop: 50, paddingBottom: 14, borderBottomWidth: 1, borderColor: COLORS.border },
  brand: { fontSize: 19, fontWeight: '900', color: COLORS.primary, letterSpacing: 2.5 },
  cartIcon: { fontSize: 24 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: 16, marginVertical: 12, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 2, borderWidth: 1.5, borderColor: COLORS.primary, gap: 8 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: COLORS.text },
  clearBtn: { padding: 6 },
  clearText: { fontSize: 14, color: COLORS.textMuted },
  chipScroll: { flexShrink: 0 },
  chipContent: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 22, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  chipTextActive: { color: COLORS.white },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  resultCount: { fontSize: 13, color: COLORS.textLight },
  filterBtn: {},
  filterText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  grid: { paddingHorizontal: 16, paddingBottom: 24 },
  row: { justifyContent: 'space-between' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  emptySub: { fontSize: 14, color: COLORS.textLight },
});
