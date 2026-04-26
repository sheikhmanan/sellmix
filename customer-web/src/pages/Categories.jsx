import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoriesAPI, productsAPI } from '../services/api';
import { COLORS } from '../constants/colors';

function buildTree(cats) {
  const map = {};
  cats.forEach((c) => { map[c._id] = { ...c, children: [] }; });
  const roots = [];
  cats.forEach((c) => {
    const pid = c.parent?._id || c.parent;
    if (pid && map[pid]) map[pid].children.push(map[c._id]);
    else roots.push(map[c._id]);
  });
  return roots;
}

function buildImageMap(products) {
  const map = {};
  products.forEach((p) => {
    if (!p.images?.[0]) return;
    const catId = p.category?._id || p.category;
    if (!catId) return;
    if (!map[catId]) map[catId] = [];
    if (map[catId].length < 6) map[catId].push(p.images[0]);
  });
  return map;
}

function getCategoryImages(cat, imageMap) {
  const imgs = [];
  (cat.children || []).forEach((sub) => {
    (imageMap[sub._id] || []).forEach((img) => { if (imgs.length < 6) imgs.push(img); });
  });
  if (imgs.length < 6) {
    (imageMap[cat._id] || []).forEach((img) => { if (imgs.length < 6) imgs.push(img); });
  }
  return imgs;
}

// L1 icon box — 78×72, 3×2 grid (matches mobile exactly)
function CategoryImageBox({ cat, images }) {
  if (cat.image) {
    return <div style={s.iconBox}><img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>;
  }
  if (!images || images.length === 0) {
    return <div style={s.iconBox}><span style={{ fontSize: 36 }}>🛒</span></div>;
  }
  if (images.length === 1) {
    return (
      <div style={s.iconBox}>
        <img src={images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    );
  }
  const grid = images.slice(0, 6);
  while (grid.length < 6) grid.push(null);
  return (
    <div style={s.iconBox}>
      <div style={s.imgGrid}>
        {grid.map((img, i) => (
          <div key={i} style={s.imgCell}>
            {img
              ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <div style={{ width: '100%', height: '100%', backgroundColor: '#f0f4ff' }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// L2 sub image box — 64×64, 2×2 grid (matches mobile exactly)
function SubImageBox({ sub, images }) {
  if (sub.image) {
    return <div style={s.subImgBox}><img src={sub.image} alt={sub.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>;
  }
  if (!images || images.length === 0) {
    return <div style={s.subImgBox}><span style={{ fontSize: 32 }}>{sub.icon || '🛒'}</span></div>;
  }
  const grid = images.slice(0, 4);
  while (grid.length < 4) grid.push(null);
  return (
    <div style={s.subImgBox}>
      <div style={s.subImgGrid}>
        {grid.map((img, i) => (
          <div key={i} style={s.subImgCell}>
            {img
              ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              : <div style={{ width: '100%', height: '100%', backgroundColor: '#f0f4ff' }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Categories() {
  const [tree, setTree] = useState([]);
  const [imageMap, setImageMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      categoriesAPI.getAll(),
      productsAPI.getAll({ limit: 200 }),
    ]).then(([catRes, prodRes]) => {
      setTree(buildTree(catRes.data || []));
      setImageMap(buildImageMap(prodRes.data?.products || []));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <div style={s.loading}>Loading categories...</div>;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <p style={s.title}>Categories</p>
      </div>

      <div style={s.list}>
        {tree.map((cat) => {
          const isOpen = !!expanded[cat._id];
          const imgs = getCategoryImages(cat, imageMap);
          const subNames = cat.children.map((c) => c.name).join(', ');

          return (
            <div key={cat._id}>
              {/* L1 Row */}
              <div
                style={{ ...s.row, ...(isOpen ? s.rowActive : {}) }}
                onClick={() => toggle(cat._id)}
              >
                <CategoryImageBox cat={cat} images={imgs} />
                <div style={s.rowText}>
                  <p style={s.rowName}>{cat.name}</p>
                  {subNames && <p style={s.rowSub}>{subNames}</p>}
                </div>
                <span style={s.chevron}>{isOpen ? '▲' : '▼'}</span>
              </div>

              {/* L2 Subcategory Grid */}
              {isOpen && cat.children.length > 0 && (
                <div style={s.subGrid}>
                  {cat.children.map((sub) => (
                    <div
                      key={sub._id}
                      style={s.subCard}
                      onClick={() => navigate(`/products?category=${sub._id}`)}
                    >
                      <SubImageBox sub={sub} images={imageMap[sub._id] || []} />
                      <p style={s.subName}>{sub.name}</p>
                    </div>
                  ))}
                </div>
              )}
              <div style={s.divider} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  page: { backgroundColor: '#f5f5f5', minHeight: '100vh' },
  loading: { padding: 40, textAlign: 'center', color: '#999', fontSize: 15 },

  header: {
    backgroundColor: '#fff', padding: '18px 20px 14px',
    borderBottom: '1px solid #eee',
  },
  title: { fontSize: 20, fontWeight: 800, color: '#1a1a1a' },

  list: { maxWidth: 800, margin: '0 auto' },

  // L1 row — matches mobile row style
  row: {
    display: 'flex', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', padding: '14px 16px',
    cursor: 'pointer', userSelect: 'none',
  },
  rowActive: { backgroundColor: '#fffde7' },

  // L1 image box — 78×72, 3×2 grid
  iconBox: {
    width: 78, height: 72, borderRadius: 10, backgroundColor: '#f0f4ff',
    overflow: 'hidden', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  imgGrid: { width: 78, height: 72, display: 'flex', flexWrap: 'wrap' },
  imgCell: { width: 26, height: 36, padding: 1, backgroundColor: '#f5f5f5', boxSizing: 'border-box' },

  rowText: { flex: 1 },
  rowName: { fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 3 },
  rowSub: { fontSize: 12, color: '#888', lineHeight: 1.5 },
  chevron: { fontSize: 14, color: COLORS.primary, fontWeight: 900, width: 24, textAlign: 'center' },

  // L2 subcategory grid — matches mobile subGrid
  subGrid: {
    display: 'flex', flexWrap: 'wrap', gap: 10,
    backgroundColor: '#fffde7', padding: '12px',
  },
  subCard: {
    width: 'calc(33.33% - 7px)', backgroundColor: '#fff', borderRadius: 12,
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '16px 6px', cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    boxSizing: 'border-box',
  },

  // L2 image box — 64×64, 2×2 grid
  subImgBox: {
    width: 64, height: 64, borderRadius: 10, backgroundColor: '#f5f5f5',
    overflow: 'hidden', marginBottom: 8, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  subImgGrid: { width: 64, height: 64, display: 'flex', flexWrap: 'wrap' },
  subImgCell: { width: 32, height: 32, padding: 1, backgroundColor: '#f5f5f5', boxSizing: 'border-box' },

  subName: { fontSize: 12, fontWeight: 600, color: '#1a1a1a', textAlign: 'center' },

  divider: { height: 1, backgroundColor: '#eee' },
};
