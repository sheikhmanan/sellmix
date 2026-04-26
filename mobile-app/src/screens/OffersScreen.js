import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Image } from 'react-native';
import { productsAPI, fixImageUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { COLORS } from '../constants/colors';
import QtyControl from '../components/QtyControl';

export default function OffersScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem, updateQty, items, itemCount } = useCart();

  useEffect(() => {
    productsAPI.getAll({ limit: 50 }).then((r) => {
      const withDiscount = (r.data.products || []).filter((p) => p.discountPrice > 0 && p.discountPrice < p.price);
      setProducts(withDiscount);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={s.header}>
        <View>
          <Text style={s.title}>Offers</Text>
          <Text style={s.sub}>{products.length} deals available</Text>
        </View>
        <TouchableOpacity style={s.cartBtn} onPress={() => navigation.navigate('Cart')}>
          <Text style={s.cartIcon}>🛒</Text>
          {itemCount > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeTxt}>{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => {
          const pct = Math.round((1 - item.discountPrice / item.price) * 100);
          const inCart = items.find((i) => i._id === item._id && i.selectedWeight === null);
          const qty = inCart?.quantity || 0;
          return (
            <TouchableOpacity
              style={s.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
            >
              <View style={s.imgBox}>
                {item.images?.[0]
                  ? <Image source={{ uri: fixImageUrl(item.images[0]) }} style={s.img} resizeMode="contain" />
                  : <Text style={{ fontSize: 40 }}>🛒</Text>}
                <View style={s.pctBadge}><Text style={s.pctTxt}>-{pct}%</Text></View>
              </View>
              <View style={s.info}>
                <Text style={s.priceCut}>Price Cut</Text>
                <Text style={s.name} numberOfLines={2}>{item.name}</Text>
                <Text style={s.oldPrice}>RS {item.price.toLocaleString()}</Text>
                <Text style={s.price}>RS {item.discountPrice.toLocaleString()}</Text>
              </View>
              <QtyControl
                qty={qty}
                onAdd={() => addItem(item, 1, null)}
                onIncrease={() => updateQty(item._id, null, qty + 1)}
                onDecrease={() => updateQty(item._id, null, qty - 1)}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: COLORS.white, paddingTop: 50, paddingBottom: 16,
    paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#eee',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.black },
  sub: { fontSize: 13, color: '#888', marginTop: 2 },
  cartBtn: { position: 'relative', padding: 4 },
  cartIcon: { fontSize: 26 },
  badge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#e74c3c', borderRadius: 10,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeTxt: { color: '#fff', fontSize: 10, fontWeight: '800' },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: 14, padding: 12, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  imgBox: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9f9', position: 'relative' },
  img: { width: 80, height: 80 },
  pctBadge: { position: 'absolute', bottom: 0, left: 0, backgroundColor: '#e74c3c', paddingHorizontal: 5, paddingVertical: 2, borderTopRightRadius: 8 },
  pctTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },
  info: { flex: 1, paddingHorizontal: 12 },
  priceCut: { backgroundColor: '#e74c3c', color: '#fff', fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 4 },
  name: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  oldPrice: { fontSize: 12, color: '#999', textDecorationLine: 'line-through' },
  price: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  addTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  addedBtn: { backgroundColor: '#2176ae', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10 },
  addedTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
