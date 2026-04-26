import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI, productsAPI } from '../services/api';
import StatCard from '../components/StatCard';

const STATUS_COLORS = { placed: '#FF9500', packed: '#9B59B6', out_for_delivery: '#3498db', delivered: '#34C759', cancelled: '#FF3B30' };
const STATUS_LABELS = { placed: 'Pending', packed: 'Packed', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' };

function makeBeepUrl() {
  const rate = 22050;
  const freqs = [880, 1100, 1320];
  const noteSec = 0.15;
  const gapSec = 0.05;
  const step = noteSec + gapSec;
  const n = Math.ceil(rate * freqs.length * step);
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const wr = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  wr(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true);
  wr(8, 'WAVE'); wr(12, 'fmt '); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  wr(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    const b = Math.floor(t / step);
    const tNote = t - b * step;
    let sample = 0;
    if (b < freqs.length && tNote < noteSec) {
      // Clean trapezoid envelope: 10ms attack, 10ms release — no clipping
      const attack = Math.min(tNote / 0.01, 1);
      const release = Math.min((noteSec - tNote) / 0.01, 1);
      sample = Math.sin(2 * Math.PI * freqs[b] * t) * Math.min(attack, release) * 0.6;
    }
    v.setInt16(44 + i * 2, Math.round(sample * 32767), true);
  }
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

let _beepUrl = null;
let _audioUnlocked = false;

function unlockAudio() {
  if (_audioUnlocked) return;
  _audioUnlocked = true;
  if (!_beepUrl) _beepUrl = makeBeepUrl();
  const a = new Audio(_beepUrl);
  a.volume = 0;
  a.play().catch(() => {});
}

function playNotificationSound() {
  try {
    if (!_beepUrl) _beepUrl = makeBeepUrl();
    const a = new Audio(_beepUrl);
    a.volume = 0.8;
    a.play().catch(() => {});
  } catch (_) {}
}

const BELL_ACK_KEY = 'slx_bell_ack';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bellCount, setBellCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const isFirstLoadRef = useRef(true);
  const latestOrderIdRef = useRef(null);
  const latestNewOrdersRef = useRef(0);
  const navigate = useNavigate();

  // Unlock audio on any user interaction (browser autoplay policy)
  useEffect(() => {
    const handler = () => { unlockAudio(); setSoundEnabled(true); };
    document.addEventListener('click', handler, { once: true });
    document.addEventListener('keydown', handler, { once: true });
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', handler);
    };
  }, []);

  const loadStats = useCallback(() => {
    const isFirst = isFirstLoadRef.current;
    isFirstLoadRef.current = false;

    Promise.all([ordersAPI.getDashboardStats(), productsAPI.getLowStock()])
      .then(([s, l]) => {
        setStats(s.data);
        setLowStock(l.data);
        const newOrders = s.data?.newOrders ?? 0;
        latestNewOrdersRef.current = newOrders;

        // Detect new order by comparing latest order ID — never misses, never false-positives
        const newestId = s.data?.recentOrders?.[0]?._id;
        if (!isFirst && newestId && latestOrderIdRef.current && latestOrderIdRef.current !== newestId) {
          playNotificationSound();
        }
        if (newestId) latestOrderIdRef.current = newestId;

        // Badge: only unacknowledged placed orders
        const acknowledged = parseInt(localStorage.getItem(BELL_ACK_KEY) || '0');
        setBellCount(Math.max(0, newOrders - acknowledged));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, [loadStats]);

  const clearBadge = () => {
    localStorage.setItem(BELL_ACK_KEY, String(latestNewOrdersRef.current));
    setBellCount(0);
  };

  if (loading) return <div style={s.loading}>Loading dashboard...</div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Dashboard</h1>
          <p style={s.subtitle}>📍 Chichawatni Operations</p>
        </div>
        <div style={s.headerIcons}>
          {!soundEnabled && (
            <button
              style={s.enableSoundBtn}
              onClick={() => { unlockAudio(); setSoundEnabled(true); }}
              title="Click to enable order notification sounds"
            >
              🔇 Enable Sound
            </button>
          )}
          <span style={s.bellWrap} onClick={clearBadge}>
            <span style={s.icon}>🔔</span>
            {bellCount > 0 && (
              <span style={s.bellBadge}>{bellCount}</span>
            )}
          </span>
          <span style={s.icon}>🔍</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={s.grid4}>
        <StatCard title="Today's Orders" value={stats?.todayOrders ?? 0} sub="↑ Live count" icon="🛍️" iconBg="#3498db20" />
        <StatCard title="Total Sales (PKR)" value={`${(stats?.totalSales ?? 0).toLocaleString()}`} sub="↑ All time" icon="💰" iconBg="#34C75920" />
        <StatCard title="Pending Deliveries" value={stats?.pendingDeliveries ?? 0} sub="Next pickup soon" icon="🚚" iconBg="#FF950020" subColor="#FF9500" />
        <StatCard title="Low Stock Alerts" value={lowStock.length} sub={lowStock.length > 0 ? lowStock.slice(0, 2).map(p => p.name).join(', ') : 'All products stocked'} icon="🔴" iconBg="#FF3B3020" subColor="#FF3B30" />
      </div>

      {/* Recent Orders */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <h2 style={s.cardTitle}>Recent Orders</h2>
          <button style={s.viewAllBtn} onClick={() => navigate('/orders')}>View All</button>
        </div>
        <table style={s.table}>
          <thead>
            <tr>
              {['ORDER ID', 'CUSTOMER', 'AMOUNT', 'PAYMENT', 'STATUS'].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(stats?.recentOrders || []).map((o) => (
              <tr key={o._id} style={s.tr}>
                <td style={s.td}>#{o.orderId}</td>
                <td style={s.td}>{o.customerName}</td>
                <td style={s.td}>Rs. {o.total?.toLocaleString()}</td>
                <td style={s.td}>{o.paymentMethod}</td>
                <td style={s.td}>
                  <span style={{ ...s.badge, backgroundColor: STATUS_COLORS[o.status] + '20', color: STATUS_COLORS[o.status] }}>
                    {STATUS_LABELS[o.status]}
                  </span>
                </td>
              </tr>
            ))}
            {!stats?.recentOrders?.length && (
              <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: '#8E8E93' }}>No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={s.grid2}>
        {/* Chichawatni Operations */}
        <div style={s.card}>
          <h2 style={s.cardTitle}>Chichawatni Operations</h2>
          <p style={{ color: '#6B6B6B', fontSize: 14, lineHeight: '22px', margin: '10px 0 16px' }}>
            Your primary delivery hub is operating at peak efficiency today.
            All delivery riders are on assigned routes.
          </p>
          <button style={s.primaryBtn} onClick={() => navigate('/orders')}>Manage Orders</button>
        </div>

        {/* Quick Actions */}
        <div style={{ ...s.card, backgroundColor: '#3498db' }}>
          <h2 style={{ ...s.cardTitle, color: '#fff' }}>Quick Action</h2>
          <p style={{ color: '#fff', opacity: 0.85, fontSize: 14, margin: '10px 0 16px' }}>
            Need to update prices for daily fresh produce?
          </p>
          <button style={s.whiteBtn} onClick={() => navigate('/products')}>Update Price List</button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { padding: 28, maxWidth: 1200, margin: '0 auto' },
  loading: { display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#8E8E93' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 28, fontWeight: 800, color: '#1a1a1a' },
  subtitle: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  headerIcons: { display: 'flex', gap: 16, fontSize: 22, alignItems: 'center' },
  enableSoundBtn: { fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e0a800', backgroundColor: '#fff8e1', color: '#856404', cursor: 'pointer' },
  icon: { cursor: 'pointer' },
  bellWrap: { position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' },
  bellBadge: {
    position: 'absolute', top: -6, right: -8,
    backgroundColor: '#FF3B30', color: '#fff',
    fontSize: 11, fontWeight: 800, lineHeight: 1,
    minWidth: 18, height: 18, borderRadius: 9,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
  },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 700, color: '#1a1a1a' },
  viewAllBtn: { background: 'none', border: 'none', color: '#3498db', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#8E8E93', letterSpacing: 1, padding: '8px 12px', borderBottom: '1px solid #F2F2F7' },
  tr: { borderBottom: '1px solid #F2F2F7' },
  td: { padding: '14px 12px', fontSize: 14, color: '#1a1a1a' },
  badge: { padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700 },
  primaryBtn: { backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  whiteBtn: { backgroundColor: '#fff', color: '#3498db', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
};
