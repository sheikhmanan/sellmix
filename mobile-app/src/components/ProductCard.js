import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { useCart } from '../context/CartContext';
import { fixImageUrl } from '../services/api';

export default function ProductCard({ product, onPress }) {
  const { addItem } = useCart();
  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageBox}>
        {product.images?.[0] ? (
          <Image source={{ uri: fixImageUrl(product.images[0]) }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>🛒</Text>
          </View>
        )}
        {hasDiscount && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SAVE {discountPct}%</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.category}>{product.category?.name?.toUpperCase()}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>Rs. {price.toLocaleString()}</Text>
          {hasDiscount && (
            <Text style={styles.oldPrice}>Rs. {product.price.toLocaleString()}</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => addItem(product, 1, product.weightOptions?.[0]?.weight || null)}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    width: '48%',
  },
  imageBox: { position: 'relative' },
  image: { width: '100%', height: 130, resizeMode: 'cover' },
  imagePlaceholder: { width: '100%', height: 130, backgroundColor: COLORS.lightGrey, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 40 },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: COLORS.success, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: '700' },
  info: { padding: 10 },
  category: { fontSize: 9, color: COLORS.primary, fontWeight: '700', marginBottom: 2 },
  name: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  price: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  oldPrice: { fontSize: 11, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  addBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '700', lineHeight: 22 },
});
