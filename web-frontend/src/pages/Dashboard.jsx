import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI, productsAPI } from '../services/api';
import StatCard from '../components/StatCard';

const STATUS_COLORS = { placed: '#FF9500', packed: '#9B59B6', out_for_delivery: '#3498db', delivered: '#34C759', cancelled: '#FF3B30' };
const STATUS_LABELS = { placed: 'Pending', packed: 'Packed', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' };

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([ordersAPI.getDashboardStats(), productsAPI.getLowStock()])
      .then(([s, l]) => { setStats(s.data); setLowStock(l.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={s.loading}>Loading dashboard...</div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Dashboard</h1>
          <p style={s.subtitle}>📍 Chichawatni Operations</p>
        </div>
        <div style={s.headerIcons}>
          <span style={s.icon}>🔔</span>
          <span style={s.icon}>🔍</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={s.grid4}>
        <StatCard title="Today's Orders" value={stats?.todayOrders ?? 0} sub="↑ Live count" icon="🛍️" iconBg="#3498db20" />
        <StatCard title="Total Sales (PKR)" value={`${(stats?.totalSales ?? 0).toLocaleString()}`} sub="↑ All time" icon="💰" iconBg="#34C75920" />
        <StatCard title="Pending Deliveries" value={stats?.pendingDeliveries ?? 0} sub="Next pickup soon" icon="🚚" iconBg="#FF950020" subColor="#FF9500" />
        <StatCard title="Low Stock Alerts" value={lowStock.length} sub={lowStock.slice(0, 2).map(p => p.name).join(', ')} icon="⚠️" iconBg="#FF3B3020" subColor="#FF3B30" />
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
  headerIcons: { display: 'flex', gap: 16, fontSize: 22 },
  icon: { cursor: 'pointer' },
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
