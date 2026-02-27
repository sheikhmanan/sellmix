import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [restocking, setRestocking] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await productsAPI.getAll({ limit: 200 });
      setProducts(res.data.products);
    } catch {}
    setLoading(false);
  };

  const handleRestock = async (id) => {
    const qty = Number(restockQty);
    if (!qty || qty <= 0) return;
    const product = products.find((p) => p._id === id);
    const newStock = (product.stock || 0) + qty;
    try {
      await productsAPI.updateStock(id, newStock);
      setProducts((prev) => prev.map((p) => p._id === id ? { ...p, stock: newStock } : p));
      setRestocking(null);
      setRestockQty('');
    } catch {}
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const lowStockCount = products.filter((p) => p.stock <= 10).length;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Inventory</h1>
          <p style={s.sub}>
            <span style={s.statusBadge}>STOCK STATUS: CHICHAWATNI BRANCH</span>
            <span style={s.totalBadge}>{products.length} Items Total</span>
          </p>
        </div>
        <div style={s.headerRight}>
          <span style={s.lowAlert}>⚠️ {lowStockCount} Low Stock</span>
          <button style={s.addBtn} onClick={() => navigate('/products/add')}>+ Add Product</button>
        </div>
      </div>

      <input
        style={s.search}
        placeholder="🔍  Search items in Chichawatni store..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p style={{ color: '#8E8E93', padding: 24 }}>Loading inventory...</p>
      ) : (
        <div style={s.list}>
          {filtered.map((p) => {
            const isLow = p.stock <= 10;
            return (
              <div key={p._id} style={{ ...s.card, borderLeft: isLow ? '4px solid #FF3B30' : '4px solid transparent' }}>
                <div style={s.cardTop}>
                  <div style={s.cardLeft}>
                    <div style={s.nameRow}>
                      <h3 style={s.productName}>{p.name}</h3>
                      {isLow && <span style={s.lowBadge}>⚠️ LOW STOCK</span>}
                      {p.isFeatured && <span style={s.healthBadge}>FEATURED</span>}
                    </div>
                    <p style={s.category}>{p.category?.name}</p>
                  </div>
                </div>

                <div style={s.statsRow}>
                  <div style={s.stat}>
                    <p style={s.statLabel}>STOCK LEVEL</p>
                    <p style={{ ...s.statVal, color: isLow ? '#FF3B30' : '#1a1a1a' }}>{p.stock} Units</p>
                  </div>
                  <div style={s.stat}>
                    <p style={s.statLabel}>PRICE</p>
                    <p style={s.statVal}>Rs. {p.price?.toLocaleString()}</p>
                  </div>
                  {p.discountPrice > 0 && (
                    <div style={s.stat}>
                      <p style={s.statLabel}>DISCOUNT</p>
                      <p style={{ ...s.statVal, color: '#34C759' }}>Rs. {p.discountPrice?.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {restocking === p._id ? (
                  <div style={s.restockForm}>
                    <input
                      style={s.restockInput}
                      type="number"
                      placeholder="Add quantity..."
                      value={restockQty}
                      onChange={(e) => setRestockQty(e.target.value)}
                      autoFocus
                    />
                    <button style={s.confirmBtn} onClick={() => handleRestock(p._id)}>Confirm</button>
                    <button style={s.cancelRestockBtn} onClick={() => { setRestocking(null); setRestockQty(''); }}>Cancel</button>
                  </div>
                ) : (
                  <div style={s.actions}>
                    <button
                      style={{ ...s.restockBtn, ...(isLow ? s.restockBtnRed : {}) }}
                      onClick={() => setRestocking(p._id)}
                    >
                      🛒 {isLow ? 'Restock' : 'Quick Add'}
                    </button>
                    <button style={s.editBtn} onClick={() => navigate(`/products/edit/${p._id}`)}>✏️</button>
                  </div>
                )}
              </div>
            );
          })}
          {!filtered.length && (
            <p style={{ color: '#8E8E93', padding: 40, textAlign: 'center' }}>No products found</p>
          )}
        </div>
      )}

      {/* FAB */}
      <button style={s.fab} onClick={() => navigate('/products/add')} title="Add Product">+</button>
    </div>
  );
}

const s = {
  page: { padding: 28, position: 'relative', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 },
  sub: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  statusBadge: { fontSize: 11, fontWeight: 700, color: '#8E8E93', letterSpacing: 1 },
  totalBadge: { backgroundColor: '#3498db20', color: '#3498db', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  headerRight: { display: 'flex', gap: 12, alignItems: 'center' },
  lowAlert: { fontSize: 13, color: '#FF3B30', fontWeight: 700, backgroundColor: '#FF3B3015', padding: '8px 14px', borderRadius: 10 },
  addBtn: { backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  search: { width: '100%', border: '1.5px solid #E5E5EA', borderRadius: 12, padding: '13px 18px', fontSize: 14, marginBottom: 20, backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTop: { marginBottom: 12 },
  cardLeft: {},
  nameRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 },
  productName: { fontSize: 17, fontWeight: 700, color: '#1a1a1a' },
  lowBadge: { backgroundColor: '#FF3B3020', color: '#FF3B30', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 },
  healthBadge: { backgroundColor: '#34C75920', color: '#34C759', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 },
  category: { fontSize: 13, color: '#8E8E93' },
  statsRow: { display: 'flex', gap: 32, marginBottom: 16 },
  stat: {},
  statLabel: { fontSize: 10, fontWeight: 700, color: '#AEAEB2', letterSpacing: 1, marginBottom: 4 },
  statVal: { fontSize: 16, fontWeight: 700, color: '#1a1a1a' },
  actions: { display: 'flex', gap: 10 },
  restockBtn: { flex: 1, backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  restockBtnRed: { backgroundColor: '#3498db' },
  editBtn: { width: 44, height: 44, backgroundColor: '#F2F2F7', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 16 },
  restockForm: { display: 'flex', gap: 10 },
  restockInput: { flex: 1, border: '1.5px solid #E5E5EA', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none' },
  confirmBtn: { backgroundColor: '#34C759', color: '#fff', border: 'none', borderRadius: 10, padding: '0 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  cancelRestockBtn: { backgroundColor: '#F2F2F7', color: '#1a1a1a', border: 'none', borderRadius: 10, padding: '0 14px', fontSize: 14, cursor: 'pointer' },
  fab: { position: 'fixed', bottom: 28, right: 28, width: 56, height: 56, borderRadius: '50%', backgroundColor: '#3498db', color: '#fff', border: 'none', fontSize: 28, cursor: 'pointer', boxShadow: '0 4px 16px rgba(52,152,219,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};
