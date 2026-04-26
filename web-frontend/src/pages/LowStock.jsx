import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';

const LOW = 6;

export default function LowStock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restocking, setRestocking] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await productsAPI.getLowStock();
      setProducts(res.data);
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
      setProducts((prev) =>
        newStock > LOW
          ? prev.filter((p) => p._id !== id)
          : prev.map((p) => p._id === id ? { ...p, stock: newStock } : p)
      );
      setRestocking(null);
      setRestockQty('');
    } catch {}
  };

  const critical = products.filter((p) => p.stock === 0);
  const low = products.filter((p) => p.stock > 0 && p.stock <= LOW);

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>🔴 Low Stock</h1>
          <p style={s.sub}>Products with 6 or fewer units remaining</p>
        </div>
        <div style={s.badges}>
          {critical.length > 0 && (
            <span style={s.outBadge}>🚫 {critical.length} Out of Stock</span>
          )}
          <span style={s.lowBadge}>⚠️ {low.length} Low Stock</span>
          <span style={s.totalBadge}>{products.length} Total Alerts</span>
        </div>
      </div>

      {loading ? (
        <p style={s.empty}>Loading...</p>
      ) : products.length === 0 ? (
        <div style={s.emptyBox}>
          <p style={s.emptyIcon}>✅</p>
          <p style={s.emptyTitle}>All products are well stocked!</p>
          <p style={s.emptySub}>No product has 6 or fewer units remaining.</p>
        </div>
      ) : (
        <>
          {/* Out of Stock */}
          {critical.length > 0 && (
            <>
              <h2 style={s.groupTitle}>🚫 Out of Stock</h2>
              <div style={s.list}>
                {critical.map((p) => <ProductCard key={p._id} p={p} restocking={restocking} restockQty={restockQty} setRestocking={setRestocking} setRestockQty={setRestockQty} handleRestock={handleRestock} navigate={navigate} isCritical />)}
              </div>
            </>
          )}

          {/* Low Stock */}
          {low.length > 0 && (
            <>
              <h2 style={s.groupTitle}>⚠️ Low Stock (1–6 units)</h2>
              <div style={s.list}>
                {low.map((p) => <ProductCard key={p._id} p={p} restocking={restocking} restockQty={restockQty} setRestocking={setRestocking} setRestockQty={setRestockQty} handleRestock={handleRestock} navigate={navigate} />)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ProductCard({ p, restocking, restockQty, setRestocking, setRestockQty, handleRestock, navigate, isCritical }) {
  return (
    <div style={{ ...s.card, borderLeft: isCritical ? '4px solid #FF3B30' : '4px solid #FF9500', backgroundColor: isCritical ? '#fff8f8' : '#fffdf5' }}>
      <div style={s.cardMain}>
        <div style={s.info}>
          <div style={s.nameRow}>
            <h3 style={s.name}>{p.name}</h3>
            <span style={{ ...s.stockBadge, backgroundColor: isCritical ? '#FF3B30' : '#FF9500' }}>
              {isCritical ? '🚫 OUT OF STOCK' : `⚠️ ${p.stock} LEFT`}
            </span>
          </div>
          <p style={s.cat}>{p.category?.name}</p>
          <p style={s.price}>Rs. {p.price?.toLocaleString()}</p>
        </div>

        <div style={s.stockMeter}>
          <p style={s.meterLabel}>Stock Level</p>
          <p style={{ ...s.meterVal, color: isCritical ? '#FF3B30' : '#FF9500' }}>
            {p.stock} / 6 units
          </p>
          <div style={s.bar}>
            <div style={{
              ...s.barFill,
              width: `${Math.min((p.stock / 6) * 100, 100)}%`,
              backgroundColor: isCritical ? '#FF3B30' : '#FF9500',
            }} />
          </div>
        </div>
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
          <button style={s.confirmBtn} onClick={() => handleRestock(p._id)}>✓ Confirm</button>
          <button style={s.cancelBtn} onClick={() => { setRestocking(null); setRestockQty(''); }}>Cancel</button>
        </div>
      ) : (
        <div style={s.actions}>
          <button style={s.restockBtn} onClick={() => setRestocking(p._id)}>
            🛒 Restock Now
          </button>
          <button style={s.editBtn} onClick={() => navigate(`/products/edit/${p._id}`)}>
            ✏️ Edit
          </button>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { padding: 28, maxWidth: 1100, margin: '0 auto' },

  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 26, fontWeight: 800, color: '#FF3B30', marginBottom: 4 },
  sub: { fontSize: 14, color: '#8E8E93' },
  badges: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  outBadge: { backgroundColor: '#FF3B3020', color: '#FF3B30', fontWeight: 700, fontSize: 13, padding: '6px 14px', borderRadius: 20 },
  lowBadge: { backgroundColor: '#FF950020', color: '#FF9500', fontWeight: 700, fontSize: 13, padding: '6px 14px', borderRadius: 20 },
  totalBadge: { backgroundColor: '#f0f0f0', color: '#555', fontWeight: 700, fontSize: 13, padding: '6px 14px', borderRadius: 20 },

  groupTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 12, marginTop: 8 },

  list: { display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardMain: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 14, flexWrap: 'wrap' },

  info: { flex: 1 },
  nameRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 },
  name: { fontSize: 16, fontWeight: 700, color: '#1a1a1a' },
  stockBadge: { color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20 },
  cat: { fontSize: 13, color: '#8E8E93', marginBottom: 4 },
  price: { fontSize: 14, fontWeight: 600, color: '#1a1a1a' },

  stockMeter: { minWidth: 160 },
  meterLabel: { fontSize: 11, fontWeight: 700, color: '#8E8E93', letterSpacing: 0.5, marginBottom: 4 },
  meterVal: { fontSize: 20, fontWeight: 800, marginBottom: 8 },
  bar: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4, transition: 'width 0.3s' },

  actions: { display: 'flex', gap: 10 },
  restockBtn: { backgroundColor: '#FF3B30', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  editBtn: { backgroundColor: '#f0f0f0', border: 'none', borderRadius: 10, padding: '10px 16px', fontSize: 14, cursor: 'pointer' },

  restockForm: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  restockInput: { border: '1.5px solid #ddd', borderRadius: 8, padding: '8px 14px', fontSize: 14, width: 160, outline: 'none' },
  confirmBtn: { backgroundColor: '#34C759', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  cancelBtn: { background: 'none', border: '1px solid #ddd', borderRadius: 8, padding: '9px 14px', fontSize: 14, cursor: 'pointer', color: '#555' },

  empty: { color: '#8E8E93', padding: 40 },
  emptyBox: { textAlign: 'center', padding: '80px 20px' },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#8E8E93' },
};
