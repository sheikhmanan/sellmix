import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator, Image,
} from 'react-native';
import { categoriesAPI, productsAPI, fixImageUrl } from '../services/api';
import { COLORS } from '../constants/colors';

const CAT_ORDER = ['Grocery & Staples', 'Drinks', 'Health & Beauty', 'Laundry & Household', 'Biscuits, Snacks & Chocolate'];

function buildTree(cats) {
  const map = {};
  cats.forEach((c) => { map[c._id] = { ...c, children: [] }; });
  const roots = [];
  cats.forEach((c) => {
    const pid = c.parent?._id || c.parent;
    if (pid && map[pid]) map[pid].children.push(map[c._id]);
    else roots.push(map[c._id]);
  });
  roots.sort((a, b) => {
    const ai = CAT_ORDER.indexOf(a.name);
    const bi = CAT_ORDER.indexOf(b.name);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  return roots;
}

// Build a map: categoryId -> [imageUrl, ...]
function buildImageMap(products) {
  const map = {};
  products.forEach((p) => {
    if (!p.images?.[0]) return;
    const catId = p.category?._id || p.category;
    if (!catId) return;
    if (!map[catId]) map[catId] = [];
    if (map[catId].length < 6) map[catId].push(p.images[0]);
  });
  return map;
}

// Get up to 6 images for an L1 category from its subcategories or itself
function getCategoryImages(cat, imageMap) {
  const imgs = [];
  (cat.children || []).forEach((sub) => {
    (imageMap[sub._id] || []).forEach((img) => {
      if (imgs.length < 6) imgs.push(img);
    });
  });
  if (imgs.length < 6) {
    (imageMap[cat._id] || []).forEach((img) => {
      if (imgs.length < 6) imgs.push(img);
    });
  }
  return imgs;
}

function CategoryImageBox({ cat, images }) {
  if (cat.image) {
    return (
      <View style={s.iconBox}>
        <Image source={{ uri: fixImageUrl(cat.image) }} style={s.singleImg} resizeMode="cover" />
      </View>
    );
  }
  if (!images || images.length === 0) {
    return (
      <View style={s.iconBox}>
        <Text style={s.iconEmoji}>🛒</Text>
      </View>
    );
  }
  if (images.length === 1) {
    return (
      <View style={s.iconBox}>
        <Image source={{ uri: fixImageUrl(images[0]) }} style={s.singleImg} resizeMode="contain" />
      </View>
    );
  }
  // 3×2 grid (3 cols, 2 rows = 6 images)
  const grid = images.slice(0, 6);
  while (grid.length < 6) grid.push(null);
  return (
    <View style={s.iconBox}>
      <View style={s.imgGrid}>
        {grid.map((img, i) => (
          <View key={i} style={s.imgCell}>
            {img
              ? <Image source={{ uri: fixImageUrl(img) }} style={s.gridImg} resizeMode="contain" />
              : <View style={s.imgCellEmpty} />}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function AllCategoriesScreen({ navigation }) {
  const [tree, setTree] = useState([]);
  const [imageMap, setImageMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    Promise.all([
      categoriesAPI.getAll(),
      productsAPI.getAll({ limit: 200 }),
    ]).then(([catRes, prodRes]) => {
      setTree(buildTree(catRes.data || []));
      setImageMap(buildImageMap(prodRes.data?.products || []));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={s.header}>
        <Text style={s.title}>Categories</Text>
      </View>
      <FlatList
        data={tree}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isOpen = !!expanded[item._id];
          const subNames = item.children.map((c) => c.name).join(', ');
          const imgs = getCategoryImages(item, imageMap);
          return (
            <View>
              {/* L1 Row */}
              <TouchableOpacity
                style={[s.row, isOpen && s.rowActive]}
                activeOpacity={0.75}
                onPress={() => toggle(item._id)}
              >
                <CategoryImageBox cat={item} images={imgs} />
                <View style={s.rowText}>
                  <Text style={s.rowName}>{item.name}</Text>
                  {subNames ? <Text style={s.rowSub} numberOfLines={2}>{subNames}</Text> : null}
                </View>
                <Text style={[s.chevron, isOpen && s.chevronUp]}>{isOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {/* L2 subcategory grid */}
              {isOpen && item.children.length > 0 && (
                <View style={s.subGrid}>
                  {item.children.map((sub) => (
                    <TouchableOpacity
                      key={sub._id}
                      style={s.subCard}
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('SubCategories', { categoryId: sub._id, categoryName: sub.name })}
                    >
                      <View style={s.subImgBox}>
                        {sub.image ? (
                          <Image source={{ uri: fixImageUrl(sub.image) }} style={s.subImgThumb} resizeMode="cover" />
                        ) : imageMap[sub._id]?.length > 0 ? (() => {
                          const imgs = imageMap[sub._id].slice(0, 4);
                          while (imgs.length < 4) imgs.push(null);
                          return (
                            <View style={s.subImgGrid}>
                              {imgs.map((img, i) => (
                                <View key={i} style={s.subImgCell}>
                                  {img
                                    ? <Image source={{ uri: fixImageUrl(img) }} style={s.subImgThumb} resizeMode="contain" />
                                    : <View style={s.subImgEmpty} />}
                                </View>
                              ))}
                            </View>
                          );
                        })() : <Text style={s.subIcon}>{sub.icon || '🛒'}</Text>}
                      </View>
                      <Text style={s.subName} numberOfLines={2}>{sub.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={s.divider} />
            </View>
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
    backgroundColor: COLORS.white, paddingTop: 50, paddingBottom: 14,
    paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#eee',
  },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.black },

  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    paddingHorizontal: 16, paddingVertical: 14, gap: 14,
  },
  rowActive: { backgroundColor: '#fffde7' },

  // Icon box — 72x72 with product images
  iconBox: {
    width: 78, height: 72, borderRadius: 10, backgroundColor: '#f0f4ff',
    overflow: 'hidden', alignItems: 'center', justifyContent: 'center',
  },
  iconEmoji: { fontSize: 36 },
  singleImg: { width: 78, height: 72 },
  imgGrid: { width: 78, height: 72, flexDirection: 'row', flexWrap: 'wrap' },
  imgCell: { width: 26, height: 36, padding: 1, backgroundColor: '#f5f5f5' },
  imgCellEmpty: { width: '100%', height: '100%', backgroundColor: '#f0f4ff' },
  gridImg: { width: '100%', height: '100%' },

  rowText: { flex: 1 },
  rowName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 3 },
  rowSub: { fontSize: 12, color: '#888', lineHeight: 17 },
  chevron: { fontSize: 14, color: COLORS.primary, fontWeight: '900', width: 24, textAlign: 'center' },
  chevronUp: { color: COLORS.primary },

  subGrid: {
    flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fffde7',
    paddingHorizontal: 12, paddingVertical: 12, gap: 10,
  },
  subCard: {
    width: '30%', backgroundColor: COLORS.white, borderRadius: 12,
    alignItems: 'center', paddingVertical: 16, paddingHorizontal: 6,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  subImgBox: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', marginBottom: 8, overflow: 'hidden' },
  subImg: { width: 64, height: 64 },
  subImgGrid: { width: 64, height: 64, flexDirection: 'row', flexWrap: 'wrap' },
  subImgCell: { width: 32, height: 32, padding: 1, backgroundColor: '#f5f5f5' },
  subImgThumb: { width: '100%', height: '100%' },
  subImgEmpty: { width: '100%', height: '100%', backgroundColor: '#f0f4ff' },
  subIcon: { fontSize: 32 },
  subName: { fontSize: 12, fontWeight: '600', color: '#1a1a1a', textAlign: 'center' },

  divider: { height: 1, backgroundColor: '#eee' },
});
