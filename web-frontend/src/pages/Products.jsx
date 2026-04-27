import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';

const UNIT_LABELS = {
  g: 'grams', gram: 'grams', grams: 'grams',
  ml: 'milliliters', milliliter: 'milliliters', milliliters: 'milliliters',
  litre: 'litres', liter: 'litres', litres: 'litres', liters: 'litres', l: 'litres',
  piece: 'pieces', pieces: 'pieces', pcs: 'pieces', pc: 'pieces',
  kg: 'kg',
};
const formatUnit = (u) => UNIT_LABELS[u?.toLowerCase()] || u || '';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    categoriesAPI.getAll().then((r) => setCategories(r.data)).catch(() => {});
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 400);
    return () => clearTimeout(t);
  }, [search, selectedCat]);

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (search) params.search = search;
      if (selectedCat) params.category = selectedCat;
      const res = await productsAPI.getAll(params);
      setProducts(res.data.products);
    } catch {}
    setLoading(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    if (!confirm(`This will permanently delete "${name}". This cannot be undone. Confirm?`)) return;
    try {
      await productsAPI.delete(id);
      setProducts((p) => p.filter((x) => x._id !== id));
    } catch {}
  };

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Products</h1>
        <button style={s.addBtn} onClick={() => navigate('/products/add')}>+ Add Product</button>
      </div>

      {/* Filters */}
      <div style={s.filters}>
        <input
          style={s.search}
          placeholder="🔍  Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select style={s.select} value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <p style={{ color: '#8E8E93', padding: 24 }}>Loading...</p>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['Image', 'Product', 'Category', 'Price', 'Discount', 'Stock', 'Featured', 'Actions'].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const hasVariants = p.weightOptions?.length > 0;
                const isExpanded = expanded[p._id];
                return [
                  /* Main product row */
                  <tr key={p._id} style={s.tr}>
                    <td style={s.td}>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} style={s.thumb} />
                      ) : (
                        <div style={s.noImg}>🛒</div>
                      )}
                    </td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={s.productName}>{p.name}</p>
                        {hasVariants && (
                          <button style={s.expandBtn} onClick={() => toggleExpand(p._id)}>
                            {isExpanded ? '▲' : '▼'} {p.weightOptions.length} variants
                          </button>
                        )}
                      </div>
                      <p style={s.productUnit}>{formatUnit(p.unit)}</p>
                    </td>
                    <td style={s.td}>{p.category?.name || '—'}</td>
                    <td style={s.td}>Rs. {p.price?.toLocaleString()}</td>
                    <td style={s.td}>
                      {p.discountPrice > 0 ? (
                        <span style={s.discBadge}>Rs. {p.discountPrice.toLocaleString()}</span>
                      ) : '—'}
                    </td>
                    <td style={s.td}>
                      <span style={{ color: p.stock <= 10 ? '#FF3B30' : '#34C759', fontWeight: 700 }}>
                        {p.stock} units
                        {p.stock <= 10 && <span style={s.lowBadge}>LOW</span>}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.statusDot, backgroundColor: p.isFeatured ? '#34C759' : '#E5E5EA' }} />
                    </td>
                    <td style={s.td}>
                      <button style={s.editBtn} onClick={() => navigate(`/products/edit/${p._id}`)}>✏️</button>
                      <button style={s.deleteBtn} onClick={() => handleDelete(p._id, p.name)}>🗑️</button>
                    </td>
                  </tr>,

                  /* Variant sub-rows */
                  ...(hasVariants && isExpanded ? p.weightOptions.map((v, vi) => (
                    <tr key={`${p._id}-v${vi}`} style={s.variantRow}>
                      <td style={s.tdV}>
                        {v.image ? (
                          <img src={v.image} alt={v.weight} style={s.thumbSm} />
                        ) : (
                          <div style={s.noImgSm}>📦</div>
                        )}
                      </td>
                      <td style={s.tdV}>
                        <span style={s.variantLabel}>↳ {v.weight}</span>
                      </td>
                      <td style={s.tdV} />
                      <td style={s.tdV}>Rs. {v.price?.toLocaleString()}</td>
                      <td style={s.tdV} />
                      <td style={s.tdV} />
                      <td style={s.tdV} />
                      <td style={s.tdV}>
                        <button style={s.editBtnSm} onClick={() => navigate(`/products/edit/${p._id}?variant=${vi}`)}>✏️ Edit</button>
                      </td>
                    </tr>
                  )) : []),
                ];
              })}
              {!products.length && (
                <tr><td colSpan={8} style={{ ...s.td, textAlign: 'center', color: '#8E8E93', padding: 40 }}>No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { padding: 28 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 800, color: '#1a1a1a' },
  addBtn: { backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  filters: { display: 'flex', gap: 12, marginBottom: 20 },
  search: { flex: 1, border: '1.5px solid #E5E5EA', borderRadius: 10, padding: '11px 16px', fontSize: 14, outline: 'none', backgroundColor: '#fff' },
  select: { border: '1.5px solid #E5E5EA', borderRadius: 10, padding: '11px 16px', fontSize: 14, outline: 'none', backgroundColor: '#fff', minWidth: 180 },
  tableWrap: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, color: '#8E8E93', letterSpacing: 1, borderBottom: '1px solid #F2F2F7', backgroundColor: '#FAFAFA' },
  tr: { borderBottom: '1px solid #F2F2F7' },
  variantRow: { borderBottom: '1px solid #F2F2F7', backgroundColor: '#FAFAFA' },
  td: { padding: '12px 16px', fontSize: 14, color: '#1a1a1a', verticalAlign: 'middle' },
  tdV: { padding: '8px 16px', fontSize: 13, color: '#444', verticalAlign: 'middle' },
  thumb: { width: 48, height: 48, borderRadius: 8, objectFit: 'cover' },
  thumbSm: { width: 36, height: 36, borderRadius: 6, objectFit: 'cover' },
  noImg: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  noImgSm: { width: 36, height: 36, borderRadius: 6, backgroundColor: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 },
  productName: { fontWeight: 600, marginBottom: 2 },
  productUnit: { fontSize: 12, color: '#8E8E93' },
  expandBtn: { backgroundColor: '#EBF5FE', color: '#3498db', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },
  variantLabel: { fontSize: 13, color: '#555', fontWeight: 600 },
  discBadge: { backgroundColor: '#34C75920', color: '#34C759', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 },
  lowBadge: { marginLeft: 6, backgroundColor: '#FF3B3020', color: '#FF3B30', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 },
  statusDot: { display: 'inline-block', width: 12, height: 12, borderRadius: '50%' },
  editBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, marginRight: 8 },
  editBtnSm: { backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 },
};
