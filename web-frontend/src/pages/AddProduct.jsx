import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsAPI, categoriesAPI, uploadAPI } from '../services/api';

export default function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '', description: '', category: '', price: '', discountPrice: '', costPrice: '',
    unit: 'kg', stock: '', isFeatured: false, nutritionalInfo: '', cookingInstructions: '',
  });
  const [categories, setCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    categoriesAPI.getAll().then((r) => setCategories(r.data)).catch(() => {});
    if (isEdit) {
      productsAPI.getAll({ limit: 1 }).then(() => {}).catch(() => {}); // placeholder - load specific product
    }
  }, [id]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

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
    setError('');
    if (!form.name || !form.category || !form.price || !form.stock) {
      return setError('Name, category, price and stock are required');
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice) || 0,
        costPrice: Number(form.costPrice) || 0,
        stock: Number(form.stock),
        images: imageUrl ? [imageUrl] : [],
      };
      if (isEdit) await productsAPI.update(id, data);
      else await productsAPI.create(data);
      navigate('/products');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/products')}>← Back</button>
        <h1 style={s.title}>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        <span>❓</span>
      </div>

      <form onSubmit={handleSave} style={s.form}>
        {/* Image Upload */}
        <div style={s.card}>
          <p style={s.sectionLabel}>PRODUCT IMAGE</p>
          <label style={s.uploadBox}>
            {imageUrl ? (
              <img src={imageUrl} alt="product" style={s.previewImg} />
            ) : (
              <div style={s.uploadPlaceholder}>
                <span style={{ fontSize: 32 }}>☁️</span>
                <p style={s.uploadText}>{uploading ? 'Uploading...' : 'Tap to upload product photo'}</p>
                <p style={s.uploadHint}>PNG, JPG up to 5MB</p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </div>

        <div style={s.card}>
          {/* Basic Info */}
          <div style={s.field}>
            <label style={s.label}>Product Name</label>
            <input style={s.input} placeholder="e.g. Premium Basmati Rice" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Category</label>
            <select style={s.input} value={form.category} onChange={(e) => set('category', e.target.value)}>
              <option value="">Select a category</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          <div style={s.row}>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Sale Price (PKR)</label>
              <input style={s.input} type="number" placeholder="0.00" value={form.price} onChange={(e) => set('price', e.target.value)} />
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Discount Price (PKR)</label>
              <input style={s.input} type="number" placeholder="0.00" value={form.discountPrice} onChange={(e) => set('discountPrice', e.target.value)} />
            </div>
          </div>

          <div style={s.row}>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Cost Price (PKR) <span style={{ color: '#34C759', fontSize: 11, fontWeight: 600 }}>for profit tracking</span></label>
              <input style={{ ...s.input, borderColor: '#34C75940', backgroundColor: '#f0fdf4' }} type="number" placeholder="Your buying cost" value={form.costPrice} onChange={(e) => set('costPrice', e.target.value)} />
            </div>
            {form.price && form.costPrice ? (
              <div style={{ ...s.field, flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: 16 }}>
                <div style={s.marginBadge}>
                  <span style={s.marginLabel}>Gross Margin</span>
                  <span style={s.marginValue}>
                    Rs. {(Number(form.discountPrice || form.price) - Number(form.costPrice)).toLocaleString()} &nbsp;
                    ({Math.round(((Number(form.discountPrice || form.price) - Number(form.costPrice)) / Number(form.discountPrice || form.price)) * 100)}%)
                  </span>
                </div>
              </div>
            ) : <div style={{ flex: 1 }} />}
          </div>

          <div style={s.row}>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Stock Quantity</label>
              <input style={s.input} type="number" placeholder="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} />
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Unit</label>
              <select style={s.input} value={form.unit} onChange={(e) => set('unit', e.target.value)}>
                {['kg', 'g', 'litre', 'ml', 'piece', 'pack', 'dozen', 'bag'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Description</label>
            <textarea style={{ ...s.input, height: 80, resize: 'vertical' }} placeholder="Product description..." value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Nutritional Information</label>
            <textarea style={{ ...s.input, height: 60, resize: 'vertical' }} placeholder="Calories, protein, etc." value={form.nutritionalInfo} onChange={(e) => set('nutritionalInfo', e.target.value)} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Cooking Instructions</label>
            <textarea style={{ ...s.input, height: 60, resize: 'vertical' }} placeholder="How to prepare..." value={form.cookingInstructions} onChange={(e) => set('cookingInstructions', e.target.value)} />
          </div>

          <label style={{ ...s.label, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} style={{ width: 18, height: 18 }} />
            Featured Product (show on home page)
          </label>

          {error && <p style={s.error}>{error}</p>}
        </div>

        <div style={s.footer}>
          <button type="button" style={s.cancelBtn} onClick={() => navigate('/products')}>🗑️ Cancel</button>
          <button type="submit" style={{ ...s.saveBtn, opacity: saving ? 0.7 : 1 }} disabled={saving}>
            💾 {saving ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

const s = {
  page: { padding: 24, maxWidth: 700, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingTop: 8 },
  backBtn: { background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#1a1a1a' },
  title: { flex: 1, fontSize: 22, fontWeight: 800, color: '#1a1a1a' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: '#8E8E93', letterSpacing: 1, marginBottom: 12 },
  uploadBox: { display: 'flex', cursor: 'pointer', border: '2px dashed #E5E5EA', borderRadius: 14, overflow: 'hidden', minHeight: 140, alignItems: 'center', justifyContent: 'center' },
  uploadPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 24 },
  uploadText: { fontSize: 14, color: '#8E8E93', fontWeight: 600 },
  uploadHint: { fontSize: 12, color: '#AEAEB2' },
  previewImg: { width: '100%', maxHeight: 220, objectFit: 'cover' },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 },
  input: { width: '100%', border: '1.5px solid #E5E5EA', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: '#1a1a1a', boxSizing: 'border-box', backgroundColor: '#f5f6f3', outline: 'none' },
  row: { display: 'flex', gap: 16 },
  error: { color: '#FF3B30', fontSize: 13, marginTop: 8 },
  marginBadge: { backgroundColor: '#f0fdf4', border: '1.5px solid #34C759', borderRadius: 10, padding: '10px 14px', width: '100%' },
  marginLabel: { display: 'block', fontSize: 11, fontWeight: 700, color: '#34C759', marginBottom: 4 },
  marginValue: { fontSize: 15, fontWeight: 800, color: '#1a1a1a' },
  footer: { display: 'flex', gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: '#F2F2F7', color: '#1a1a1a', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  saveBtn: { flex: 2, backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
};
