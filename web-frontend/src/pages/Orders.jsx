import { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';

const STATUSES = ['placed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];
const STATUS_COLORS = { placed: '#FF9500', packed: '#9B59B6', out_for_delivery: '#3498db', delivered: '#34C759', cancelled: '#FF3B30' };
const STATUS_LABELS = { placed: 'Pending', packed: 'Packed', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' };
const PAYMENT_COLORS = { COD: '#FF9500', JazzCash: '#E74C3C', EasyPaisa: '#27AE60' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [expanded, setExpanded] = useState(null); // order _id that is expanded

  useEffect(() => { load(); }, [filter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = filter ? { status: filter } : {};
      const res = await ordersAPI.getAll(params);
      setOrders(res.data.orders);
      setTotal(res.data.total);
    } catch {}
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await ordersAPI.updateStatus(id, status);
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o));
    } catch {}
  };

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Orders</h1>
          <p style={s.sub}>{total} total orders</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={s.tabs}>
        <button style={{ ...s.tab, ...(filter === '' ? s.tabActive : {}) }} onClick={() => setFilter('')}>All</button>
        {STATUSES.map((st) => (
          <button
            key={st}
            style={{ ...s.tab, ...(filter === st ? { ...s.tabActive, backgroundColor: STATUS_COLORS[st] + '20', color: STATUS_COLORS[st] } : {}) }}
            onClick={() => setFilter(st)}
          >
            {STATUS_LABELS[st]}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#8E8E93', padding: 24 }}>Loading orders...</p>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['', 'Order ID', 'Customer', 'WhatsApp', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Action'].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <>
                  {/* Main order row */}
                  <tr
                    key={o._id}
                    style={{ ...s.tr, backgroundColor: expanded === o._id ? '#f0f7ff' : '#fff', cursor: 'pointer' }}
                    onClick={() => toggle(o._id)}
                  >
                    {/* Expand toggle */}
                    <td style={{ ...s.td, width: 32, textAlign: 'center', fontSize: 16, color: '#3498db' }}>
                      {expanded === o._id ? '▼' : '▶'}
                    </td>
                    <td style={s.td}><b style={{ color: '#3498db' }}>#{o.orderId}</b></td>
                    <td style={s.td}>
                      <p style={{ fontWeight: 600, marginBottom: 2 }}>{o.customerName}</p>
                      <p style={{ fontSize: 12, color: '#8E8E93' }}>{o.address?.slice(0, 28)}{o.address?.length > 28 ? '…' : ''}</p>
                    </td>
                    <td style={s.td}>{o.whatsapp}</td>
                    <td style={s.td}>
                      <span style={s.itemCountBadge}>{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</span>
                    </td>
                    <td style={s.td}><b>Rs. {o.total?.toLocaleString()}</b></td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, backgroundColor: (PAYMENT_COLORS[o.paymentMethod] || '#8E8E93') + '20', color: PAYMENT_COLORS[o.paymentMethod] || '#8E8E93' }}>
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, backgroundColor: STATUS_COLORS[o.status] + '20', color: STATUS_COLORS[o.status] }}>
                        {STATUS_LABELS[o.status]}
                      </span>
                    </td>
                    <td style={s.td}>{new Date(o.createdAt).toLocaleDateString('en-PK')}</td>
                    <td style={s.td} onClick={(e) => e.stopPropagation()}>
                      <select
                        style={s.select}
                        value={o.status}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                      >
                        {STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABELS[st]}</option>)}
                      </select>
                    </td>
                  </tr>

                  {/* Expanded items row */}
                  {expanded === o._id && (
                    <tr key={`${o._id}-items`} style={{ backgroundColor: '#f0f7ff' }}>
                      <td colSpan={10} style={{ padding: '0 16px 16px 48px' }}>
                        <div style={s.itemsBox}>
                          {/* Items table */}
                          <p style={s.itemsTitle}>🛒 Order Items</p>
                          <table style={s.itemsTable}>
                            <thead>
                              <tr style={{ backgroundColor: '#e8f1fb' }}>
                                <th style={s.ith}>Product</th>
                                <th style={{ ...s.ith, textAlign: 'center' }}>Qty</th>
                                <th style={{ ...s.ith, textAlign: 'right' }}>Unit Price</th>
                                <th style={{ ...s.ith, textAlign: 'right' }}>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {o.items?.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #dbeafe' }}>
                                  <td style={s.itd}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                      {item.image
                                        ? <img src={item.image} alt={item.name} style={s.itemThumb} />
                                        : <div style={s.itemThumbPlaceholder}>🛒</div>}
                                      <div>
                                        <p style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                                        {item.weight && <p style={{ fontSize: 12, color: '#8E8E93' }}>{item.weight}</p>}
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ ...s.itd, textAlign: 'center' }}>
                                    <span style={s.qtyChip}>{item.quantity}</span>
                                  </td>
                                  <td style={{ ...s.itd, textAlign: 'right', color: '#3498db', fontWeight: 600 }}>
                                    Rs. {item.price?.toLocaleString()}
                                  </td>
                                  <td style={{ ...s.itd, textAlign: 'right', fontWeight: 700 }}>
                                    Rs. {(item.price * item.quantity)?.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Order summary footer */}
                          <div style={s.orderSummary}>
                            <div style={s.summaryLeft}>
                              <p style={s.summaryNote}>📍 <b>Address:</b> {o.address}, {o.city}</p>
                              {o.notes && <p style={s.summaryNote}>📝 <b>Notes:</b> {o.notes}</p>}
                              {o.promoCode && <p style={s.summaryNote}>🏷️ <b>Promo:</b> {o.promoCode}</p>}
                            </div>
                            <div style={s.summaryRight}>
                              <div style={s.summaryRow}><span>Subtotal</span><span>Rs. {o.subtotal?.toLocaleString()}</span></div>
                              <div style={s.summaryRow}><span>Delivery Fee</span><span>Rs. {o.deliveryFee?.toLocaleString()}</span></div>
                              {o.discount > 0 && <div style={{ ...s.summaryRow, color: '#34C759' }}><span>Discount</span><span>- Rs. {o.discount?.toLocaleString()}</span></div>}
                              <div style={{ ...s.summaryRow, fontWeight: 800, fontSize: 15, borderTop: '1.5px solid #dbeafe', paddingTop: 8, marginTop: 4 }}>
                                <span>Total</span><span style={{ color: '#3498db' }}>Rs. {o.total?.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {!orders.length && (
                <tr><td colSpan={10} style={{ ...s.td, textAlign: 'center', color: '#8E8E93', padding: 40 }}>No orders found</td></tr>
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 800, color: '#1a1a1a' },
  sub: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  tabs: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  tab: { padding: '8px 18px', borderRadius: 20, border: '1.5px solid #E5E5EA', backgroundColor: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#6B6B6B' },
  tabActive: { backgroundColor: '#3498db20', color: '#3498db', borderColor: '#3498db' },
  tableWrap: { backgroundColor: '#fff', borderRadius: 16, overflow: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 980 },
  th: { textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, color: '#8E8E93', letterSpacing: 1, borderBottom: '1px solid #F2F2F7', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #F2F2F7', transition: 'background 0.15s' },
  td: { padding: '14px 16px', fontSize: 14, color: '#1a1a1a', verticalAlign: 'middle' },
  badge: { padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' },
  itemCountBadge: { backgroundColor: '#EBF5FF', color: '#3498db', fontWeight: 700, fontSize: 12, padding: '3px 10px', borderRadius: 20 },
  select: { border: '1.5px solid #E5E5EA', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer', outline: 'none' },

  // Expanded items section
  itemsBox: { backgroundColor: '#fff', borderRadius: 12, border: '1.5px solid #dbeafe', overflow: 'hidden' },
  itemsTitle: { fontSize: 13, fontWeight: 700, color: '#1a1a1a', padding: '12px 16px', borderBottom: '1px solid #dbeafe', backgroundColor: '#f8fbff' },
  itemsTable: { width: '100%', borderCollapse: 'collapse' },
  ith: { padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'left' },
  itd: { padding: '12px 16px', fontSize: 14, color: '#1a1a1a', verticalAlign: 'middle' },
  itemThumb: { width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 },
  itemThumbPlaceholder: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  qtyChip: { backgroundColor: '#EBF5FF', color: '#3498db', fontWeight: 700, fontSize: 13, padding: '3px 12px', borderRadius: 20, display: 'inline-block' },

  orderSummary: { display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderTop: '1px solid #dbeafe', gap: 20, flexWrap: 'wrap', backgroundColor: '#f8fbff' },
  summaryLeft: { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  summaryNote: { fontSize: 13, color: '#4b5563' },
  summaryRight: { minWidth: 220, display: 'flex', flexDirection: 'column', gap: 6 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4b5563' },
};
