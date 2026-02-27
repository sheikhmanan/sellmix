import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard', icon: '▦', label: 'Dash' },
  { to: '/orders', icon: '🛒', label: 'Orders' },
  { to: '/products', icon: '📦', label: 'Stock' },
  { to: '/inventory', icon: '📋', label: 'Inventory' },
  { to: '/reports',   icon: '📊', label: 'Reports' },
];

const s = {
  sidebar: { width: 72, backgroundColor: '#1a2332', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20, paddingBottom: 20, gap: 8 },
  avatar: { width: 40, height: 40, borderRadius: '50%', backgroundColor: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 16 },
  navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 56, padding: '10px 0', borderRadius: 12, textDecoration: 'none', color: '#8E9BAA', gap: 4, fontSize: 20 },
  navItemActive: { backgroundColor: '#3498db22', color: '#3498db' },
  navLabel: { fontSize: 10, fontWeight: 600 },
  spacer: { flex: 1 },
  logoutBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#8E9BAA', gap: 4, fontSize: 20, padding: '8px 0' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
          <span>{n.icon}</span>
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
