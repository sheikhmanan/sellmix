import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { COLORS } from '../constants/colors';

function ListCard({ product }) {
  const { addItem, updateQty, items } = useCart();
  const weight = product._variantWeight || null;
  const inCart = items?.find((i) => i._id === product._id && i.selectedWeight === weight);
  const qty = inCart?.quantity || 0;
  const MAX = Math.min(5, product.stock > 0 ? product.stock : 5);
  const outOfStock = product.stock === 0;
  const pct = product.discountPrice > 0 && product.discountPrice < product.price
    ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;
  const imgUrl = product._variantImage || product.images?.[0] || '';
  const unit = product._variantWeight || product.weightOptions?.[0]?.weight || product.unit || '';
  return (
    <Link to={`/products/${product._id}`} style={lc.card}>
      <div style={lc.imgBox}>
        {imgUrl ? <img src={imgUrl} alt={product.name} style={lc.img} /> : <span style={{ fontSize: 32 }}>🛒</span>}
        {pct > 0 && <span style={lc.pct}>-{pct}%</span>}
      </div>
      <div style={lc.info}>
        {product.category?.name && <p style={lc.cat}>{product.category.name.toUpperCase()}</p>}
        <p style={lc.name}>
          {product._variantImage && product._variantWeight
            ? `${product.name} ${product._variantWeight}`
            : product.name}
        </p>
        {!(product._variantImage && product._variantWeight) && unit && <p style={lc.unit}>{unit}</p>}
        {pct > 0 && <p style={lc.oldPrice}>RS {product.price.toLocaleString()}</p>}
        <p style={lc.price}>Rs. {(product.discountPrice || product.price).toLocaleString()}</p>
      </div>
      {outOfStock ? (
        <button style={{ ...lc.addBtn, backgroundColor: '#ccc', cursor: 'default' }} disabled onClick={(e) => e.preventDefault()}>
          Out of Stock
        </button>
      ) : qty === 0 ? (
        <button style={lc.addBtn} onClick={(e) => { e.preventDefault(); addItem(product, 1, weight); }}>
          Add
        </button>
      ) : (
        <div style={lc.qtyRow} onClick={(e) => e.preventDefault()}>
          <button style={lc.qtyBtn} onClick={() => updateQty(product._id, weight, qty - 1)}>−</button>
          <span style={lc.qtyNum}>{qty}</span>
          <button
            style={{ ...lc.qtyBtn, ...(qty >= MAX ? lc.qtyBtnDisabled : {}) }}
            onClick={() => qty < MAX && updateQty(product._id, weight, qty + 1)}
          >+</button>
        </div>
      )}
    </Link>
  );
}

const lc = {
  card: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textDecoration: 'none', gap: 12 },
  imgBox: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' },
  img: { width: 80, height: 80, objectFit: 'contain' },
  pct: { position: 'absolute', bottom: 0, left: 0, backgroundColor: '#e74c3c', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 5px', borderTopRightRadius: 6 },
  info: { flex: 1, minWidth: 0 },
  cat: { fontSize: 10, fontWeight: 700, color: COLORS.primary, marginBottom: 2 },
  name: { fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 2, lineHeight: 1.4 },
  unit: { fontSize: 12, fontWeight: 700, color: COLORS.primary, marginBottom: 2 },
  oldPrice: { fontSize: 12, color: '#999', textDecoration: 'line-through', marginBottom: 1 },
  price: { fontSize: 15, fontWeight: 800, color: '#1a1a1a' },
  addBtn: { backgroundColor: COLORS.primary, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', flexShrink: 0 },
  qtyRow: { display: 'flex', alignItems: 'center', backgroundColor: '#1565c0', borderRadius: 10, overflow: 'hidden', flexShrink: 0 },
  qtyBtn: { backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: 20, fontWeight: 700, padding: '10px 14px', cursor: 'pointer', lineHeight: 1 },
  qtyBtnDisabled: { opacity: 0.4, cursor: 'default' },
  qtyNum: { color: '#fff', fontWeight: 800, fontSize: 15, minWidth: 24, textAlign: 'center' },
};


function expandVariants(products) {
  return products.flatMap((p) => {
    if (p.weightOptions?.length > 0) {
      const discountRatio = p.price > 0 && p.discountPrice > 0 ? p.discountPrice / p.price : 1;
      return p.weightOptions.map((w) => {
        const variantSalePrice = w.salePrice > 0 ? w.salePrice : Math.round(w.price * discountRatio);
        return {
          ...p,
          _cardId: `${p._id}-${w.weight}`,
          _variantWeight: w.weight,
          _variantImage: w.image || p.images?.[0] || null,
          price: w.price,
          discountPrice: variantSalePrice < w.price ? variantSalePrice : 0,
        };
      });
    }
    return [{ ...p, _cardId: p._id }];
  });
}

function buildAncestors(allCats, catId) {
  const map = {};
  allCats.forEach((c) => (map[c._id] = c));
  const path = [];
  let cur = map[catId];
  while (cur) {
    path.unshift(cur);
    const pid = cur.parent?._id || cur.parent;
    cur = pid ? map[pid] : null;
  }
  return path;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth <= 600);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 600);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

export default function Products() {
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'newest';

  const breadcrumb = categoryFilter ? buildAncestors(allCategories, categoryFilter) : [];
  const activeCat = breadcrumb.length ? breadcrumb[breadcrumb.length - 1] : null;
  const activeCatName = search ? `Search: "${search}"` : (activeCat?.name || 'All Products');

  useEffect(() => {
    categoriesAPI.getAll().then((r) => setAllCategories(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setLoading(true);
    const params = { limit: 200 };
    if (search) params.search = search;
    if (categoryFilter) params.category = categoryFilter;
    productsAPI.getAll(params)
      .then((r) => {
        let list = r.data.products || [];
        if (sortBy === 'price_asc') list = [...list].sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        if (sortBy === 'price_desc') list = [...list].sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        setProducts(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, categoryFilter, sortBy]);

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    setSearchParams(next);
  };

  const expanded = expandVariants(products);

  return (
    <div style={s.root}>
      {/* Breadcrumb */}
      <div style={s.breadBar}>
        <div style={s.breadInner}>
          <Link to="/" style={s.breadLink}>Home</Link>
          {search ? (
            <><span style={s.sep}>/</span><span style={s.breadCur}>Search: "{search}"</span></>
          ) : breadcrumb.map((cat, i) => (
            <span key={cat._id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={s.sep}>/</span>
              {i < breadcrumb.length - 1
                ? <Link to={`/products?category=${cat._id}`} style={s.breadLink}>{cat.name}</Link>
                : <span style={s.breadCur}>{cat.name}</span>}
            </span>
          ))}
          {!search && breadcrumb.length === 0 && (
            <><span style={s.sep}>/</span><span style={s.breadCur}>All Products</span></>
          )}
        </div>
      </div>

      <div style={{ ...s.container, padding: isMobile ? '12px 10px' : '24px 20px' }}>
        {/* Title + sort bar */}
        {!isMobile && (
          <div style={{ ...s.toolbar, marginBottom: 16 }}>
            <h1 style={{ ...s.pageTitle, marginBottom: 0 }}>
              {activeCatName}
              {!loading && <span style={s.countBadge}> ({expanded.length})</span>}
            </h1>
            <div style={s.sortRow}>
              {search && (
                <button style={s.clearBtn} onClick={() => setParam('search', '')}>✕ Clear</button>
              )}
            </div>
          </div>
        )}

        {/* Products */}
        {loading ? (
          <div style={isMobile ? s.skeletonList : s.grid}>
            {[...Array(isMobile ? 5 : 12)].map((_, i) => <div key={i} style={isMobile ? s.skeletonRow : s.skeleton} />)}
          </div>
        ) : expanded.length === 0 ? (
          <div style={s.empty}>
            <p style={s.emptyIcon}>🔍</p>
            <p style={s.emptyTitle}>No products found</p>
            <p style={s.emptySub}>Try a different search or category</p>
          </div>
        ) : isMobile ? (
          <div>{expanded.map((p) => <ListCard key={p._cardId} product={p} />)}</div>
        ) : (
          <div style={s.grid}>{expanded.map((p) => <ProductCard key={p._cardId} product={p} />)}</div>
        )}
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '60vh', backgroundColor: '#f5f5f5' },

  breadBar: { backgroundColor: '#fff', borderBottom: '1px solid #e8e8e8', padding: '10px 0' },
  breadInner: { maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 16, flexWrap: 'wrap' },
  breadLink: { color: COLORS.primary, textDecoration: 'none', fontWeight: 700 },
  sep: { color: '#aaa', fontWeight: 700 },
  breadCur: { color: '#1a1a1a', fontWeight: 800 },

  container: { maxWidth: 1280, margin: '0 auto', padding: '24px 20px' },

  pageTitle: { fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 0 },
  countBadge: { fontSize: 16, fontWeight: 500, color: '#666' },

  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  sortRow: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  sortBtn: { padding: '6px 14px', border: '1.5px solid #ddd', borderRadius: 6, background: '#fff', fontSize: 13, cursor: 'pointer', color: '#333' },
  sortBtnSm: { padding: '5px 10px', fontSize: 12 },
  sortBtnActive: { borderColor: COLORS.primary, color: COLORS.primary, fontWeight: 700 },
  clearBtn: { padding: '5px 10px', border: '1.5px solid #e74c3c', borderRadius: 6, background: 'none', fontSize: 12, cursor: 'pointer', color: '#e74c3c' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 },
  skeletonList: { display: 'flex', flexDirection: 'column', gap: 10 },
  skeletonRow: { height: 104, backgroundColor: '#e8e8e8', borderRadius: 14 },
  skeleton: { height: 260, backgroundColor: '#e8e8e8', borderRadius: 12 },

  empty: { textAlign: 'center', padding: '60px 20px' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#666' },
};
