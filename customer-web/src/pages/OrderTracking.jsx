import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { COLORS } from '../constants/colors';

const STATUS_SOUNDS = {
  packed:           'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
  out_for_delivery: 'https://assets.mixkit.co/active_storage/sfx/2867/2867-preview.mp3',
  delivered:        'https://assets.mixkit.co/active_storage/sfx/2866/2866-preview.mp3',
  cancelled:        'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3',
};

function playStatusSound(status) {
  const url = STATUS_SOUNDS[status];
  if (!url) return;
  try {
    const audio = new Audio(url);
    audio.volume = 0.8;
    audio.play().catch(() => {});
  } catch (_) {}
}

const STEPS = [
  { key: 'placed', label: 'Order\nPlaced' },
  { key: 'packed', label: 'Packed' },
  { key: 'out_for_delivery', label: 'Out for\nDelivery' },
  { key: 'delivered', label: 'Delivered' },
];
const STATUS_INDEX = { placed: 0, packed: 1, out_for_delivery: 2, delivered: 3 };
const STATUS_ICONS = { placed: '✅', packed: '📦', out_for_delivery: '🛵', delivered: '🏠' };

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

export default function OrderTracking() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const prevStatusRef = useRef(null);
  const pollRef = useRef(null);
  const trackingIdRef = useRef('');

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const pollStatus = useCallback(async () => {
    const id = trackingIdRef.current;
    if (!id) return;
    try {
      const res = await ordersAPI.track(id);
      const newStatus = res.data?.status;
      setOrder(res.data);
      if (prevStatusRef.current && newStatus && newStatus !== prevStatusRef.current) {
        playStatusSound(newStatus);
        prevStatusRef.current = newStatus;
        if (newStatus === 'delivered') stopPolling();
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (searchParams.get('orderId')) trackOrder(searchParams.get('orderId'));
    return () => stopPolling();
  }, []);

  const trackOrder = async (id = orderId) => {
    if (!id.trim()) return setError('Please enter an Order ID');
    setError('');
    stopPolling();
    setLoading(true);
    try {
      const res = await ordersAPI.track(id.trim());
      setOrder(res.data);
      prevStatusRef.current = res.data?.status;
      trackingIdRef.current = id.trim();
      if (res.data?.status !== 'delivered' && res.data?.status !== 'cancelled') {
        pollRef.current = setInterval(pollStatus, 15000);
      }
    } catch {
      setError('Order not found. Please check your Order ID.');
      setOrder(null);
    }
    setLoading(false);
  };

  const currentStep = order ? (STATUS_INDEX[order.status] ?? 0) : -1;
  const statusText = order
    ? (order.status === 'placed' ? 'Order Placed' :
       order.status === 'packed' ? 'Packed & Ready' :
       order.status === 'out_for_delivery' ? 'Out for Delivery 🛵' :
       order.status === 'delivered' ? 'Delivered ✅' : 'Cancelled')
    : '';

  // ── Mobile layout ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={m.root}>
        {/* Header */}
        <div style={m.header}>
          <button style={m.backBtn} onClick={() => navigate(-1)}>←</button>
          <span style={m.headerTitle}>SellMix Tracking</span>
          <div style={{ width: 36 }} />
        </div>

        <div style={m.scrollArea}>
          {/* Hero text */}
          <div style={m.hero}>
            <p style={m.heroTitle}>Track your delivery</p>
            <p style={m.heroSub}>Enter your Order ID to see live updates from our Chichawatni store.</p>
          </div>

          {/* Search */}
          <div style={m.searchCard}>
            <input
              style={m.input}
              placeholder="Enter Order ID (e.g. SLX-9921)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && trackOrder()}
            />
            <button style={m.trackBtn} onClick={() => trackOrder()} disabled={loading}>
              {loading ? 'Searching...' : 'Track Order'}
            </button>
            {error && <p style={m.error}>{error}</p>}
          </div>

          {/* Result */}
          {order && (
            <>
              {/* Status card */}
              <div style={m.card}>
                <p style={m.statusLabel}>CURRENT STATUS</p>
                <div style={m.statusRow}>
                  <p style={m.statusTxt}>{statusText}</p>
                  <span style={m.statusIcon}>{STATUS_ICONS[order.status] || '📦'}</span>
                </div>

                {/* Progress */}
                <div style={m.stepsRow}>
                  {STEPS.map((step, i) => {
                    const done = i <= currentStep;
                    return (
                      <React.Fragment key={step.key}>
                        <div style={m.stepItem}>
                          <div style={{ ...m.stepCircle, ...(done ? m.stepCircleDone : {}) }}>
                            {done ? '✓' : <span style={{ fontSize: 11 }}>{i + 1}</span>}
                          </div>
                          <p style={{ ...m.stepLabel, ...(done ? m.stepLabelDone : {}) }}>
                            {step.label.split('\n').map((l, j) => <span key={j} style={{ display: 'block' }}>{l}</span>)}
                          </p>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div style={{ ...m.stepLine, ...(i < currentStep ? m.stepLineDone : {}) }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Delivery slot + area */}
                <div style={m.infoRow}>
                  <div style={m.infoBox}>
                    <p style={m.infoLabel}>Delivery Slot</p>
                    <p style={m.infoVal}>
                      {order.deliverySlot?.slot
                        ? `${order.deliverySlot.date} · ${order.deliverySlot.slot}`
                        : 'Scheduled'}
                    </p>
                  </div>
                  <div style={m.infoBox}>
                    <p style={m.infoLabel}>Delivery Area</p>
                    <p style={m.infoVal}>Chichawatni</p>
                  </div>
                </div>
              </div>

              {/* Details list */}
              <div style={m.card}>
                <div style={m.detailRow}>
                  <span style={m.detailKey}>🔢 Order ID</span>
                  <span style={m.detailVal}>{order.orderId}</span>
                </div>
                <div style={m.detailRow}>
                  <span style={m.detailKey}>💳 Payment</span>
                  <span style={m.detailVal}>{order.paymentMethod}</span>
                </div>
                <div style={m.detailRow}>
                  <span style={m.detailKey}>💰 Total</span>
                  <span style={{ ...m.detailVal, color: COLORS.primary }}>Rs. {order.total?.toLocaleString()}</span>
                </div>
                <div style={{ ...m.detailRow, borderBottom: 'none' }}>
                  <span style={m.detailKey}>📍 Address</span>
                  <span style={m.detailVal}>{order.address}</span>
                </div>
              </div>

              {/* Need help */}
              <div style={m.helpCard}>
                <div>
                  <p style={m.helpTitle}>Need help?</p>
                  <p style={m.helpSub}>Contact our Chichawatni support team.</p>
                </div>
                <a
                  href={`https://wa.me/923178384342?text=Hi, I need help with order #${order.orderId}`}
                  target="_blank" rel="noreferrer"
                  style={m.helpBtn}
                >
                  Contact
                </a>
              </div>
            </>
          )}

          <div style={{ height: 30 }} />
        </div>
      </div>
    );
  }

  // ── Desktop layout ────────────────────────────────────────────────────────
  return (
    <div style={s.root}>
      <div style={s.banner}>
        <div style={s.bannerInner}>
          <h1 style={s.bannerTitle}>Track Your Order</h1>
          <p style={s.bannerSub}>Enter your Order ID to see live delivery updates from our Chichawatni store.</p>
        </div>
      </div>

      <div style={s.container}>
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

        {order && (
          <div style={s.resultCard}>
            <div style={s.statusRow}>
              <div>
                <p style={s.statusLabel}>CURRENT STATUS</p>
                <p style={s.statusTxt}>{statusText}</p>
              </div>
              <span style={s.statusIcon}>{STATUS_ICONS[order.status] || '📦'}</span>
            </div>

            <div style={s.stepsRow}>
              {STEPS.map((step, i) => {
                const done = i <= currentStep;
                return (
                  <React.Fragment key={step.key}>
                    <div style={s.stepItem}>
                      <div style={{ ...s.stepCircle, ...(done ? s.stepCircleDone : {}) }}>
                        {done ? '✓' : <span style={s.stepNum}>{i + 1}</span>}
                      </div>
                      <p style={{ ...s.stepLabel, ...(done ? s.stepLabelDone : {}) }}>{step.label.replace('\n', ' ')}</p>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ ...s.stepLine, ...(i < currentStep ? s.stepLineDone : {}) }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

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
                <p style={s.infoLabel}>Delivery Slot</p>
                <p style={s.infoVal}>
                  {order.deliverySlot?.slot
                    ? `${order.deliverySlot.date} · ${order.deliverySlot.slot}`
                    : 'Scheduled'}
                </p>
              </div>
            </div>

            <div style={s.addressBox}>
              <p style={s.infoLabel}>📍 Delivery Address</p>
              <p style={s.addressVal}>{order.address}</p>
            </div>

            <div style={s.supportBox}>
              <div>
                <p style={s.supportTitle}>Need help with your order?</p>
                <p style={s.supportSub}>Our Chichawatni support team is available on WhatsApp.</p>
              </div>
              <a
                href={`https://wa.me/923178384342?text=Hi, I need help with order #${order.orderId}`}
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

// ── Mobile styles ─────────────────────────────────────────────────────────────
const m = {
  root: { minHeight: '100vh', backgroundColor: '#f5f5f5' },
  header: { position: 'sticky', top: 0, zIndex: 50, backgroundColor: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' },
  backBtn: { width: 36, height: 36, borderRadius: '50%', backgroundColor: COLORS.primary, color: '#fff', border: 'none', fontSize: 18, fontWeight: 700, cursor: 'pointer' },
  headerTitle: { fontSize: 17, fontWeight: 800, color: '#1a1a1a' },
  scrollArea: { padding: '0 14px' },
  hero: { paddingTop: 20, paddingBottom: 16 },
  heroTitle: { fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 },
  heroSub: { fontSize: 13, color: '#888', lineHeight: 1.6 },
  searchCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  input: { width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', textTransform: 'uppercase', boxSizing: 'border-box', marginBottom: 10 },
  trackBtn: { width: '100%', padding: '13px', backgroundColor: COLORS.primary, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  error: { color: '#e74c3c', fontSize: 13, marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: '16px', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  statusLabel: { fontSize: 10, fontWeight: 800, color: '#aaa', letterSpacing: 1.2, marginBottom: 6, textTransform: 'uppercase' },
  statusRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  statusTxt: { fontSize: 20, fontWeight: 900, color: COLORS.primary },
  statusIcon: { fontSize: 36 },
  stepsRow: { display: 'flex', alignItems: 'center', marginBottom: 16 },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 },
  stepCircle: { width: 28, height: 28, borderRadius: '50%', backgroundColor: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#aaa', flexShrink: 0 },
  stepCircleDone: { backgroundColor: COLORS.primary, color: '#fff' },
  stepLabel: { fontSize: 10, color: '#aaa', textAlign: 'center', fontWeight: 500, lineHeight: 1.3 },
  stepLabelDone: { color: COLORS.primary, fontWeight: 700 },
  stepLine: { flex: 1, height: 2, backgroundColor: '#e8e8e8', margin: '0 3px', marginBottom: 28 },
  stepLineDone: { backgroundColor: COLORS.primary },
  infoRow: { display: 'flex', gap: 10 },
  infoBox: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 10, padding: '12px 14px' },
  infoLabel: { fontSize: 11, color: '#aaa', fontWeight: 600, marginBottom: 4 },
  infoVal: { fontSize: 15, fontWeight: 700, color: '#1a1a1a' },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #f0f0f0' },
  detailKey: { fontSize: 14, color: '#555' },
  detailVal: { fontSize: 14, fontWeight: 600, color: '#1a1a1a', textAlign: 'right', maxWidth: '55%' },
  helpCard: { backgroundColor: '#fff', borderRadius: 14, padding: '14px 16px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  helpTitle: { fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 },
  helpSub: { fontSize: 12, color: '#888' },
  helpBtn: { backgroundColor: COLORS.primary, color: '#fff', padding: '9px 18px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 13, flexShrink: 0 },
};

// ── Desktop styles ────────────────────────────────────────────────────────────
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
