import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { COLORS } from '../constants/colors';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const search = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'newest';

  const activeCategoryName = categories.find((c) => c._id === categoryFilter || c.name === categoryFilter)?.name || '';

  useEffect(() => {
    categoriesAPI.getAll().then((r) => setCategories(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { limit: 100 };
    if (search) params.search = search;
    if (categoryFilter) params.category = categoryFilter;

    productsAPI.getAll(params)
      .then((r) => {
        let list = r.data.products || [];
        if (sortBy === 'price_asc') list = [...list].sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        if (sortBy === 'price_desc') list = [...list].sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        setProducts(list);
        setTotal(r.data.total || list.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, categoryFilter, sortBy]);

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div style={s.root}>
      {/* Page Banner */}
      <div style={s.banner}>
        <div style={s.bannerInner}>
          <h1 style={s.bannerTitle}>{search ? `Results for "${search}"` : activeCategoryName || 'All Products'}</h1>
          <p style={s.bannerSub}>📍 Delivering across Chichawatni City</p>
        </div>
      </div>

      <div style={s.container}>
        <div style={s.layout}>
          {/* Sidebar Filters */}
          <aside style={s.sidebar}>
            <div style={s.filterCard}>
              <h3 style={s.filterTitle}>Categories</h3>
              <button style={{ ...s.catBtn, ...(categoryFilter === '' ? s.catBtnActive : {}) }} onClick={() => setParam('category', '')}>All Products</button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  style={{ ...s.catBtn, ...(categoryFilter === c._id ? s.catBtnActive : {}) }}
                  onClick={() => setParam('category', c._id)}
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>

            <div style={s.filterCard}>
              <h3 style={s.filterTitle}>Sort By</h3>
              {[
                { val: 'newest', label: 'Newest First' },
                { val: 'price_asc', label: 'Price: Low to High' },
                { val: 'price_desc', label: 'Price: High to Low' },
              ].map((o) => (
                <button
                  key={o.val}
                  style={{ ...s.catBtn, ...(sortBy === o.val ? s.catBtnActive : {}) }}
                  onClick={() => setParam('sort', o.val)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Products Grid */}
          <main style={s.main}>
            <div style={s.mainHeader}>
              <p style={s.countTxt}>{loading ? 'Loading...' : `${products.length} products found`}</p>
              {search && (
                <button style={s.clearSearch} onClick={() => setParam('search', '')}>
                  ✕ Clear search
                </button>
              )}
            </div>

            {loading ? (
              <div style={s.loadingGrid}>
                {[...Array(8)].map((_, i) => <div key={i} style={s.skeleton} />)}
              </div>
            ) : products.length === 0 ? (
              <div style={s.empty}>
                <p style={s.emptyIcon}>🔍</p>
                <p style={s.emptyTitle}>No products found</p>
                <p style={s.emptySub}>Try a different search or category</p>
              </div>
            ) : (
              <div style={s.grid}>
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '60vh' },
  banner: { backgroundColor: '#111827', padding: '32px 20px' },
  bannerInner: { maxWidth: 1200, margin: '0 auto' },
  bannerTitle: { fontSize: 28, fontWeight: 800, color: COLORS.white, marginBottom: 6 },
  bannerSub: { fontSize: 14, color: '#aaa' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '24px 20px' },
  layout: { display: 'flex', gap: 24, alignItems: 'flex-start' },
  sidebar: { width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 },
  filterCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, border: `1px solid ${COLORS.border}` },
  filterTitle: { fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  catBtn: { display: 'block', width: '100%', textAlign: 'left', padding: '9px 12px', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: COLORS.text, backgroundColor: 'transparent', marginBottom: 4 },
  catBtnActive: { backgroundColor: COLORS.primary + '15', color: COLORS.primary, fontWeight: 700 },
  main: { flex: 1 },
  mainHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  countTxt: { fontSize: 14, color: COLORS.textLight },
  clearSearch: { fontSize: 13, color: COLORS.error, background: 'none', border: `1px solid ${COLORS.error}`, borderRadius: 8, padding: '5px 12px', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 },
  loadingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16 },
  skeleton: { height: 280, backgroundColor: COLORS.lightGrey, borderRadius: 14, animation: 'pulse 1.5s infinite' },
  empty: { textAlign: 'center', padding: '60px 20px' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: 700, color: COLORS.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.textLight },
};
