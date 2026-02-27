import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { COLORS } from '../constants/colors';

const STEPS = [
  { key: 'placed', label: 'Order Placed', icon: '✅' },
  { key: 'packed', label: 'Packed', icon: '📦' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🛵' },
  { key: 'delivered', label: 'Delivered', icon: '🏠' },
];
const STATUS_INDEX = { placed: 0, packed: 1, out_for_delivery: 2, delivered: 3 };

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('orderId')) trackOrder(searchParams.get('orderId'));
  }, []);

  const trackOrder = async (id = orderId) => {
    if (!id.trim()) return setError('Please enter an Order ID');
    setError('');
    setLoading(true);
    try {
      const res = await ordersAPI.track(id.trim());
      setOrder(res.data);
    } catch {
      setError('Order not found. Please check your Order ID.');
      setOrder(null);
    }
    setLoading(false);
  };

  const currentStep = order ? (STATUS_INDEX[order.status] ?? 0) : -1;

  return (
    <div style={s.root}>
      <div style={s.banner}>
        <div style={s.bannerInner}>
          <h1 style={s.bannerTitle}>Track Your Order</h1>
          <p style={s.bannerSub}>Enter your Order ID to see live delivery updates from our Chichawatni store.</p>
        </div>
      </div>

      <div style={s.container}>
        {/* Search */}
        <div style={s.searchCard}>
          <div style={s.searchRow}>
            <input
              style={s.input}
              placeholder="Enter Order ID (e.g. SLX-9921)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && trackOrder()}
            />
            <button style={s.trackBtn} onClick={() => trackOrder()} disabled={loading}>
              {loading ? 'Searching...' : '🔍 Track Order'}
            </button>
          </div>
          {error && <p style={s.error}>{error}</p>}
        </div>

        {/* Result */}
        {order && (
          <div style={s.resultCard}>
            {/* Status */}
            <div style={s.statusRow}>
              <div>
                <p style={s.statusLabel}>CURRENT STATUS</p>
                <p style={s.statusTxt}>
                  {order.status === 'placed' ? 'Order Placed' :
                   order.status === 'packed' ? 'Packed & Ready' :
                   order.status === 'out_for_delivery' ? 'Out for Delivery 🛵' :
                   order.status === 'delivered' ? 'Delivered ✅' : 'Cancelled'}
                </p>
              </div>
              <span style={s.statusIcon}>{STEPS[currentStep]?.icon || '📦'}</span>
            </div>

            {/* Progress Steps */}
            <div style={s.stepsRow}>
              {STEPS.map((step, i) => {
                const done = i <= currentStep;
                return (
                  <React.Fragment key={step.key}>
                    <div style={s.stepItem}>
                      <div style={{ ...s.stepCircle, ...(done ? s.stepCircleDone : {}) }}>
                        {done ? '✓' : <span style={s.stepNum}>{i + 1}</span>}
                      </div>
                      <p style={{ ...s.stepLabel, ...(done ? s.stepLabelDone : {}) }}>{step.label}</p>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ ...s.stepLine, ...(i < currentStep ? s.stepLineDone : {}) }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Info Grid */}
            <div style={s.infoGrid}>
              <div style={s.infoCard}>
                <p style={s.infoLabel}>Order ID</p>
                <p style={s.infoVal}>{order.orderId}</p>
              </div>
              <div style={s.infoCard}>
                <p style={s.infoLabel}>Payment</p>
                <p style={s.infoVal}>{order.paymentMethod}</p>
              </div>
              <div style={s.infoCard}>
                <p style={s.infoLabel}>Total</p>
                <p style={{ ...s.infoVal, color: COLORS.primary }}>Rs. {order.total?.toLocaleString()}</p>
              </div>
              <div style={s.infoCard}>
                <p style={s.infoLabel}>Estimated Delivery</p>
                <p style={s.infoVal}>15–30 mins</p>
              </div>
            </div>

            {/* Address */}
            <div style={s.addressBox}>
              <p style={s.infoLabel}>📍 Delivery Address</p>
              <p style={s.addressVal}>{order.address}</p>
            </div>

            {/* Support */}
            <div style={s.supportBox}>
              <div>
                <p style={s.supportTitle}>Need help with your order?</p>
                <p style={s.supportSub}>Our Chichawatni support team is available on WhatsApp.</p>
              </div>
              <a
                href={`https://wa.me/923001234567?text=Hi, I need help with order #${order.orderId}`}
                target="_blank" rel="noreferrer"
                style={s.supportBtn}
              >
                💬 Contact Support
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '60vh' },
  banner: { backgroundColor: COLORS.primary, padding: '40px 20px' },
  bannerInner: { maxWidth: 800, margin: '0 auto' },
  bannerTitle: { fontSize: 32, fontWeight: 900, color: COLORS.white, marginBottom: 8 },
  bannerSub: { fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 },
  container: { maxWidth: 800, margin: '0 auto', padding: '32px 20px' },
  searchCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  searchRow: { display: 'flex', gap: 12 },
  input: { flex: 1, border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: '13px 16px', fontSize: 15, outline: 'none', textTransform: 'uppercase' },
  trackBtn: { backgroundColor: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: 10, padding: '0 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },
  error: { color: COLORS.error, fontSize: 13, marginTop: 10 },
  resultCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 24 },
  statusRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statusLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: 700, letterSpacing: 1.2, marginBottom: 6 },
  statusTxt: { fontSize: 24, fontWeight: 900, color: COLORS.primary },
  statusIcon: { fontSize: 48 },
  stepsRow: { display: 'flex', alignItems: 'center' },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  stepCircle: { width: 36, height: 36, borderRadius: '50%', backgroundColor: COLORS.lightGrey, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: COLORS.textMuted },
  stepCircleDone: { backgroundColor: COLORS.primary, color: COLORS.white },
  stepNum: { fontSize: 13, fontWeight: 700 },
  stepLabel: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', fontWeight: 500 },
  stepLabelDone: { color: COLORS.primary, fontWeight: 700 },
  stepLine: { flex: 1, height: 3, backgroundColor: COLORS.lightGrey, margin: '0 4px', marginBottom: 24 },
  stepLineDone: { backgroundColor: COLORS.primary },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  infoCard: { backgroundColor: COLORS.secondary, borderRadius: 12, padding: '14px 16px' },
  infoLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  infoVal: { fontSize: 15, fontWeight: 700, color: COLORS.text },
  addressBox: { backgroundColor: COLORS.secondary, borderRadius: 12, padding: '16px 18px' },
  addressVal: { fontSize: 14, color: COLORS.text, marginTop: 6, lineHeight: 1.5 },
  supportBox: { backgroundColor: '#E8F4FD', borderRadius: 12, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  supportTitle: { fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 4 },
  supportSub: { fontSize: 13, color: COLORS.textLight },
  supportBtn: { backgroundColor: '#25D366', color: COLORS.white, padding: '11px 20px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' },
};
