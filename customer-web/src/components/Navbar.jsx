import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { categoriesAPI, productsAPI } from '../services/api';

const CAT_ORDER = ['Grocery & Staples', 'Drinks', 'Health & Beauty', 'Laundry & Household', 'Biscuits, Snacks & Chocolate'];
const CAT_COLORS = {
  'Grocery & Staples':          { bg: '#e8f5e9', icon: '#2e7d32' },
  'Drinks':                     { bg: '#e3f2fd', icon: '#1565c0' },
  'Health & Beauty':            { bg: '#fce4ec', icon: '#c2185b' },
  'Laundry & Household':        { bg: '#ede7f6', icon: '#6a1b9a' },
  'Biscuits, Snacks & Chocolate':{ bg: '#fff3e0', icon: '#e65100' },
};

function buildTree(cats) {
  const map = {};
  cats.forEach((c) => { map[c._id] = { ...c, children: [] }; });
  const roots = [];
  cats.forEach((c) => {
    const pid = c.parent?._id || c.parent;
    if (pid && map[pid]) map[pid].children.push(map[c._id]);
    else roots.push(map[c._id]);
  });
  roots.sort((a, b) => {
    const ai = CAT_ORDER.indexOf(a.name);
    const bi = CAT_ORDER.indexOf(b.name);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  return roots;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

export default function Navbar() {
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();
  const { items, itemCount, clearCart } = useCart();
  const navigate = useNavigate();
  const [expandedCat, setExpandedCat] = useState(null);
  const [search, setSearch] = useState('');
  const [userOpen, setUserOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [hoveredL1, setHoveredL1] = useState(null);
  const [hoveredL2, setHoveredL2] = useState(null);
  const [tree, setTree] = useState([]);
  const [allNames, setAllNames] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const megaRef = useRef(null);
  const closeTimer = useRef(null);
  const searchRef = useRef(null);

  const cartTotal = items.reduce((sum, i) => sum + (i.discountPrice || i.price) * i.quantity, 0);

  useEffect(() => {
    if (!isMobile || !megaOpen) return;
    const handler = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) {
        setMegaOpen(false);
        setHoveredL1(null);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [isMobile, megaOpen]);

  useEffect(() => {
    categoriesAPI.getAll().then((r) => {
      setTree(buildTree(r.data || []));
    }).catch(() => {});
    productsAPI.getAll({ limit: 200 }).then((r) => {
      const names = [];
      (r.data?.products || []).forEach((p) => {
        names.push({ name: p.name, id: p._id });
      });
      setAllNames(names);
    }).catch(() => {});
  }, []);

  // Prefix autocomplete
  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (q.length === 0) { setSuggestions([]); setShowSuggestions(false); return; }
    const matches = allNames.filter((p) => p.name.toLowerCase().startsWith(q)).slice(0, 6);
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  }, [search, allNames]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const openMega = () => {
    clearTimeout(closeTimer.current);
    setMegaOpen(true);
    if (tree.length > 0 && !hoveredL1) setHoveredL1(tree[0]);
  };

  const closeMega = () => {
    closeTimer.current = setTimeout(() => {
      setMegaOpen(false);
      setHoveredL1(null);
      setHoveredL2(null);
    }, 150);
  };

  const toggleMega = () => {
    if (megaOpen) {
      setMegaOpen(false);
      setHoveredL1(null);
      setHoveredL2(null);
    } else {
      setMegaOpen(true);
      if (tree.length > 0) setHoveredL1(tree[0]);
    }
  };

  const hoverL1 = (node) => { setHoveredL1(node); setHoveredL2(null); };
  const hoverL2 = (node) => setHoveredL2(node);

  const l2List = hoveredL1?.children || [];
  const l3List = hoveredL2?.children || [];

  return (
    <nav style={s.nav}>
      {/* Row 1: Logo + Right actions */}
      <div style={s.topBar}>
        <div style={s.topInner}>
          <Link to="/" style={s.logo}>
            <span style={s.logoText}>SellMix</span>
            <div style={s.location}>
              <span style={s.locationPin}>📍</span>
              <span style={s.locationText}>Chichawatni, Pakistan</span>
              <span style={s.locationChevron}>▾</span>
            </div>
          </Link>

          <div style={s.actions}>
            {user ? (
              <div style={{ position: 'relative' }}>
                <button style={s.userBtn} onClick={() => setUserOpen(!userOpen)}>
                  <span style={s.avatar}>{user.name?.[0]?.toUpperCase()}</span>
                  {user.name?.split(' ')[0]}
                  <span style={{ fontSize: 10 }}>▾</span>
                </button>
                {userOpen && (
                  <div style={s.dropdown}>
                    <Link to="/orders" style={s.dropItem} onClick={() => setUserOpen(false)}>My Orders</Link>
                    <Link to="/track" style={s.dropItem} onClick={() => setUserOpen(false)}>Track Order</Link>
                    <button style={s.dropLogout} onClick={() => { clearCart(); logout(); setUserOpen(false); window.location.replace('/'); }}>Logout</button>
                  </div>
                )}
              </div>
            ) : !isMobile ? (
              <>
                <Link to="/register" style={s.registerBtn}>Register</Link>
                <Link to="/login" style={s.signInBtn}>Sign In</Link>
              </>
            ) : null}

            <Link to="/cart" style={s.cartBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span>Rs. {cartTotal.toLocaleString()}</span>
              {itemCount > 0 && <span style={s.cartBadge}>{itemCount}</span>}
              <span style={s.cartChevron}>▾</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Row 2: Search bar */}
      <div style={s.searchBar}>
        <div style={s.searchInner}>
          <div style={{ position: 'relative' }}>
            <form style={s.searchForm} onSubmit={(e) => { setShowSuggestions(false); handleSearch(e); }}>
              <input
                ref={searchRef}
                style={s.searchInput}
                placeholder="Search 100+ products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onFocus={() => search.trim().length > 0 && setShowSuggestions(true)}
                autoComplete="off"
              />
              <button type="submit" style={s.searchBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <div style={s.acDrop}>
                {suggestions.map((item) => {
                  const q = search.trim();
                  const bold = item.name.slice(0, q.length);
                  const rest = item.name.slice(q.length);
                  return (
                    <div
                      key={item.id}
                      style={s.acRow}
                      onMouseDown={() => {
                        setSearch(item.name);
                        setShowSuggestions(false);
                        navigate(`/products?search=${encodeURIComponent(item.name)}`);
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.5" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      <span><span style={s.acBold}>{bold}</span>{rest}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop overlay when mobile menu is open */}
      {isMobile && megaOpen && (
        <div
          style={s.backdrop}
          onClick={() => { setMegaOpen(false); setExpandedCat(null); }}
        />
      )}

      {/* Bottom nav bar with mega menu */}
      <div style={s.bottomBar}>
        <div style={s.bottomInner}>
          {/* Categories mega menu trigger */}
          <div
            style={{ ...s.catTriggerWrap, ...(isMobile ? { position: 'static' } : {}) }}
            onMouseEnter={isMobile ? undefined : openMega}
            onMouseLeave={isMobile ? undefined : closeMega}
            ref={megaRef}
          >
            <button
              style={{ ...s.catTrigger, ...(megaOpen ? s.catTriggerActive : {}) }}
              onClick={isMobile ? toggleMega : undefined}
            >
              Categories
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3498db" strokeWidth="3" style={{ marginLeft: 4, transform: megaOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {megaOpen && (
              isMobile ? (
                /* Mobile: card-style with expandable subcategories */
                <div style={s.mobileCatMenu}>
                  {tree.map((l1) => {
                    const color = CAT_COLORS[l1.name] || { bg: '#f5f5f5', icon: '#333' };
                    const subNames = l1.children?.map((c) => c.name).join(', ') || '';
                    const isExpanded = expandedCat === l1._id;
                    return (
                      <div key={l1._id}>
                        {/* L1 Card */}
                        <div
                          style={s.mobileCatCard}
                          onClick={() => {
                            if (l1.children?.length > 0) {
                              setExpandedCat(isExpanded ? null : l1._id);
                            } else {
                              navigate(`/products?category=${l1._id}`);
                              setMegaOpen(false);
                              setExpandedCat(null);
                              window.scrollTo({ top: 0, behavior: 'instant' });
                            }
                          }}
                        >
                          <div style={{ ...s.mobileCatIconBox, backgroundColor: color.bg }}>
                            <span style={{ fontSize: 32 }}>{l1.icon}</span>
                          </div>
                          <div style={s.mobileCatInfo}>
                            <p style={s.mobileCatName}>{l1.name}</p>
                            {subNames && <p style={s.mobileCatSubs}>{subNames}</p>}
                          </div>
                          <span style={{ ...s.mobileCatArrow, color: color.icon, transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
                        </div>
                        {/* Subcategories */}
                        {isExpanded && l1.children?.length > 0 && (
                          <div style={s.mobileSubList}>
                            <div
                              style={s.mobileSubViewAll}
                              onClick={() => { navigate(`/products?category=${l1._id}`); setMegaOpen(false); setExpandedCat(null); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                            >
                              View All {l1.name}
                            </div>
                            {l1.children.map((l2) => (
                              <div
                                key={l2._id}
                                style={s.mobileSubItem}
                                onClick={() => { navigate(`/products?category=${l2._id}`); setMegaOpen(false); setExpandedCat(null); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                              >
                                <span>{l2.name}</span>
                                <span style={s.mobileSubArrow}>›</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Desktop: 3-column mega menu */
                <div
                  style={s.megaMenu}
                  onMouseEnter={() => clearTimeout(closeTimer.current)}
                  onMouseLeave={closeMega}
                >
                  {/* L1 column */}
                  <div style={s.megaCol}>
                    {tree.map((node) => {
                      const isActive = hoveredL1?._id === node._id;
                      return (
                        <div
                          key={node._id}
                          style={{ ...s.megaL1Item, ...(isActive ? s.megaL1Active : {}) }}
                          onMouseEnter={() => hoverL1(node)}
                          onClick={() => { navigate(`/products?category=${node._id}`); setMegaOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                        >
                          <span style={s.megaL1Name}>{node.name}</span>
                          {node.children?.length > 0 && <span style={s.megaArrow}>›</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* L2 column */}
                  {l2List.length > 0 && (
                    <div style={s.megaCol2}>
                      {l2List.map((node) => (
                        <div
                          key={node._id}
                          style={{ ...s.megaL2Item, ...(hoveredL2?._id === node._id ? s.megaL2Active : {}) }}
                          onMouseEnter={() => hoverL2(node)}
                          onClick={() => { navigate(`/products?category=${node._id}`); setMegaOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                        >
                          <span>{node.name}</span>
                          {node.children?.length > 0 && <span style={s.megaArrow}>›</span>}
                        </div>
                      ))}
                      <div
                        style={s.megaViewAll}
                        onClick={() => { navigate(`/products?category=${hoveredL1?._id}`); setMegaOpen(false); }}
                      >
                        View All {hoveredL1?.name}
                      </div>
                    </div>
                  )}

                  {/* L3 column */}
                  {l3List.length > 0 && (
                    <div style={s.megaCol3}>
                      <p style={s.megaL3Title}>{hoveredL2?.icon} {hoveredL2?.name}</p>
                      {l3List.map((node) => (
                        <div
                          key={node._id}
                          style={s.megaL3Item}
                          onClick={() => { navigate(`/products?category=${node._id}`); setMegaOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                        >
                          {node.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

const s = {
  nav: { backgroundColor: '#fff', position: 'sticky', top: 0, zIndex: 200, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },

  // Row 1: Logo + Actions
  topBar: { borderBottom: '1px solid #e8e8e8', padding: '12px 0' },
  topInner: { maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },

  logo: { textDecoration: 'none' },
  logoText: { fontSize: 32, fontWeight: 900, color: '#3498db', letterSpacing: -0.5, display: 'block' },
  location: { display: 'flex', alignItems: 'center', gap: 2, marginTop: 1 },
  locationPin: { fontSize: 11 },
  locationText: { fontSize: 12, color: '#555', fontWeight: 500 },
  locationChevron: { fontSize: 10, color: '#555' },

  // Row 2: Search
  searchBar: { backgroundColor: '#fff', padding: '10px 0', borderBottom: '1px solid #e8e8e8' },
  searchInner: { maxWidth: 1280, margin: '0 auto', padding: '0 20px' },
  searchForm: { display: 'flex', width: '100%' },
  searchInput: { flex: 1, border: '1.5px solid #ddd', borderRight: 'none', borderRadius: '6px 0 0 6px', padding: '11px 18px', fontSize: 14, outline: 'none', color: '#1a1a1a' },
  searchBtn: { backgroundColor: '#3498db', border: 'none', borderRadius: '0 6px 6px 0', padding: '0 22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  acDrop: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', border: '1px solid #e0e0e0', borderTop: 'none', borderRadius: '0 0 8px 8px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 999, overflow: 'hidden' },
  acRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', cursor: 'pointer', fontSize: 14, color: '#333', borderBottom: '1px solid #f5f5f5' },
  acBold: { fontWeight: 800, color: '#3498db' },

  actions: { display: 'flex', alignItems: 'center', gap: 10 },
  helpLink: { display: 'flex', alignItems: 'center', fontSize: 14, color: '#555', textDecoration: 'none', fontWeight: 500 },

  registerBtn: { padding: '8px 14px', border: '1.5px solid #ddd', borderRadius: 6, color: '#333', fontSize: 13, fontWeight: 600, textDecoration: 'none' },
  signInBtn: { padding: '8px 18px', backgroundColor: '#3498db', borderRadius: 6, color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' },

  userBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px solid #ddd', borderRadius: 6, padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#1a1a1a' },
  avatar: { width: 24, height: 24, borderRadius: '50%', backgroundColor: '#3498db', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 },
  dropdown: { position: 'absolute', top: '110%', right: 0, backgroundColor: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 160, overflow: 'hidden', zIndex: 300 },
  dropItem: { display: 'block', padding: '11px 16px', fontSize: 13, color: '#1a1a1a', textDecoration: 'none', borderBottom: '1px solid #f0f0f0' },
  dropLogout: { display: 'block', width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: 13, color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer' },

  cartBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1.5px solid #3498db', borderRadius: 6, color: '#3498db', fontSize: 13, fontWeight: 700, textDecoration: 'none', position: 'relative', whiteSpace: 'nowrap' },
  cartBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: '#e74c3c', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cartChevron: { fontSize: 10 },

bottomBar: { backgroundColor: '#f7f7f7', borderBottom: '1px solid #e8e8e8' },
  bottomInner: { maxWidth: 1280, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center' },

  catTriggerWrap: { position: 'relative' },
  catTrigger: { display: 'flex', alignItems: 'center', gap: 2, padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 19, fontWeight: 900, color: '#3498db', borderBottom: '2px solid transparent' },
  catTriggerActive: { borderBottom: '2px solid #3498db', color: '#3498db' },

  megaMenu: { position: 'absolute', top: '100%', left: 0, display: 'flex', backgroundColor: '#fff', border: '1px solid #e8e8e8', borderTop: 'none', boxShadow: '0 16px 40px rgba(0,0,0,0.12)', zIndex: 500, minWidth: 680 },

  megaCol: { width: 240, borderRight: '1px solid #f0f0f0', maxHeight: 500, overflowY: 'auto' },
  megaL1Item: { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', cursor: 'pointer', fontSize: 15, fontWeight: 700, color: '#1a1a1a' },
  megaL1Active: { backgroundColor: '#EBF5FB', color: '#3498db', fontWeight: 800 },
  megaL1Name: { flex: 1 },

  megaCol2: { width: 220, borderRight: '1px solid #f0f0f0', maxHeight: 500, overflowY: 'auto' },
  megaL2Item: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#333' },
  megaL2Active: { backgroundColor: '#EBF5FB', fontWeight: 800, color: '#3498db' },
  megaViewAll: { padding: '10px 16px', fontSize: 12, color: '#3498db', fontWeight: 700, cursor: 'pointer', borderTop: '1px solid #f0f0f0', marginTop: 4 },

  megaCol3: { width: 200, padding: '12px 0', maxHeight: 500, overflowY: 'auto' },
  megaL3Title: { fontSize: 12, fontWeight: 800, color: '#3498db', padding: '4px 16px 10px', textTransform: 'uppercase', letterSpacing: 0.5 },
  megaL3Item: { padding: '8px 16px', fontSize: 13, color: '#333', cursor: 'pointer' },

  backdrop: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 499 },

  // Mobile categories menu — card style like mobile app
  mobileCatMenu: { position: 'absolute', top: '100%', left: 0, right: 0, width: '100vw', backgroundColor: '#f5f6f8', border: '1px solid #e8e8e8', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 500, maxHeight: '80vh', overflowY: 'auto' },
  mobileCatCard: { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' },
  mobileCatIconBox: { width: 64, height: 64, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  mobileCatInfo: { flex: 1, overflow: 'hidden' },
  mobileCatName: { fontSize: 15, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 },
  mobileCatSubs: { fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  mobileCatArrow: { fontSize: 22, fontWeight: 900, flexShrink: 0, display: 'inline-block' },
  mobileSubList: { backgroundColor: '#f9f9f9', borderBottom: '2px solid #e8e8e8' },
  mobileSubViewAll: { padding: '11px 16px 11px 82px', fontSize: 13, fontWeight: 700, color: '#3498db', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' },
  mobileSubItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 12px 82px', fontSize: 14, color: '#333', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' },
  mobileSubArrow: { color: '#bbb', fontSize: 16 },

  megaThumb: { width: 40, height: 40, borderRadius: 6, overflow: 'hidden', backgroundColor: '#f5f5f5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  megaThumbGrid: { width: 40, height: 40, display: 'flex', flexWrap: 'wrap' },
  megaThumbCell: { width: 20, height: 20, padding: 1, boxSizing: 'border-box', backgroundColor: '#f5f5f5' },
  megaThumbImg: { width: '100%', height: '100%', objectFit: 'contain' },
  megaThumbEmpty: { width: '100%', height: '100%', backgroundColor: '#f0f4ff' },
  megaL2Thumb: { width: 32, height: 32, borderRadius: 5, overflow: 'hidden', backgroundColor: '#f5f5f5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  megaIcon: { fontSize: 16, minWidth: 20 },
  megaArrow: { marginLeft: 'auto', color: '#3498db', fontSize: 16, fontWeight: 900 },

  quickLink: { padding: '11px 16px', fontSize: 13, fontWeight: 500, color: '#333', textDecoration: 'none', whiteSpace: 'nowrap', borderBottom: '2px solid transparent' },
};
