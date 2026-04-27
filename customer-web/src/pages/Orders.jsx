import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

const STATUS_CONFIG = {
  placed:           { label: 'Pending',          color: COLORS.warning,  bg: '#FFF8E1' },
  packed:           { label: 'Packed',            color: '#9B59B6',       bg: '#F4EDFB' },
  out_for_delivery: { label: 'Out for Delivery',  color: COLORS.primary,  bg: '#E8F4FD' },
  delivered:        { label: 'Delivered',         color: COLORS.success,  bg: '#E8F8F0' },
  cancelled:        { label: 'Cancelled',         color: COLORS.error,    bg: '#FEECEC' },
};

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    ordersAPI.getMyOrders()
      .then((r) => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return (
    <div style={s.center}>
      <p style={s.bigIcon}>📦</p>
      <h2 style={s.emptyTitle}>Login to view your orders</h2>
      <p style={s.emptySub}>Track and manage all your SellMix orders in one place.</p>
      <Link to="/login" style={s.loginBtn}>Login</Link>
    </div>
  );

  if (loading) return <div style={s.center}><p>Loading your orders...</p></div>;

  return (
    <div style={s.root}>
      <div style={s.banner}>
        <div style={s.bannerInner}>
          <h1 style={s.bannerTitle}>My Orders</h1>
          <p style={s.bannerSub}>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </div>
      </div>

      <div style={s.container}>
        {orders.length === 0 ? (
          <div style={s.emptyWrap}>
            <p style={s.bigIcon}>📦</p>
            <h2 style={s.emptyTitle}>No orders yet</h2>
            <p style={s.emptySub}>Start shopping and your orders will appear here.</p>
            <Link to="/products" style={s.shopBtn}>Start Shopping</Link>
          </div>
        ) : (
          <div style={s.ordersList}>
            {orders.map((order) => {
              const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
              return (
                <div key={order._id} style={s.orderCard}>
                  <div style={s.cardTop}>
                    <div>
                      <p style={s.orderId}>#{order.orderId}</p>
                      <p style={s.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <span style={{ ...s.statusBadge, backgroundColor: st.bg, color: st.color }}>{st.label}</span>
                  </div>

                  {/* Items list */}
                  <div style={s.itemsList}>
                    {order.items?.map((item, i) => (
                      <div key={i} style={s.itemRow}>
                        <div style={s.itemImgBox}>
                          {item.image
                            ? <img src={item.image} alt={item.name} style={s.itemImg} />
                            : <span style={{ fontSize: 18 }}>🛒</span>}
                        </div>
                        <div style={s.itemInfo}>
                          <p style={s.itemName}>{item.name}</p>
                          {item.weight && <p style={s.itemWeight}>{item.weight}</p>}
                          <p style={s.itemQty}>Qty: {item.quantity}</p>
                        </div>
                        <p style={s.itemPrice}>Rs. {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  {/* Order summary */}
                  <div style={s.summaryBox}>
                    <div style={s.summaryRow}>
                      <span style={s.summaryLabel}>Subtotal</span>
                      <span style={s.summaryVal}>Rs. {order.subtotal?.toLocaleString()}</span>
                    </div>
                    {order.discount > 0 && (
                      <div style={s.summaryRow}>
                        <span style={s.summaryLabel}>Discount</span>
                        <span style={{ ...s.summaryVal, color: COLORS.success }}>− Rs. {order.discount?.toLocaleString()}</span>
                      </div>
                    )}
                    <div style={s.summaryRow}>
                      <span style={s.summaryLabel}>Delivery Fee</span>
                      <span style={s.summaryVal}>Rs. {order.deliveryFee?.toLocaleString()}</span>
                    </div>
                    <div style={{ ...s.summaryRow, borderTop: `1px solid ${COLORS.lightGrey}`, paddingTop: 10, marginTop: 4 }}>
                      <span style={s.totalLabel}>Total</span>
                      <span style={s.totalAmt}>Rs. {order.total?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={s.cardFooter}>
                    <p style={s.payMethod}>💳 {order.paymentMethod}</p>
                    <button
                      style={s.trackBtn}
                      onClick={() => navigate(`/track?orderId=${order.orderId}`)}
                    >
                      Track Order →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '60vh', backgroundColor: COLORS.secondary },
  banner: { backgroundColor: '#111827', padding: '32px 20px' },
  bannerInner: { maxWidth: 1200, margin: '0 auto' },
  bannerTitle: { fontSize: 28, fontWeight: 800, color: COLORS.white, marginBottom: 6 },
  bannerSub: { fontSize: 14, color: '#aaa' },
  container: { maxWidth: 900, margin: '0 auto', padding: '32px 20px' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12, padding: 20 },
  bigIcon: { fontSize: 64 },
  emptyTitle: { fontSize: 22, fontWeight: 700, color: COLORS.text },
  emptySub: { fontSize: 15, color: COLORS.textLight },
  loginBtn: { backgroundColor: COLORS.primary, color: COLORS.white, padding: '13px 32px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 15 },
  emptyWrap: { textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  shopBtn: { backgroundColor: COLORS.primary, color: COLORS.white, padding: '13px 32px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 15, marginTop: 8 },
  ordersList: { display: 'flex', flexDirection: 'column', gap: 14 },
  orderCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  orderId: { fontSize: 16, fontWeight: 800, color: COLORS.text, marginBottom: 4 },
  orderDate: { fontSize: 13, color: COLORS.textMuted },
  statusBadge: { padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 },
  // Items list
  itemsList: { borderTop: `1px solid ${COLORS.lightGrey}`, paddingTop: 14, marginBottom: 12 },
  itemRow: { display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: 12, marginBottom: 12, borderBottom: `1px solid #f5f5f5` },
  itemImgBox: { width: 52, height: 52, borderRadius: 10, backgroundColor: COLORS.lightGrey, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemImg: { width: '100%', height: '100%', objectFit: 'contain' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 2 },
  itemWeight: { fontSize: 12, color: COLORS.primary, fontWeight: 600, marginBottom: 2 },
  itemQty: { fontSize: 12, color: COLORS.textMuted },
  itemPrice: { fontSize: 14, fontWeight: 700, color: COLORS.text, whiteSpace: 'nowrap' },
  // Summary
  summaryBox: { backgroundColor: COLORS.secondary, borderRadius: 10, padding: '12px 14px', marginBottom: 14 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: COLORS.textLight },
  summaryVal: { fontSize: 13, fontWeight: 600, color: COLORS.text },
  totalLabel: { fontSize: 15, fontWeight: 800, color: COLORS.text },
  totalAmt: { fontSize: 16, fontWeight: 800, color: COLORS.primary },
  // Footer
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  payMethod: { fontSize: 13, color: COLORS.textMuted, fontWeight: 500 },
  trackBtn: { backgroundColor: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
};
