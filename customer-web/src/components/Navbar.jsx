import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { COLORS } from '../constants/colors';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        {/* Logo */}
        <Link to="/" style={s.logo}>
          <span style={s.logoText}>SellMix</span>
          <span style={s.logoSub}>Chichawatni</span>
        </Link>

        {/* Search */}
        <form style={s.searchForm} onSubmit={handleSearch}>
          <input
            style={s.searchInput}
            placeholder="Search groceries, spices, tea..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" style={s.searchBtn}>🔍</button>
        </form>

        {/* Right Actions */}
        <div style={s.actions}>
          <Link to="/cart" style={s.cartBtn}>
            <span style={s.cartIcon}>🛒</span>
            {itemCount > 0 && <span style={s.cartBadge}>{itemCount}</span>}
            <span style={s.cartLabel}>Cart</span>
          </Link>

          {user ? (
            <div style={s.userMenu}>
              <button style={s.userBtn} onClick={() => setMenuOpen(!menuOpen)}>
                <span style={s.userAvatar}>{user.name?.[0]?.toUpperCase()}</span>
                <span style={s.userName}>{user.name?.split(' ')[0]}</span>
                <span>▾</span>
              </button>
              {menuOpen && (
                <div style={s.dropdown}>
                  <Link to="/orders" style={s.dropItem} onClick={() => setMenuOpen(false)}>📦 My Orders</Link>
                  <Link to="/track" style={s.dropItem} onClick={() => setMenuOpen(false)}>📍 Track Order</Link>
                  <button style={s.dropItemBtn} onClick={handleLogout}>🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div style={s.authLinks}>
              <Link to="/login" style={s.loginLink}>Login</Link>
              <Link to="/register" style={s.registerLink}>Register</Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar — categories */}
      <div style={s.catBar}>
        <div style={s.catInner}>
          <Link to="/products" style={s.catLink}>🛒 All Products</Link>
          <Link to="/products?category=Spices+%26+Masala" style={s.catLink}>🌶️ Spices</Link>
          <Link to="/products?category=Tea+%26+Beverages" style={s.catLink}>🍵 Tea</Link>
          <Link to="/products?category=Rice+%26+Grains" style={s.catLink}>🍚 Rice</Link>
          <Link to="/products?category=Cooking+Oil+%26+Ghee" style={s.catLink}>🫙 Oil</Link>
          <Link to="/products?category=Pulses+%26+Lentils" style={s.catLink}>🫘 Pulses</Link>
          <Link to="/track" style={s.catLink}>📍 Track Order</Link>
        </div>
      </div>
    </nav>
  );
}

const s = {
  nav: { backgroundColor: COLORS.white, borderBottom: `1px solid ${COLORS.border}`, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  inner: { maxWidth: 1200, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16 },
  logo: { display: 'flex', flexDirection: 'column', textDecoration: 'none', minWidth: 100 },
  logoText: { fontSize: 22, fontWeight: 800, color: COLORS.primary, letterSpacing: 0.5 },
  logoSub: { fontSize: 10, color: COLORS.textMuted, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' },
  searchForm: { flex: 1, display: 'flex', gap: 0, maxWidth: 500 },
  searchInput: { flex: 1, border: `1.5px solid ${COLORS.border}`, borderRight: 'none', borderRadius: '10px 0 0 10px', padding: '10px 16px', fontSize: 14, outline: 'none', backgroundColor: COLORS.secondary },
  searchBtn: { backgroundColor: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: '0 10px 10px 0', padding: '0 18px', cursor: 'pointer', fontSize: 16 },
  actions: { display: 'flex', alignItems: 'center', gap: 12 },
  cartBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', backgroundColor: COLORS.primary + '12', borderRadius: 10, textDecoration: 'none', position: 'relative', color: COLORS.primary, fontWeight: 600 },
  cartIcon: { fontSize: 18 },
  cartLabel: { fontSize: 14 },
  cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.error, color: COLORS.white, borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userMenu: { position: 'relative' },
  userBtn: { display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: '7px 12px', cursor: 'pointer', fontSize: 14, color: COLORS.text },
  userAvatar: { width: 28, height: 28, borderRadius: '50%', backgroundColor: COLORS.primary, color: COLORS.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 },
  userName: { fontWeight: 600 },
  dropdown: { position: 'absolute', top: '110%', right: 0, backgroundColor: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 180, overflow: 'hidden', zIndex: 200 },
  dropItem: { display: 'block', padding: '12px 16px', fontSize: 14, color: COLORS.text, textDecoration: 'none', borderBottom: `1px solid ${COLORS.lightGrey}' ` },
  dropItemBtn: { display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', fontSize: 14, color: COLORS.error, background: 'none', border: 'none', cursor: 'pointer' },
  authLinks: { display: 'flex', gap: 10, alignItems: 'center' },
  loginLink: { padding: '8px 16px', border: `1.5px solid ${COLORS.primary}`, borderRadius: 10, color: COLORS.primary, fontWeight: 600, fontSize: 14, textDecoration: 'none' },
  registerLink: { padding: '8px 16px', backgroundColor: COLORS.primary, borderRadius: 10, color: COLORS.white, fontWeight: 600, fontSize: 14, textDecoration: 'none' },
  catBar: { backgroundColor: COLORS.primary, padding: '0 20px' },
  catInner: { maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 4, overflowX: 'auto' },
  catLink: { padding: '10px 16px', color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap', borderBottom: '2px solid transparent' },
};
