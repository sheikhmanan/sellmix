import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productsAPI } from '../services/api';

const NAV = [
  { to: '/dashboard',  icon: '▦',  label: 'Dash' },
  { to: '/orders',     icon: '🛒', label: 'Orders' },
  { to: '/products',   icon: '📦', label: 'Stock' },
  { to: '/categories', icon: '🏷️', label: 'Cats' },
  { to: '/inventory',  icon: '📋', label: 'Inventory' },
  { to: '/low-stock',  icon: '🔴', label: 'Low Stock', alert: true },
  { to: '/users',      icon: '👥', label: 'Users' },
  { to: '/reports',    icon: '📊', label: 'Reports' },
];

const s = {
  sidebar: { width: 72, backgroundColor: '#1a2332', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20, paddingBottom: 20, gap: 8 },
  avatar: { width: 40, height: 40, borderRadius: '50%', backgroundColor: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 16 },
  navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 56, padding: '10px 0', borderRadius: 12, textDecoration: 'none', color: '#8E9BAA', gap: 4, fontSize: 20 },
  navItemActive: { backgroundColor: '#3498db22', color: '#3498db' },
  navLabel: { fontSize: 10, fontWeight: 600 },
  spacer: { flex: 1 },
  logoutBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#8E9BAA', gap: 4, fontSize: 20, padding: '8px 0' },
  alertDot: { position: 'absolute', top: -6, right: -8, backgroundColor: '#FF3B30', color: '#fff', fontSize: 9, fontWeight: 800, minWidth: 16, height: 16, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [lowCount, setLowCount] = useState(0);

  useEffect(() => {
    productsAPI.getLowStock()
      .then((r) => setLowCount(r.data.length))
      .catch(() => {});
    const t = setInterval(() => {
      productsAPI.getLowStock().then((r) => setLowCount(r.data.length)).catch(() => {});
    }, 60000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={s.sidebar}>
      <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || 'A'}</div>
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          style={({ isActive }) => ({ ...s.navItem, ...(isActive ? s.navItemActive : {}) })}
        >
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            {n.icon}
            {n.alert && lowCount > 0 && (
              <span style={s.alertDot}>{lowCount}</span>
            )}
          </span>
          <span style={s.navLabel}>{n.label}</span>
        </NavLink>
      ))}
      <div style={s.spacer} />
      <button style={s.logoutBtn} onClick={handleLogout} title="Logout">
        <span>🚪</span>
        <span style={s.navLabel}>Out</span>
      </button>
    </nav>
  );
}
