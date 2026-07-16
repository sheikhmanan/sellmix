import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';

export default function DailyDeals() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [saving, setSaving] = useState({});
  const [pendingExpiry, setPendingExpiry] = useState({});

  const loadDeals = async () => {
    setLoading(true);
    try {
      const res = await productsAPI.getAll({ limit: 500 });
      setDeals((res.data.products || []).filter((p) => p.isDailyDeal));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadDeals(); }, []);

  // Search: show all non-deal products on focus, filter by query when typing
  useEffect(() => {
    if (!inputFocused) return;
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const params = { limit: 50 };
        if (searchQ.trim()) params.search = searchQ.trim();
        const res = await productsAPI.getAll(params);
        const dealIds = new Set(deals.map((d) => d._id));
        setSearchResults((res.data.products || []).filter((p) => !dealIds.has(p._id)));
      } catch {}
      setSearching(false);
    }, searchQ.trim() ? 400 : 0);
    return () => clearTimeout(t);
  }, [searchQ, deals, inputFocused]);

  const setSavingFor = (id, val) => setSaving((prev) => ({ ...prev, [id]: val }));

  const addToDeal = async (product) => {
    setSavingFor(product._id, true);
    try {
      await productsAPI.updateDeal(product._id, true, null);
      setDeals((prev) => [...prev, { ...product, isDailyDeal: true, dealExpiresAt: null }]);
      setSearchResults((prev) => prev.filter((p) => p._id !== product._id));
      setSearchQ('');
      setInputFocused(false);
    } catch {}
    setSavingFor(product._id, false);
  };

  const removeFromDeal = async (product) => {
    if (!confirm(`Remove "${product.name}" from Daily Deals?`)) return;
    setSavingFor(product._id, true);
    try {
      await productsAPI.updateDeal(product._id, false, null);
      setDeals((prev) => prev.filter((p) => p._id !== product._id));
    } catch {}
    setSavingFor(product._id, false);
  };

  const saveExpiry = async (product) => {
    const newExpiry = pendingExpiry[product._id];
    setSavingFor(product._id, true);
    try {
      await productsAPI.updateDeal(product._id, true, newExpiry || null);
      setDeals((prev) => prev.map((p) => p._id === product._id ? { ...p, dealExpiresAt: newExpiry || null } : p));
      setPendingExpiry((prev) => { const n = { ...prev }; delete n[product._id]; return n; });
    } catch {}
    setSavingFor(product._id, false);
  };

  const cancelExpiryEdit = (id) => {
    setPendingExpiry((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };

  const isExpired = (p) => p.dealExpiresAt && new Date(p.dealExpiresAt) < new Date();
  const activeDeals = deals.filter((p) => !isExpired(p));
  const expiredDeals = deals.filter((p) => isExpired(p));

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Daily Deals</h1>
          <p style={s.subtitle}>
            <span style={s.statActive}>{activeDeals.length} active</span>
            {expiredDeals.length > 0 && <span style={s.statExpired}> · {expiredDeals.length} expired</span>}
          </p>
        </div>
      </div>

      {/* Add product panel */}
      <div style={s.addCard}>
        <p style={s.sectionLabel}>ADD PRODUCT TO DAILY DEALS</p>
        <input
          style={s.searchInput}
          placeholder="🔍  Click to browse or type to search products..."
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setTimeout(() => setInputFocused(false), 200)}
        />
        {searching && <p style={s.hint}>Loading...</p>}
        {!searching && inputFocused && searchResults.length === 0 && (
          <p style={s.hint}>No products found (or all are already daily deals).</p>
        )}
        {searchResults.length > 0 && (
          <div style={s.searchResults}>
            {searchResults.map((p) => (
              <div key={p._id} style={s.searchRow}>
                <div style={s.searchRowLeft}>
                  {p.images?.[0]
                    ? <img src={p.images[0]} alt={p.name} style={s.thumbSm} />
                    : <div style={s.noImgSm}>📦</div>
                  }
                  <div>
                    <p style={s.resultName}>{p.name}</p>
                    <p style={s.resultMeta}>
                      Rs. {p.price?.toLocaleString()}
                      {p.discountPrice > 0 && <span style={s.saleInline}> → Rs. {p.discountPrice.toLocaleString()}</span>}
                    </p>
                  </div>
                </div>
                <button
                  style={{ ...s.addDealBtn, opacity: saving[p._id] ? 0.6 : 1 }}
                  disabled={saving[p._id]}
                  onClick={() => addToDeal(p)}
                >
                  {saving[p._id] ? 'Adding…' : '+ Add as Deal'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <p style={s.hint}>Loading…</p>
      ) : (
        <>
          {/* Active deals table */}
          <div style={s.tableCard}>
            <p style={s.sectionLabel}>ACTIVE DEALS ({activeDeals.length})</p>
            {activeDeals.length === 0 ? (
              <p style={s.empty}>No active daily deals. Search above to add products.</p>
            ) : (
              <div style={s.scrollX}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['', 'Product', 'Price', 'Sale Price', 'Discount', 'Expires On', 'Actions'].map((h) => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeDeals.map((p) => {
                      const discPct = p.discountPrice > 0 ? Math.round((1 - p.discountPrice / p.price) * 100) : 0;
                      const isEditing = pendingExpiry[p._id] !== undefined;
                      const currentExpiry = p.dealExpiresAt ? p.dealExpiresAt.slice(0, 10) : '';
                      const expiryInputVal = isEditing ? pendingExpiry[p._id] : currentExpiry;
                      return (
                        <tr key={p._id} style={s.tr}>
                          <td style={s.td}>
                            {p.images?.[0]
                              ? <img src={p.images[0]} alt={p.name} style={s.thumb} />
                              : <div style={s.noImg}>📦</div>
                            }
                          </td>
                          <td style={s.td}>
                            <p style={s.productName}>{p.name}</p>
                            <p style={s.productCat}>{p.category?.name || ''}</p>
                          </td>
                          <td style={s.td}>Rs. {p.price?.toLocaleString()}</td>
                          <td style={s.td}>
                            {p.discountPrice > 0
                              ? <span style={s.saleBadge}>Rs. {p.discountPrice.toLocaleString()}</span>
                              : <span style={s.dash}>—</span>
                            }
                          </td>
                          <td style={s.td}>
                            {discPct > 0
                              ? <span style={s.discBadge}>{discPct}% off</span>
                              : <span style={s.dash}>—</span>
                            }
                          </td>
                          <td style={s.td}>
                            <div style={s.expiryCell}>
                              <input
                                type="date"
                                style={s.dateInput}
                                value={expiryInputVal}
                                onChange={(e) => setPendingExpiry((prev) => ({ ...prev, [p._id]: e.target.value }))}
                              />
                              {isEditing && (
                                <>
                                  <button
                                    style={s.saveExpBtn}
                                    disabled={saving[p._id]}
                                    onClick={() => saveExpiry(p)}
                                  >
                                    {saving[p._id] ? '…' : '✓'}
                                  </button>
                                  <button style={s.cancelExpBtn} onClick={() => cancelExpiryEdit(p._id)}>✕</button>
                                </>
                              )}
                              {!isEditing && !p.dealExpiresAt && (
                                <span style={s.noExpiry}>No expiry</span>
                              )}
                            </div>
                          </td>
                          <td style={s.td}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button style={s.editBtn} onClick={() => navigate(`/products/edit/${p._id}`)}>✏️ Edit</button>
                              <button
                                style={{ ...s.removeBtn, opacity: saving[p._id] ? 0.6 : 1 }}
                                disabled={saving[p._id]}
                                onClick={() => removeFromDeal(p)}
                              >
                                {saving[p._id] ? '…' : '✕ Remove'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Expired deals table */}
          {expiredDeals.length > 0 && (
            <div style={{ ...s.tableCard, marginTop: 16 }}>
              <p style={{ ...s.sectionLabel, color: '#FF3B30' }}>EXPIRED DEALS ({expiredDeals.length})</p>
              <p style={s.expiredNote}>These deals have passed their expiry date. Remove them or set a new expiry date from the Edit Product page.</p>
              <div style={s.scrollX}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {['', 'Product', 'Price', 'Sale Price', 'Expired On', 'Actions'].map((h) => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {expiredDeals.map((p) => (
                      <tr key={p._id} style={{ ...s.tr, backgroundColor: '#FFF5F5' }}>
                        <td style={s.td}>
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt={p.name} style={{ ...s.thumb, opacity: 0.55 }} />
                            : <div style={s.noImg}>📦</div>
                          }
                        </td>
                        <td style={s.td}>
                          <p style={{ ...s.productName, color: '#888' }}>{p.name}</p>
                          <span style={s.expiredBadge}>EXPIRED</span>
                        </td>
                        <td style={s.td}>Rs. {p.price?.toLocaleString()}</td>
                        <td style={s.td}>
                          {p.discountPrice > 0
                            ? <span style={s.saleBadge}>Rs. {p.discountPrice.toLocaleString()}</span>
                            : <span style={s.dash}>—</span>
                          }
                        </td>
                        <td style={s.td}>
                          <span style={{ color: '#FF3B30', fontSize: 13, fontWeight: 600 }}>
                            {new Date(p.dealExpiresAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td style={s.td}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button style={s.editBtn} onClick={() => navigate(`/products/edit/${p._id}`)}>✏️ Edit</button>
                            <button
                              style={{ ...s.removeBtn, opacity: saving[p._id] ? 0.6 : 1 }}
                              disabled={saving[p._id]}
                              onClick={() => removeFromDeal(p)}
                            >
                              {saving[p._id] ? '…' : '✕ Remove'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const s = {
  page: { padding: 28 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 },
  subtitle: { fontSize: 14, fontWeight: 600 },
  statActive: { color: '#34C759' },
  statExpired: { color: '#FF3B30' },

  addCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: '#8E8E93', letterSpacing: 1, marginBottom: 12 },
  searchInput: { width: '100%', border: '1.5px solid #E5E5EA', borderRadius: 10, padding: '12px 16px', fontSize: 14, outline: 'none', backgroundColor: '#f5f6f3', boxSizing: 'border-box' },
  hint: { fontSize: 13, color: '#AEAEB2', marginTop: 10 },

  searchResults: { marginTop: 12, border: '1.5px solid #E5E5EA', borderRadius: 12, overflow: 'hidden' },
  searchRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #F2F2F7', backgroundColor: '#fff' },
  searchRowLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  thumbSm: { width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 },
  noImgSm: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  resultName: { fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 2 },
  resultMeta: { fontSize: 12, color: '#8E8E93' },
  saleInline: { color: '#e74c3c', fontWeight: 700 },
  addDealBtn: { backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },

  tableCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  scrollX: { overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
  table: { width: '100%', minWidth: 760, borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#8E8E93', letterSpacing: 1, borderBottom: '1px solid #F2F2F7', backgroundColor: '#FAFAFA', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #F2F2F7' },
  td: { padding: '12px 16px', fontSize: 14, color: '#1a1a1a', verticalAlign: 'middle' },
  thumb: { width: 48, height: 48, borderRadius: 8, objectFit: 'cover' },
  noImg: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 },
  productName: { fontWeight: 600, marginBottom: 2 },
  productCat: { fontSize: 12, color: '#8E8E93' },
  saleBadge: { backgroundColor: '#34C75920', color: '#34C759', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 },
  discBadge: { backgroundColor: '#e74c3c20', color: '#e74c3c', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 },
  dash: { color: '#C7C7CC' },

  expiryCell: { display: 'flex', alignItems: 'center', gap: 6 },
  dateInput: { border: '1.5px solid #E5E5EA', borderRadius: 8, padding: '6px 10px', fontSize: 13, outline: 'none', backgroundColor: '#f5f6f3', cursor: 'pointer' },
  saveExpBtn: { backgroundColor: '#34C759', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  cancelExpBtn: { backgroundColor: '#F2F2F7', color: '#8E8E93', border: 'none', borderRadius: 6, padding: '5px 8px', fontSize: 13, cursor: 'pointer' },
  noExpiry: { fontSize: 12, color: '#AEAEB2', fontStyle: 'italic' },

  editBtn: { backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },
  removeBtn: { backgroundColor: '#FF3B3015', color: '#FF3B30', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },

  empty: { fontSize: 14, color: '#AEAEB2', textAlign: 'center', padding: '32px 0' },
  expiredNote: { fontSize: 13, color: '#8E8E93', marginBottom: 12 },
  expiredBadge: { display: 'inline-block', backgroundColor: '#FF3B3020', color: '#FF3B30', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, marginTop: 2 },
};
