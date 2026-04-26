import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, StatusBar, Image,
} from 'react-native';
import { productsAPI, fixImageUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { COLORS } from '../constants/colors';
import QtyControl from '../components/QtyControl';

function expandVariants(products) {
  return products.flatMap((p) => {
    if (p.weightOptions?.length > 0) {
      const hasVariantImages = p.weightOptions.some((w) => w.image);
      const opts = hasVariantImages ? p.weightOptions.filter((w) => w.image) : p.weightOptions;
      const discountRatio = p.price > 0 && p.discountPrice > 0 ? p.discountPrice / p.price : 1;
      return opts.map((w) => {
        const variantSalePrice = w.salePrice > 0 ? w.salePrice : Math.round((w.price || p.price) * discountRatio);
        return {
          ...p,
          _cardId: `${p._id}-${w.weight}`,
          _variantWeight: w.weight,
          _variantImage: w.image || null,
          price: w.price || p.price,
          discountPrice: variantSalePrice < (w.price || p.price) ? variantSalePrice : 0,
        };
      });
    }
    return [{ ...p, _cardId: p._id }];
  });
}

function DealCard({ item, navigation }) {
  const { addItem, updateQty, items } = useCart();
  const weight = item._variantWeight || null;
  const inCart = items?.find((i) => i._id === item._id && i.selectedWeight === weight);
  const qty = inCart?.quantity || 0;
  const pct = item.discountPrice > 0 && item.discountPrice < item.price
    ? Math.round((1 - item.discountPrice / item.price) * 100) : 0;
  const imgUrl = item._variantImage ? fixImageUrl(item._variantImage) : item.images?.[0] ? fixImageUrl(item.images[0]) : null;
  const unit = item._variantWeight || item.weightOptions?.[0]?.weight || item.unit || '';
  return (
    <TouchableOpacity style={s.card} activeOpacity={0.85} onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}>
      <View style={s.imgBox}>
        {imgUrl ? <Image source={{ uri: imgUrl }} style={s.img} resizeMode="contain" /> : <Text style={{ fontSize: 36 }}>🛒</Text>}
        {pct > 0 && <View style={s.pctBadge}><Text style={s.pctTxt}>-{pct}%</Text></View>}
      </View>
      <View style={s.info}>
        {item.category?.name && <Text style={s.catName}>{item.category.name.toUpperCase()}</Text>}
        <Text style={s.name} numberOfLines={2}>
          {item._variantImage && item._variantWeight
            ? `${item.name} ${item._variantWeight}`
            : item.name}
        </Text>
        {!(item._variantImage && item._variantWeight) && unit ? <Text style={s.unit}>{unit}</Text> : null}
        {pct > 0 && <Text style={s.oldPrice}>Rs. {item.price.toLocaleString()}</Text>}
        <Text style={s.price}>Rs. {(item.discountPrice || item.price).toLocaleString()}</Text>
      </View>
      <QtyControl
        qty={qty}
        onAdd={() => addItem(item, 1, weight)}
        onIncrease={() => updateQty(item._id, weight, qty + 1)}
        onDecrease={() => updateQty(item._id, weight, qty - 1)}
      />
    </TouchableOpacity>
  );
}

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [allNames, setAllNames] = useState([]);   // for autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const { itemCount } = useCart();

  // Load all product names once for prefix matching
  useEffect(() => {
    productsAPI.getAll({ limit: 300 }).then((r) => {
      const names = (r.data.products || []).map((p) => ({ name: p.name, id: p._id }));
      setAllNames(names);
    }).catch(() => {});
    loadProducts();
  }, []);

  // Debounced product search
  useEffect(() => {
    const t = setTimeout(loadProducts, 350);
    return () => clearTimeout(t);
  }, [query]);

  // Live prefix autocomplete
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) { setSuggestions([]); setShowSuggestions(false); return; }
    const matches = allNames
      .filter((p) => p.name.toLowerCase().startsWith(q))
      .slice(0, 6);
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  }, [query, allNames]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (query.trim()) params.search = query.trim();
      const res = await productsAPI.getAll(params);
      setProducts(expandVariants(res.data.products || []));
    } catch {}
    setLoading(false);
  };

  const pickSuggestion = (name) => {
    setQuery(name);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const highlightMatch = (name, q) => {
    const idx = name.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <Text style={s.suggestName}>{name}</Text>;
    return (
      <Text style={s.suggestName}>
        <Text style={s.suggestBold}>{name.slice(0, idx + q.length)}</Text>
        {name.slice(idx + q.length)}
      </Text>
    );
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.brand}>SellMix</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={s.cartWrap}>
          <Text style={s.cartIcon}>🛒</Text>
          {itemCount > 0 && (
            <View style={s.cartBadge}><Text style={s.cartBadgeTxt}>{itemCount}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search input + autocomplete */}
      <View style={s.searchContainer}>
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={s.searchInput}
            placeholder="Search groceries..."
            value={query}
            onChangeText={(t) => { setQuery(t); setShowSuggestions(true); }}
            onFocus={() => query.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setShowSuggestions(false); }} style={s.clearBtn}>
              <Text style={s.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <View style={s.dropdown}>
            {suggestions.map((item) => (
              <TouchableOpacity key={item.id} style={s.suggestRow} onPress={() => pickSuggestion(item.name)}>
                <Text style={s.suggestIcon}>🔍</Text>
                {highlightMatch(item.name, query.trim())}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

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
          keyExtractor={(i) => i._cardId || i._id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => <DealCard item={item} navigation={navigation} />}
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
  root: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: 18, paddingTop: 50, paddingBottom: 14, borderBottomWidth: 1, borderColor: COLORS.border },
  brand: { fontSize: 26, fontWeight: '900', color: COLORS.primary, letterSpacing: 2.5 },
  cartWrap: { position: 'relative' },
  cartIcon: { fontSize: 24 },
  cartBadge: { position: 'absolute', top: -4, right: -6, backgroundColor: COLORS.error, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  cartBadgeTxt: { color: '#fff', fontSize: 10, fontWeight: '800' },

  searchContainer: { marginHorizontal: 16, marginVertical: 12, zIndex: 100 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 2, borderWidth: 1.5, borderColor: COLORS.primary, gap: 8 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: COLORS.text },
  clearBtn: { padding: 6 },
  clearText: { fontSize: 14, color: COLORS.textMuted },

  dropdown: {
    backgroundColor: COLORS.white, borderRadius: 12, marginTop: 4,
    borderWidth: 1, borderColor: '#e8e8e8',
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 8,
    overflow: 'hidden',
  },
  suggestRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1, borderColor: '#f0f0f0', gap: 10 },
  suggestIcon: { fontSize: 14, opacity: 0.5 },
  suggestName: { fontSize: 14, color: '#444', flex: 1 },
  suggestBold: { fontWeight: '800', color: COLORS.primary },

  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  resultCount: { fontSize: 13, color: COLORS.textLight },
  filterBtn: {},
  filterText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  list: { paddingHorizontal: 12, paddingBottom: 24 },

  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  imgBox: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9', position: 'relative' },
  img: { width: 80, height: 80 },
  pctBadge: { position: 'absolute', bottom: 0, left: 0, backgroundColor: '#e74c3c', paddingHorizontal: 5, paddingVertical: 2, borderTopRightRadius: 8 },
  pctTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },
  info: { flex: 1, paddingHorizontal: 12 },
  catName: { fontSize: 10, fontWeight: '700', color: COLORS.primary, marginBottom: 2 },
  name: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginBottom: 2, lineHeight: 18 },
  unit: { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginBottom: 2 },
  oldPrice: { fontSize: 12, color: '#999', textDecorationLine: 'line-through' },
  price: { fontSize: 15, fontWeight: '800', color: '#1a1a1a' },
  addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addBtnAdded: { backgroundColor: '#2176ae' },
  addTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },

  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  emptySub: { fontSize: 14, color: COLORS.textLight },
});
