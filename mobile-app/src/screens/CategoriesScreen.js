import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, StatusBar, Image,
} from 'react-native';
import { productsAPI, categoriesAPI, fixImageUrl } from '../services/api';
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
        {item.category?.name && <Text style={s.catLabel}>{item.category.name.toUpperCase()}</Text>}
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

export default function CategoriesScreen({ route, navigation }) {
  const { categoryId, categoryName } = route.params || {};
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('All');
  const { itemCount } = useCart();

  useEffect(() => { load(); }, [categoryId]);

  const load = async () => {
    setLoading(true);
    try {
      const [subRes, prodRes] = await Promise.all([
        categoriesAPI.getAll({ parent: categoryId }),
        productsAPI.getAll({ category: categoryId, limit: 50 }),
      ]);
      setSubcategories(subRes.data);
      setProducts(prodRes.data.products);
    } catch {}
    setLoading(false);
  };

  const allTags = ['All', ...new Set(products.flatMap((p) => p.tags || []))];
  const baseFiltered = selectedTag === 'All' ? products : products.filter((p) => p.tags?.includes(selectedTag));
  const filtered = expandVariants(baseFiltered);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{categoryName}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={s.cartWrap}>
          <Text style={s.cartIcon}>🛒</Text>
          {itemCount > 0 && (
            <View style={s.cartBadge}><Text style={s.cartBadgeTxt}>{itemCount}</Text></View>
          )}
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

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <>
          {/* Subcategory chips — shown when this category has children */}
          {subcategories.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.subScroll} contentContainerStyle={s.subContent}>
              {subcategories.map((sub) => (
                <TouchableOpacity
                  key={sub._id}
                  style={s.subChip}
                  onPress={() => navigation.push('SubCategories', { categoryId: sub._id, categoryName: sub.name })}
                >
                  <Text style={s.subChipIcon}>{sub.icon}</Text>
                  <Text style={s.subChipText}>{sub.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Tag Filter chips — only rendered after products load to prevent stretching */}
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

          <FlatList
            data={filtered}
            keyExtractor={(i) => i._cardId || i._id}
            contentContainerStyle={s.grid}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <DealCard item={item} navigation={navigation} />}
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
        </>
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
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 20, color: '#fff', fontWeight: '700', lineHeight: 24 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, flex: 1, textAlign: 'center' },
  cartIcon: { fontSize: 24 },
  cartWrap: { position: 'relative', padding: 4 },
  cartBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.error, width: 19, height: 19, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cartBadgeTxt: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
  banner: {
    backgroundColor: '#111827', marginHorizontal: 16, marginVertical: 14,
    borderRadius: 16, padding: 20, minHeight: 110,
  },
  bannerBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 10 },
  bannerBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  bannerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.white, lineHeight: 27, marginBottom: 6 },
  bannerSub: { fontSize: 13, color: COLORS.white, opacity: 0.7 },
  subScroll: { flexShrink: 0, marginBottom: 4 },
  subContent: { paddingHorizontal: 16, gap: 10, paddingVertical: 10 },
  subChip: { alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', gap: 6 },
  subChipIcon: { fontSize: 18 },
  subChipText: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  tagScroll: { height: 50, flexShrink: 0 },
  tagContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  tag: { height: 38, minWidth: 60, paddingHorizontal: 18, borderRadius: 22, backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  tagActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tagText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  tagTextActive: { color: COLORS.white },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  count: { fontSize: 13, color: COLORS.textLight },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  filterText: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  grid: { paddingHorizontal: 12, paddingBottom: 30 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  imgBox: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9', position: 'relative' },
  img: { width: 80, height: 80 },
  pctBadge: { position: 'absolute', bottom: 0, left: 0, backgroundColor: '#e74c3c', paddingHorizontal: 5, paddingVertical: 2, borderTopRightRadius: 8 },
  pctTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },
  info: { flex: 1, paddingHorizontal: 12 },
  catLabel: { fontSize: 10, fontWeight: '700', color: COLORS.primary, marginBottom: 2 },
  name: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginBottom: 2, lineHeight: 18 },
  unit: { fontSize: 12, fontWeight: '700', color: COLORS.primary, marginBottom: 2 },
  oldPrice: { fontSize: 12, color: '#999', textDecorationLine: 'line-through' },
  price: { fontSize: 15, fontWeight: '800', color: '#1a1a1a' },
  addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addBtnAdded: { backgroundColor: '#2176ae' },
  addTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  viewAllBtn: { backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  viewAllText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 15, color: COLORS.textLight },
});
