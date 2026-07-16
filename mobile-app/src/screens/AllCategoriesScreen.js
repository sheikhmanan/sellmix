import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  StatusBar, ActivityIndicator, Image,
} from 'react-native';
import { categoriesAPI, fixImageUrl } from '../services/api';
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

export default function AllCategoriesScreen({ navigation }) {
  const [tree, setTree] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesAPI.getAll()
      .then((res) => { setTree(buildTree(res.data || [])); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

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
          const isOpen = openId === item._id;
          const subNames = item.children.map((c) => c.name).join(', ');
          return (
            <View>
              <TouchableOpacity
                style={[s.row, isOpen && s.rowActive]}
                activeOpacity={0.75}
                onPress={() => toggle(item._id)}
              >
                {item.image ? (
                  <Image source={{ uri: fixImageUrl(item.image) }} style={s.catIcon} resizeMode="contain" />
                ) : null}
                <View style={s.rowText}>
                  <Text style={s.rowName}>{item.name}</Text>
                  {subNames ? <Text style={s.rowSub} numberOfLines={2}>{subNames}</Text> : null}
                </View>
                <Text style={[s.chevron, isOpen && s.chevronUp]}>{isOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {isOpen && item.children.length > 0 && (
                <View style={s.subGrid}>
                  {item.children.map((sub) => (
                    <TouchableOpacity
                      key={sub._id}
                      style={s.subCard}
                      activeOpacity={0.8}
                      onPress={() => navigation.navigate('SubCategories', { categoryId: sub._id, categoryName: sub.name })}
                    >
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
    paddingHorizontal: 16, paddingVertical: 12, gap: 12,
  },
  catIcon: { width: 56, height: 56, borderRadius: 10 },
  rowActive: { backgroundColor: '#fffde7' },

  rowText: { flex: 1 },
  rowName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 3 },
  rowSub: { fontSize: 12, color: '#888', lineHeight: 17 },
  chevron: { fontSize: 14, color: COLORS.primary, fontWeight: '900', width: 24, textAlign: 'center' },

  subGrid: {
    flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#fffde7',
    paddingHorizontal: 12, paddingVertical: 12, gap: 10,
  },
  subCard: {
    width: '30%', backgroundColor: COLORS.white, borderRadius: 12,
    alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  subName: { fontSize: 12, fontWeight: '600', color: '#1a1a1a', textAlign: 'center' },

  divider: { height: 1, backgroundColor: '#eee' },
});
