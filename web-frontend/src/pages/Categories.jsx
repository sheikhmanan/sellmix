import { useState, useEffect } from 'react';
import { categoriesAPI, uploadAPI } from '../services/api';

const EMOJI_SUGGESTIONS = ['🌾', '🍵', '🥛', '🌿', '🏠', '🌶️', '🧴', '🍞', '🥩', '🥦', '🧃', '🫙', '🧂', '🍳', '🛒', '🥤', '☕', '🫖', '🧋', '🍫'];

// Build nested tree from flat array
function buildTree(cats) {
  const map = {};
  cats.forEach((c) => { map[c._id] = { ...c, children: [] }; });
  const roots = [];
  cats.forEach((c) => {
    const parentId = c.parent?._id || c.parent;
    if (parentId && map[parentId]) map[parentId].children.push(map[c._id]);
    else roots.push(map[c._id]);
  });
  return roots;
}

export default function Categories() {
  const [allCats, setAllCats] = useState([]);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [parentForNew, setParentForNew] = useState(null); // null = root level
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', icon: '🛒' });
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await categoriesAPI.getAll();
      setAllCats(r.data);
      setTree(buildTree(r.data));
    } catch {}
    setLoading(false);
  };

  const openAdd = (parent = null) => {
    setEditing(null);
    setParentForNew(parent);
    setForm({ name: '', icon: '🛒' });
    setImageUrl('');
    setError('');
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setParentForNew(null);
    setForm({ name: cat.name, icon: cat.icon || '🛒' });
    setImageUrl(cat.image || '');
    setError('');
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditing(null); setParentForNew(null); setImageUrl(''); setError(''); };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.single(file);
      setImageUrl(res.data.url);
    } catch {
      setError('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Name is required');
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await categoriesAPI.update(editing._id, { name: form.name, icon: form.icon, image: imageUrl });
      } else {
        const level = parentForNew ? (parentForNew.level + 1) : 1;
        await categoriesAPI.create({ name: form.name, icon: form.icon, image: imageUrl, parent: parentForNew?._id || null, level });
      }
      await load();
      closeForm();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    const questions = [
      `Are you sure you want to delete "${cat.name}"?`,
      `This will also remove all subcategories under "${cat.name}". Still sure?`,
      `All products in "${cat.name}" will become uncategorised. Continue?`,
      `This action cannot be undone. Delete "${cat.name}" permanently?`,
      `Last chance — type YES to confirm deletion of "${cat.name}":`,
    ];
    for (let i = 0; i < 4; i++) {
      if (!window.confirm(questions[i])) return;
    }
    const final = window.prompt(questions[4]);
    if (final?.trim().toUpperCase() !== 'YES') {
      window.alert('Deletion cancelled — you did not type YES.');
      return;
    }
    try { await categoriesAPI.delete(cat._id); await load(); } catch {}
  };

  const levelLabel = parentForNew
    ? (parentForNew.level === 1 ? 'Subcategory' : 'Sub-subcategory')
    : 'Category';

  const levelColors = { 1: '#3498db', 2: '#9b59b6', 3: '#27ae60' };
  const levelNames = { 1: 'Category', 2: 'Subcategory', 3: 'Sub-subcategory' };

  const renderNode = (node, depth = 0) => (
    <div key={node._id} style={{ ...s.node, marginLeft: depth * 24 }}>
      <div style={{ ...s.nodeRow, borderLeft: `3px solid ${levelColors[node.level] || '#ccc'}` }}>
        {node.image
          ? <img src={node.image} alt={node.name} style={s.nodeImg} />
          : <span style={s.nodeIcon}>{node.icon || '📦'}</span>}
        <div style={s.nodeInfo}>
          <span style={s.nodeName}>{node.name}</span>
          <span style={{ ...s.levelBadge, backgroundColor: levelColors[node.level] + '22', color: levelColors[node.level] }}>
            {levelNames[node.level]}
          </span>
        </div>
        <div style={s.nodeActions}>
          {node.level < 3 && (
            <button style={s.addSubBtn} onClick={() => openAdd(node)}>
              + Add {node.level === 1 ? 'Subcategory' : 'Sub-sub'}
            </button>
          )}
          <button style={s.editBtn} onClick={() => openEdit(node)}>Edit</button>
          <button style={s.delBtn} onClick={() => handleDelete(node)}>✕</button>
        </div>
      </div>
      {node.children?.length > 0 && (
        <div style={s.children}>
          {node.children.map((child) => renderNode(child, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Categories</h1>
          <p style={s.sub}>{allCats.length} total • 3-level hierarchy</p>
        </div>
        <button style={s.addBtn} onClick={() => openAdd(null)}>+ Add Category</button>
      </div>

      {/* Legend */}
      <div style={s.legend}>
        {Object.entries(levelNames).map(([lvl, name]) => (
          <span key={lvl} style={{ ...s.legendItem, color: levelColors[lvl] }}>
            <span style={{ ...s.legendDot, backgroundColor: levelColors[lvl] }} /> {name}
          </span>
        ))}
      </div>

      {loading ? (
        <div style={s.center}>Loading...</div>
      ) : tree.length === 0 ? (
        <div style={s.empty}>
          <span style={{ fontSize: 48 }}>📂</span>
          <p style={{ color: '#8E9BAA', marginTop: 12 }}>No categories yet. Add your first one!</p>
        </div>
      ) : (
        <div style={s.tree}>{tree.map((node) => renderNode(node))}</div>
      )}

      {/* Modal */}
      {showForm && (
        <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && closeForm()}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>
                {editing ? `Edit: ${editing.name}` : `New ${levelLabel}`}
                {parentForNew && <span style={s.parentHint}> under {parentForNew.icon} {parentForNew.name}</span>}
              </h2>
              <button style={s.closeBtn} onClick={closeForm}>✕</button>
            </div>

            <form onSubmit={handleSave}>
              <label style={s.label}>Icon</label>
              <div style={s.emojiRow}>
                {EMOJI_SUGGESTIONS.map((e) => (
                  <button type="button" key={e}
                    style={{ ...s.emojiBtn, ...(form.icon === e ? s.emojiBtnActive : {}) }}
                    onClick={() => setForm((f) => ({ ...f, icon: e }))}
                  >{e}</button>
                ))}
                <input style={s.emojiInput} value={form.icon}
                  onChange={(ev) => setForm((f) => ({ ...f, icon: ev.target.value }))}
                  maxLength={4} placeholder="or type" />
              </div>

              <label style={s.label}>Name *</label>
              <input style={s.input} placeholder={`e.g. ${levelLabel} name`}
                value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} autoFocus />

              <label style={s.label}>Category Image (optional)</label>
              <label style={s.uploadBox}>
                {imageUrl ? (
                  <img src={imageUrl} alt="category" style={s.uploadPreview} />
                ) : (
                  <div style={s.uploadPlaceholder}>
                    <span style={{ fontSize: 24 }}>☁️</span>
                    <span style={s.uploadText}>{uploading ? 'Uploading...' : 'Tap to upload image'}</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
              {imageUrl && (
                <button type="button" style={s.removeImgBtn} onClick={() => setImageUrl('')}>✕ Remove image</button>
              )}

              {/* Preview */}
              <div style={s.preview}>
                <span style={{ fontSize: 28 }}>{form.icon || '📦'}</span>
                <span style={s.previewName}>{form.name || `${levelLabel} Name`}</span>
              </div>

              {error && <p style={s.error}>{error}</p>}
              <div style={s.modalFooter}>
                <button type="button" style={s.cancelBtn} onClick={closeForm}>Cancel</button>
                <button type="submit" style={{ ...s.saveBtn, opacity: saving ? 0.7 : 1 }} disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : `Add ${levelLabel}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { padding: 24 },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 },
  sub: { fontSize: 13, color: '#8E9BAA' },
  addBtn: { backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },

  legend: { display: 'flex', gap: 20, marginBottom: 20 },
  legendItem: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 },
  legendDot: { width: 10, height: 10, borderRadius: '50%' },

  center: { textAlign: 'center', color: '#8E9BAA', paddingTop: 60 },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' },
  tree: { display: 'flex', flexDirection: 'column', gap: 8 },

  node: { display: 'flex', flexDirection: 'column', gap: 6 },
  nodeRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 12, padding: '12px 16px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', paddingLeft: 14,
  },
  nodeImg: { width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 },
  nodeIcon: { fontSize: 24, minWidth: 32, textAlign: 'center' },
  nodeInfo: { flex: 1, display: 'flex', alignItems: 'center', gap: 10 },
  nodeName: { fontSize: 15, fontWeight: 700, color: '#1a1a1a' },
  levelBadge: { fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 },
  nodeActions: { display: 'flex', gap: 6, alignItems: 'center' },
  addSubBtn: { backgroundColor: '#EBF5FB', color: '#3498db', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },
  editBtn: { backgroundColor: '#f5f6f3', color: '#1a1a1a', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  delBtn: { backgroundColor: '#FEECEC', color: '#FF3B30', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  children: { display: 'flex', flexDirection: 'column', gap: 6 },

  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modal: { backgroundColor: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  modalTitle: { fontSize: 17, fontWeight: 800, color: '#1a1a1a', flex: 1 },
  parentHint: { fontSize: 13, fontWeight: 400, color: '#8E9BAA' },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#8E9BAA' },

  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 8, marginTop: 16 },
  input: { width: '100%', border: '1.5px solid #E5E5EA', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#1a1a1a', boxSizing: 'border-box', backgroundColor: '#f5f6f3', outline: 'none' },
  emojiRow: { display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  emojiBtn: { fontSize: 20, background: '#f5f6f3', border: '1.5px solid #E5E5EA', borderRadius: 8, width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emojiBtnActive: { borderColor: '#3498db', backgroundColor: '#EBF5FB' },
  emojiInput: { width: 52, border: '1.5px solid #E5E5EA', borderRadius: 8, padding: '6px 8px', fontSize: 16, textAlign: 'center', backgroundColor: '#f5f6f3', outline: 'none' },
  uploadBox: { display: 'flex', cursor: 'pointer', border: '2px dashed #E5E5EA', borderRadius: 12, overflow: 'hidden', minHeight: 90, alignItems: 'center', justifyContent: 'center' },
  uploadPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 16 },
  uploadText: { fontSize: 13, color: '#8E8E93', fontWeight: 600 },
  uploadPreview: { width: '100%', maxHeight: 140, objectFit: 'cover' },
  removeImgBtn: { background: 'none', border: 'none', color: '#FF3B30', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 4, padding: 0 },
  preview: { display: 'flex', alignItems: 'center', gap: 12, backgroundColor: '#f5f6f3', borderRadius: 12, padding: '12px 16px', marginTop: 16 },
  previewName: { fontSize: 15, fontWeight: 700, color: '#1a1a1a' },
  error: { color: '#FF3B30', fontSize: 13, marginTop: 10 },
  modalFooter: { display: 'flex', gap: 10, marginTop: 20 },
  cancelBtn: { flex: 1, backgroundColor: '#F2F2F7', color: '#1a1a1a', border: 'none', borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  saveBtn: { flex: 2, backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
};
