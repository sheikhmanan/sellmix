import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { productsAPI, categoriesAPI, uploadAPI } from '../services/api';

export default function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '', description: '', category: '', price: '', discountPrice: '', costPrice: '',
    unit: 'kg', stock: '', isFeatured: false, nutritionalInfo: '', cookingInstructions: '',
  });
  const [categories, setCategories] = useState([]);
  const [selectedL1, setSelectedL1] = useState('');
  const [selectedL2, setSelectedL2] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Variants state
  const [variants, setVariants] = useState([]);
  const [variantUploading, setVariantUploading] = useState({});

  useEffect(() => {
    categoriesAPI.getAll().then((r) => setCategories(r.data)).catch(() => {});
  }, [id]);

  // Load existing product data when editing
  useEffect(() => {
    if (!isEdit) return;
    productsAPI.getById(id).then((r) => {
      const p = r.data;
      setForm({
        name: p.name || '',
        description: p.description || '',
        category: p.category?._id || p.category || '',
        price: p.price || '',
        discountPrice: p.discountPrice || '',
        costPrice: p.costPrice || '',
        unit: p.unit || 'kg',
        stock: p.stock ?? '',
        isFeatured: p.isFeatured || false,
        nutritionalInfo: p.nutritionalInfo || '',
        cookingInstructions: p.cookingInstructions || '',
      });
      if (p.images?.[0]) setImageUrl(p.images[0]);
      if (p.weightOptions?.length) {
        setVariants(p.weightOptions.map((v) => ({ weight: v.weight || '', price: v.price || '', salePrice: v.salePrice || '', image: v.image || '' })));
      }
      // Resolve category levels so dropdowns show correctly
      const catId = p.category?._id || p.category;
      if (catId) {
        setCategories((prev) => {
          const catObj = prev.find((c) => c._id === catId);
          if (!catObj) return prev;
          const level = catObj.level;
          if (level === 1) { setSelectedL1(catId); }
          else if (level === 2) {
            setSelectedL2(catId);
            const pid = catObj.parent?._id || catObj.parent;
            if (pid) setSelectedL1(pid);
          } else if (level === 3) {
            const l2 = prev.find((c) => c._id === (catObj.parent?._id || catObj.parent));
            if (l2) {
              setSelectedL2(l2._id);
              const l1id = l2.parent?._id || l2.parent;
              if (l1id) setSelectedL1(l1id);
            }
          }
          return prev;
        });
      }
      // Scroll to variant if ?variant=N
      const vi = searchParams.get('variant');
      if (vi !== null) {
        setTimeout(() => {
          document.getElementById(`variant-${vi}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 400);
      }
    }).catch(() => {});
  }, [isEdit, id]);

  const l1Cats = categories.filter((c) => c.level === 1);
  const l2Cats = categories.filter((c) => c.level === 2 && (c.parent?._id || c.parent) === selectedL1);
  const l3Cats = categories.filter((c) => c.level === 3 && (c.parent?._id || c.parent) === selectedL2);

  const handleL1Change = (val) => { setSelectedL1(val); setSelectedL2(''); set('category', val); };
  const handleL2Change = (val) => { setSelectedL2(val); set('category', val || selectedL1); };
  const handleL3Change = (val) => { set('category', val || selectedL2 || selectedL1); };

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

  // Variant helpers
  const addVariant = () => setVariants((v) => [...v, { weight: '', price: '', salePrice: '', image: '' }]);
  const removeVariant = (i) => setVariants((v) => v.filter((_, idx) => idx !== i));
  const setVariantField = (i, field, val) => setVariants((v) => v.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const handleVariantImageUpload = async (e, i) => {
    const file = e.target.files[0];
    if (!file) return;
    setVariantUploading((u) => ({ ...u, [i]: true }));
    try {
      const res = await uploadAPI.single(file);
      setVariantField(i, 'image', res.data.url);
    } catch {
      setError('Variant image upload failed');
    } finally {
      setVariantUploading((u) => ({ ...u, [i]: false }));
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
      const weightOptions = variants
        .filter((v) => v.weight && v.price)
        .map((v) => ({ weight: v.weight, price: Number(v.price), salePrice: Number(v.salePrice) || 0, ...(v.image ? { image: v.image } : {}) }));

      const data = {
        ...form,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice) || 0,
        costPrice: Number(form.costPrice) || 0,
        stock: Number(form.stock),
        images: imageUrl ? [imageUrl] : [],
        weightOptions,
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
        <span />
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
            <select style={s.input} value={selectedL1} onChange={(e) => handleL1Change(e.target.value)}>
              <option value="">Select category</option>
              {l1Cats.map((c) => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          {l2Cats.length > 0 && (
            <div style={s.field}>
              <label style={s.label}>Subcategory</label>
              <select style={s.input} value={selectedL2} onChange={(e) => handleL2Change(e.target.value)}>
                <option value="">Select subcategory (optional)</option>
                {l2Cats.map((c) => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
          )}
          {l3Cats.length > 0 && (
            <div style={s.field}>
              <label style={s.label}>Sub-subcategory</label>
              <select style={s.input} defaultValue="" onChange={(e) => handleL3Change(e.target.value)}>
                <option value="">Select sub-subcategory (optional)</option>
                {l3Cats.map((c) => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
          )}

          <div style={s.row}>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>MRP / Original Price (PKR) <span style={{ color: '#aaa', fontSize: 11 }}>cut-through</span></label>
              <input style={s.input} type="number" placeholder="0.00" value={form.price} onChange={(e) => set('price', e.target.value)} />
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>Sale Price (PKR) <span style={{ color: '#e74c3c', fontSize: 11, fontWeight: 600 }}>shown to customer</span></label>
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
                {['kg', 'g', 'litre', 'ml', 'piece', 'pack', 'dozen', 'bag', 'pcs'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Description</label>
            <textarea style={{ ...s.input, height: 80, resize: 'vertical' }} placeholder="Product description..." value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>

          <label style={{ ...s.label, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} style={{ width: 18, height: 18 }} />
            Featured Product (show on home page)
          </label>

          {error && <p style={s.error}>{error}</p>}
        </div>

        {/* Weight Variants */}
        <div style={s.card}>
          <div style={s.variantHeader}>
            <div>
              <p style={s.sectionLabel}>WEIGHT VARIANTS</p>
              <p style={s.variantHint}>Each variant is shown as a separate product card in the store</p>
            </div>
            <button type="button" style={s.addVariantBtn} onClick={addVariant}>+ Add Variant</button>
          </div>

          {variants.length === 0 && (
            <p style={s.noVariants}>No variants yet. Click "+ Add Variant" to add sizes (e.g. 500g, 1kg, 5L).</p>
          )}

          {variants.map((v, i) => (
            <div key={i} id={`variant-${i}`} style={s.variantCard}>
              <div style={s.variantCardHeader}>
                <span style={s.variantNum}>Variant {i + 1}</span>
                <button type="button" style={s.removeVariantBtn} onClick={() => removeVariant(i)}>✕ Remove</button>
              </div>

              <div style={s.variantBody}>
                {/* Variant image */}
                <label style={s.variantImgBox}>
                  {v.image ? (
                    <img src={v.image} alt={v.weight} style={s.variantImg} />
                  ) : (
                    <div style={s.variantImgPlaceholder}>
                      {variantUploading[i] ? '⏳' : '📷'}
                      <span style={s.variantImgHint}>{variantUploading[i] ? 'Uploading...' : 'Upload image'}</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleVariantImageUpload(e, i)} style={{ display: 'none' }} disabled={variantUploading[i]} />
                </label>

                {/* Variant fields */}
                <div style={s.variantFields}>
                  <div style={s.row}>
                    <div style={{ ...s.field, flex: 1, marginBottom: 0 }}>
                      <label style={s.label}>Weight / Size</label>
                      <input
                        style={s.input}
                        placeholder="e.g. 500g, 1kg, 1L"
                        value={v.weight}
                        onChange={(e) => setVariantField(i, 'weight', e.target.value)}
                      />
                    </div>
                    <div style={{ ...s.field, flex: 1, marginBottom: 0 }}>
                      <label style={s.label}>MRP / Original Price <span style={{ color: '#aaa', fontSize: 11 }}>cut-through</span></label>
                      <input
                        style={s.input}
                        type="number"
                        placeholder="0"
                        value={v.price}
                        onChange={(e) => setVariantField(i, 'price', e.target.value)}
                      />
                    </div>
                    <div style={{ ...s.field, flex: 1, marginBottom: 0 }}>
                      <label style={s.label}>Sale Price <span style={{ color: '#e74c3c', fontSize: 11, fontWeight: 600 }}>shown to customer</span></label>
                      <input
                        style={s.input}
                        type="number"
                        placeholder="leave 0 if no discount"
                        value={v.salePrice}
                        onChange={(e) => setVariantField(i, 'salePrice', e.target.value)}
                      />
                    </div>
                  </div>
                  {v.image && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={s.imgUrlTag}>✅ Image set</span>
                      <button type="button" style={s.clearImgBtn} onClick={() => setVariantField(i, 'image', '')}>Remove</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
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
  backBtn: { backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  title: { flex: 1, fontSize: 22, fontWeight: 800, color: '#1a1a1a' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sectionLabel: { fontSize: 11, fontWeight: 700, color: '#8E8E93', letterSpacing: 1, marginBottom: 4 },
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

  // Variants
  variantHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  variantHint: { fontSize: 12, color: '#AEAEB2', marginTop: 2 },
  addVariantBtn: { backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' },
  noVariants: { fontSize: 13, color: '#AEAEB2', textAlign: 'center', padding: '20px 0' },
  variantCard: { border: '1.5px solid #E5E5EA', borderRadius: 12, padding: 16, marginBottom: 12, backgroundColor: '#FAFAFA' },
  variantCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  variantNum: { fontSize: 13, fontWeight: 700, color: '#3498db' },
  removeVariantBtn: { backgroundColor: '#FF3B3015', color: '#FF3B30', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
  variantBody: { display: 'flex', gap: 14, alignItems: 'flex-start' },
  variantImgBox: { width: 90, height: 90, flexShrink: 0, border: '2px dashed #E5E5EA', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', backgroundColor: '#fff' },
  variantImg: { width: 90, height: 90, objectFit: 'cover' },
  variantImgPlaceholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 8 },
  variantImgHint: { fontSize: 10, color: '#AEAEB2', textAlign: 'center' },
  variantFields: { flex: 1 },
  imgUrlTag: { fontSize: 12, color: '#34C759', fontWeight: 600 },
  clearImgBtn: { fontSize: 11, color: '#FF3B30', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 },
};
