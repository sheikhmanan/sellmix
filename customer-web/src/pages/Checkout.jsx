import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

const ADMIN_WHATSAPP = '923178384342';

const SLOTS = [
  { key: '10:00 AM – 1:00 PM', label: '🌅 Morning', time: '10:00 AM – 1:00 PM', cutoffHour: 10 },
  { key: '4:00 PM – 7:00 PM',  label: '🌆 Afternoon', time: '4:00 PM – 7:00 PM',  cutoffHour: 16 },
];

function buildDates(pageOffset) {
  const base = new Date();
  base.setDate(base.getDate() + pageOffset * 5);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const isToday = i === 0 && pageOffset === 0;
    const isTomorrow = i === 1 && pageOffset === 0;
    const label = isToday ? 'Today' : isTomorrow ? 'Tomorrow'
      : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return { label, d, isToday };
  });
}

function isSlotClosed(dateEntry, slot) {
  if (!dateEntry.isToday) return false;
  return new Date().getHours() >= slot.cutoffHour;
}

function DeliverySlotPicker({ selectedDate, selectedSlot, onSelect }) {
  const [page, setPage] = useState(0);
  const dates = buildDates(page);
  const monthLabel = dates[0].d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div style={g.wrap}>
      {/* Navigation */}
      <div style={g.nav}>
        <button style={{ ...g.navBtn, opacity: page === 0 ? 0.3 : 1 }} disabled={page === 0} onClick={() => setPage(p => p - 1)}>
          ‹ Previous
        </button>
        <span style={g.monthLabel}>📅 {monthLabel}</span>
        <button style={g.navBtn} onClick={() => setPage(p => p + 1)}>
          Next ›
        </button>
      </div>

      {/* Grid table */}
      <div style={g.tableWrap}>
        <table style={g.table}>
          <thead>
            <tr>
              <th style={g.cornerCell} />
              {dates.map((dt) => (
                <th key={dt.label} style={g.dateHeader}>{dt.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((slot) => (
              <tr key={slot.key}>
                <td style={g.slotLabel}>
                  <span style={{ display: 'block' }}>{slot.label}</span>
                  <span style={{ display: 'block', whiteSpace: 'nowrap', fontSize: 12, fontWeight: 600, color: '#555' }}>{slot.time}</span>
                </td>
                {dates.map((dt) => {
                  const closed = isSlotClosed(dt, slot);
                  const chosen = selectedDate === dt.label && selectedSlot === slot.key;
                  return (
                    <td key={dt.label} style={g.cell}>
                      {closed ? (
                        <div style={g.closedBtn}>{dt.isToday ? 'Closed' : 'Not Available'}</div>
                      ) : (
                        <button
                          style={{ ...g.availBtn, ...(chosen ? g.availBtnSelected : {}) }}
                          onClick={() => onSelect(dt.label, slot.key)}
                        >
                          <span style={g.checkIcon}>{chosen ? '☑' : '☐'}</span> Available
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const PAYMENT_METHODS = [
  { key: 'COD', label: 'Cash on Delivery (COD)', sub: 'Pay when your groceries arrive at your door.', icon: '💵' },
];

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

export default function Checkout() {
  const isMobile = useIsMobile();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const { subtotal = 0, discount = 0, deliveryFee = 150, total = 0, promoCode = '' } = state || {};

  useEffect(() => { if (!user) navigate('/login', { replace: true }); }, [user]);

  const [form, setForm] = useState({ customerName: user?.name || '', whatsapp: user?.mobile || '', address: user?.address || '' });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderModal, setOrderModal] = useState(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const placeOrder = async () => {
    if (!form.customerName || !form.whatsapp || !form.address) return setError('Please fill all delivery details');
    if (!selectedSlot) return setError('Please select a delivery time slot');
    setError('');
    setLoading(true);
    try {
      const res = await ordersAPI.place({
        user: user?._id,
        customerName: form.customerName,
        whatsapp: form.whatsapp,
        address: form.address,
        items: items.map((i) => ({ product: i._id, name: i.name, price: i.discountPrice || i.price, quantity: i.quantity, weight: i.selectedWeight, image: i.images?.[0] || '' })),
        subtotal, deliveryFee, discount, total, paymentMethod, promoCode,
        deliverySlot: { date: selectedDate, slot: selectedSlot },
      });
      clearCart();
      const orderId = res.data.orderId;
      const summary = items.map((i) => `• ${i.name} x${i.quantity} = Rs.${((i.discountPrice || i.price) * i.quantity).toLocaleString()}`).join('\n');
      const msg = `🛒 *New SellMix Order — #${orderId}*\n━━━━━━━━━━━━━━\n👤 ${form.customerName}\n📱 ${form.whatsapp}\n📍 ${form.address}\n🕐 *Delivery: ${selectedDate} | ${selectedSlot}*\n━━━━━━━━━━━━━━\n${summary}\n━━━━━━━━━━━━━━\n💰 Total: *Rs. ${total.toLocaleString()}*\n💳 ${paymentMethod}`;
      const waUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(msg)}`;
      setOrderModal({ orderId, waUrl, total });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Mobile layout ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={m.root}>
        {/* Header */}
        <div style={m.header}>
          <button style={m.backBtn} onClick={() => navigate(-1)}>←</button>
          <span style={m.title}>Secure Checkout</span>
          <div style={{ width: 36 }} />
        </div>

        {/* Progress dots */}
        <div style={m.progressRow}>
          <div style={m.dotFilled} />
          <div style={m.line} />
          <div style={m.dotFilled} />
          <div style={{ ...m.line, backgroundColor: '#ddd' }} />
          <div style={m.dotEmpty} />
        </div>

        <div style={m.scrollArea}>
          {/* Cart Items */}
          <div style={m.card}>
            <div style={m.cardHeader}>
              <span style={m.cardTitle}>Cart Items ({items.length})</span>
              <button style={m.editBtn} onClick={() => navigate('/cart')}>Edit</button>
            </div>
            {items.map((item) => (
              <div key={`${item._id}-${item.selectedWeight}`} style={m.orderItem}>
                <div style={m.imgBox}>
                  {item.images?.[0]
                    ? <img src={item.images[0]} alt={item.name} style={m.img} />
                    : <span style={{ fontSize: 24 }}>🛒</span>}
                </div>
                <div style={m.orderInfo}>
                  <p style={m.orderName}>{item.name}</p>
                  {item.selectedWeight && <p style={m.orderSub}>{item.selectedWeight}</p>}
                  <p style={m.orderSub}>Qty: {item.quantity}</p>
                </div>
                <p style={m.orderPrice}>Rs. {((item.discountPrice || item.price) * item.quantity).toLocaleString()}</p>
              </div>
            ))}
            <div style={m.subtotalRow}>
              <span style={m.subtotalLabel}>Cart Subtotal</span>
              <span style={m.subtotalVal}>Rs. {subtotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery */}
          <div style={m.card}>
            <p style={m.cardTitle}>📍 Delivery in Chichawatni</p>
            <div style={m.field}>
              <label style={m.fieldLabel}>FULL NAME</label>
              <input style={m.input} placeholder="e.g. Muhammad Ahmed" value={form.customerName} onChange={(e) => set('customerName', e.target.value)} />
            </div>
            <div style={m.field}>
              <label style={m.fieldLabel}>WHATSAPP / PHONE NUMBER</label>
              <input style={m.input} placeholder="+92 300 1234567" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
            </div>
            <div style={m.field}>
              <label style={m.fieldLabel}>DETAILED ADDRESS & LANDMARK</label>
              <textarea style={{ ...m.input, height: 80, resize: 'vertical' }} placeholder="House #, Street, Block or nearby landmark" value={form.address} onChange={(e) => set('address', e.target.value)} />
            </div>
          </div>

          {/* Delivery Slot */}
          <div style={m.card}>
            <p style={m.cardTitle}>🕐 Delivery Time Slot</p>
            <DeliverySlotPicker selectedDate={selectedDate} selectedSlot={selectedSlot} onSelect={(d, s) => { setSelectedDate(d); setSelectedSlot(s); }} />
            {selectedSlot && <p style={{ fontSize: 13, color: COLORS.primary, fontWeight: 700, marginTop: 10 }}>✅ {selectedDate} · {selectedSlot}</p>}
          </div>

          {/* Payment */}
          <div style={m.card}>
            <p style={m.cardTitle}>💳 Payment Method</p>
            {PAYMENT_METHODS.map((pm) => (
              <div
                key={pm.key}
                style={{ ...m.payOption, ...(paymentMethod === pm.key ? m.payOptionActive : {}) }}
                onClick={() => setPaymentMethod(pm.key)}
              >
                <div style={{ flex: 1 }}>
                  <p style={m.payLabel}>{pm.icon}  {pm.label}</p>
                  <p style={m.paySub}>{pm.sub}</p>
                </div>
                <div style={{ ...m.radio, ...(paymentMethod === pm.key ? m.radioActive : {}) }}>
                  {paymentMethod === pm.key && <div style={m.radioInner} />}
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div style={m.card}>
            <p style={m.cardTitle}>Order Total</p>
            <div style={m.sumRow}><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
            {discount > 0 && <div style={m.sumRow}><span>Discount</span><span style={{ color: COLORS.success }}>− Rs. {discount.toLocaleString()}</span></div>}
            <div style={m.sumRow}><span>Delivery Fee</span><span style={{ color: COLORS.success }}>Rs. {deliveryFee}</span></div>
            <div style={m.sumRow}><span>Tax</span><span>Rs. 0</span></div>
            <div style={m.totalRow}>
              <span style={m.totalLabel}>Total Amount</span>
              <span style={m.totalAmt}>Rs. {total.toLocaleString()}</span>
            </div>
          </div>

          {error && <p style={m.errorMsg}>⚠️ {error}</p>}
          <p style={m.disclaimer}>By placing order, you agree to SellMix Terms of Service. Your order will be confirmed on WhatsApp.</p>

          {/* Spacer for fixed button */}
          <div style={{ height: 90 }} />
        </div>

        {/* Fixed Place Order button */}
        <div style={m.bottomBar}>
          <button style={m.placeBtn} onClick={placeOrder} disabled={loading}>
            {loading ? 'Placing Order...' : 'Place Order →'}
          </button>
        </div>

        {/* Success Modal */}
        {orderModal && <OrderSuccessModal orderModal={orderModal} navigate={navigate} />}
      </div>
    );
  }

  // ── Desktop layout ────────────────────────────────────────────────────────
  return (
    <div style={s.root}>
      <div style={s.container}>
        <h1 style={s.title}>Secure Checkout</h1>

        <div style={s.progress}>
          {['Cart', 'Checkout', 'Confirmation'].map((step, i) => (
            <React.Fragment key={step}>
              <div style={s.progressItem}>
                <div style={{ ...s.progressDot, ...(i <= 1 ? s.progressDotActive : {}) }}>{i + 1}</div>
                <span style={{ ...s.progressLabel, ...(i <= 1 ? { color: COLORS.primary, fontWeight: 700 } : {}) }}>{step}</span>
              </div>
              {i < 2 && <div style={{ ...s.progressLine, ...(i === 0 ? s.progressLineDone : {}) }} />}
            </React.Fragment>
          ))}
        </div>

        <div style={s.layout}>
          <div style={s.formCol}>
            <div style={s.card}>
              <div style={s.cardHeader}>
                <h2 style={s.cardTitle}>Cart Items ({items.length})</h2>
                <button style={s.editBtn} onClick={() => navigate('/cart')}>Edit</button>
              </div>
              {items.map((item) => (
                <div key={`${item._id}-${item.selectedWeight}`} style={s.orderItem}>
                  <div style={s.orderImgBox}>
                    {item.images?.[0] ? <img src={item.images[0]} alt={item.name} style={s.orderImg} /> : <span>🛒</span>}
                  </div>
                  <div style={s.orderInfo}>
                    <p style={s.orderName}>{item.name}</p>
                    {item.selectedWeight && <p style={s.orderSub}>{item.selectedWeight}</p>}
                    <p style={s.orderSub}>Qty: {item.quantity}</p>
                  </div>
                  <p style={s.orderPrice}>Rs. {((item.discountPrice || item.price) * item.quantity).toLocaleString()}</p>
                </div>
              ))}
              <div style={s.subtotalRow}>
                <span style={s.subtotalLabel}>Cart Subtotal</span>
                <span style={s.subtotalVal}>Rs. {subtotal.toLocaleString()}</span>
              </div>
            </div>

            <div style={s.card}>
              <h2 style={s.cardTitle}>📍 Delivery in Chichawatni</h2>
              <div style={s.field}>
                <label style={s.fieldLabel}>FULL NAME</label>
                <input style={s.input} placeholder="e.g. Muhammad Ahmed" value={form.customerName} onChange={(e) => set('customerName', e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.fieldLabel}>WHATSAPP / PHONE NUMBER</label>
                <input style={s.input} placeholder="+92 300 1234567" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
              </div>
              <div style={s.field}>
                <label style={s.fieldLabel}>DETAILED ADDRESS & LANDMARK</label>
                <textarea style={{ ...s.input, height: 90, resize: 'vertical' }} placeholder="House #, Street, Block, or Nearby Landmark" value={form.address} onChange={(e) => set('address', e.target.value)} />
              </div>
            </div>

            <div style={s.card}>
              <h2 style={s.cardTitle}>🕐 Delivery Time Slot</h2>
              <DeliverySlotPicker selectedDate={selectedDate} selectedSlot={selectedSlot} onSelect={(d, sl) => { setSelectedDate(d); setSelectedSlot(sl); }} />
              {selectedSlot && <p style={{ fontSize: 13, color: COLORS.primary, fontWeight: 700, marginTop: 10 }}>✅ {selectedDate} · {selectedSlot}</p>}
            </div>

            <div style={s.card}>
              <h2 style={s.cardTitle}>💳 Payment Method</h2>
              {PAYMENT_METHODS.map((pm) => (
                <div
                  key={pm.key}
                  style={{ ...s.payOption, ...(paymentMethod === pm.key ? s.payOptionActive : {}) }}
                  onClick={() => setPaymentMethod(pm.key)}
                >
                  <div style={{ flex: 1 }}>
                    <p style={s.payLabel}>{pm.icon}  {pm.label}</p>
                    <p style={s.paySub}>{pm.sub}</p>
                  </div>
                  <div style={{ ...s.radio, ...(paymentMethod === pm.key ? s.radioActive : {}) }}>
                    {paymentMethod === pm.key && <div style={s.radioInner} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={s.summaryCol}>
            <div style={s.summaryCard}>
              <h2 style={s.cardTitle}>Order Total</h2>
              <div style={s.sumRow}><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div>
              {discount > 0 && <div style={s.sumRow}><span>Discount</span><span style={{ color: COLORS.success }}>− Rs. {discount.toLocaleString()}</span></div>}
              <div style={s.sumRow}><span>Delivery Fee</span><span style={{ color: COLORS.success }}>Rs. {deliveryFee}</span></div>
              <div style={{ ...s.sumRow, ...s.totalRow }}>
                <span style={s.totalLabel}>Total Amount</span>
                <span style={s.totalAmt}>Rs. {total.toLocaleString()}</span>
              </div>
              {error && <p style={s.errorMsg}>⚠️ {error}</p>}
              <button style={s.placeBtn} onClick={placeOrder} disabled={loading}>
                {loading ? 'Placing Order...' : 'Place Order →'}
              </button>
              <p style={s.disclaimer}>By placing order, you agree to SellMix Terms of Service. Your order will be confirmed on WhatsApp.</p>
            </div>
          </div>
        </div>
      </div>
      {orderModal && <OrderSuccessModal orderModal={orderModal} navigate={navigate} />}
    </div>
  );
}

function OrderSuccessModal({ orderModal, navigate }) {
  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.modalIcon}>✅</div>
        <h2 style={s.modalTitle}>Order Placed!</h2>
        <p style={s.modalOrderId}>Order #{orderModal.orderId}</p>
        <p style={s.modalTotal}>Total: <strong>Rs. {orderModal.total.toLocaleString()}</strong></p>
        <p style={s.modalSub}>Confirm your order on WhatsApp so we can process it quickly.</p>
        <div style={s.modalBtns}>
          <a href={orderModal.waUrl} target="_blank" rel="noreferrer" style={s.waBtn}
            onClick={() => navigate(`/track?orderId=${orderModal.orderId}`, { state: { success: true, orderId: orderModal.orderId } })}>
            💬 Confirm on WhatsApp
          </a>
          <button style={s.doneBtn}
            onClick={() => navigate(`/track?orderId=${orderModal.orderId}`, { state: { success: true, orderId: orderModal.orderId } })}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delivery Slot Grid styles ─────────────────────────────────────────────────
const PRIMARY = '#3498db';
const g = {
  wrap: { overflowX: 'auto' },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn: { background: 'none', border: '1.5px solid #d0d0d0', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 700, color: '#333', cursor: 'pointer' },
  monthLabel: { fontSize: 14, fontWeight: 700, color: '#333' },
  tableWrap: { overflowX: 'auto', borderRadius: 10, border: '1px solid #e0e0e0' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 560 },
  cornerCell: { width: 160, borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', backgroundColor: '#fafafa', padding: '10px 8px' },
  dateHeader: { textAlign: 'center', padding: '12px 8px', fontSize: 13, fontWeight: 800, color: '#333', borderBottom: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', backgroundColor: '#fafafa', whiteSpace: 'nowrap' },
  slotLabel: { width: 160, padding: '16px 12px', fontSize: 13, fontWeight: 800, color: '#222', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', textAlign: 'right', backgroundColor: '#fafafa', lineHeight: 1.6, whiteSpace: 'nowrap' },
  cell: { padding: '8px 6px', textAlign: 'center', borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' },
  availBtn: { width: '100%', padding: '10px 4px', backgroundColor: PRIMARY, color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 },
  availBtnSelected: { backgroundColor: '#1a6fab', boxShadow: `inset 0 0 0 2px #fff, 0 0 0 2px #1a6fab` },
  closedBtn: { width: '100%', padding: '10px 4px', backgroundColor: '#f0f0f0', color: '#aaa', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, textAlign: 'center' },
  checkIcon: { fontSize: 14 },
};

// ── Mobile styles ─────────────────────────────────────────────────────────────
const m = {
  root: { minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' },
  header: { position: 'sticky', top: 0, zIndex: 50, backgroundColor: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' },
  backBtn: { width: 36, height: 36, borderRadius: '50%', backgroundColor: COLORS.primary, color: '#fff', border: 'none', fontSize: 18, fontWeight: 700, cursor: 'pointer' },
  title: { fontSize: 17, fontWeight: 800, color: '#1a1a1a' },
  progressRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 40px', backgroundColor: '#fff', borderBottom: '1px solid #eee' },
  dotFilled: { width: 14, height: 14, borderRadius: '50%', backgroundColor: COLORS.primary, flexShrink: 0 },
  dotEmpty: { width: 14, height: 14, borderRadius: '50%', backgroundColor: '#ddd', flexShrink: 0 },
  line: { flex: 1, height: 2, backgroundColor: COLORS.primary, margin: '0 6px' },
  scrollArea: { flex: 1, padding: '12px 14px 0' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: '16px', marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 },
  editBtn: { color: COLORS.primary, background: 'none', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  orderItem: { display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid #f0f0f0' },
  imgBox: { width: 46, height: 46, borderRadius: 8, backgroundColor: '#f5f5f5', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  orderInfo: { flex: 1, minWidth: 0 },
  orderName: { fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 2 },
  orderSub: { fontSize: 11, color: '#888' },
  orderPrice: { fontSize: 13, fontWeight: 700, color: COLORS.primary, flexShrink: 0 },
  subtotalRow: { display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #eee' },
  subtotalLabel: { fontSize: 14, fontWeight: 700, color: '#1a1a1a' },
  subtotalVal: { fontSize: 14, fontWeight: 800, color: '#1a1a1a' },
  field: { marginBottom: 14 },
  fieldLabel: { display: 'block', fontSize: 10, fontWeight: 800, color: '#aaa', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' },
  input: { width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', backgroundColor: '#fafafa', boxSizing: 'border-box' },
  payOption: { display: 'flex', alignItems: 'center', border: '1.5px solid #e0e0e0', borderRadius: 10, padding: '12px 14px', marginBottom: 8, cursor: 'pointer' },
  payOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '08' },
  payLabel: { fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 },
  paySub: { fontSize: 11, color: '#888' },
  radio: { width: 20, height: 20, borderRadius: '50%', border: '2px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioActive: { borderColor: COLORS.primary },
  radioInner: { width: 9, height: 9, borderRadius: '50%', backgroundColor: COLORS.primary },
  sumRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#666', marginBottom: 10 },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 15, fontWeight: 700, color: '#1a1a1a' },
  totalAmt: { fontSize: 20, fontWeight: 900, color: COLORS.primary },
  errorMsg: { backgroundColor: '#FFF3F3', color: '#e74c3c', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 10 },
  disclaimer: { fontSize: 11, color: '#aaa', textAlign: 'center', lineHeight: 1.6, marginBottom: 10 },
  bottomBar: { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, backgroundColor: '#fff', borderTop: '1px solid #eee', padding: '10px 16px' },
  placeBtn: { width: '100%', padding: '15px', backgroundColor: COLORS.primary, color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer' },
};

// ── Desktop styles ────────────────────────────────────────────────────────────
const s = {
  root: { backgroundColor: COLORS.secondary, minHeight: '70vh' },
  container: { maxWidth: 1100, margin: '0 auto', padding: '32px 20px' },
  title: { fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 24 },
  progress: { display: 'flex', alignItems: 'center', marginBottom: 32 },
  progressItem: { display: 'flex', alignItems: 'center', gap: 8 },
  progressDot: { width: 28, height: 28, borderRadius: '50%', backgroundColor: COLORS.lightGrey, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: COLORS.textMuted },
  progressDotActive: { backgroundColor: COLORS.primary, color: COLORS.white },
  progressLabel: { fontSize: 13, color: COLORS.textMuted },
  progressLine: { flex: 1, height: 2, backgroundColor: COLORS.border, margin: '0 8px' },
  progressLineDone: { backgroundColor: COLORS.primary },
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'flex-start' },
  formCol: { display: 'flex', flexDirection: 'column', gap: 16 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 16 },
  editBtn: { color: COLORS.primary, background: 'none', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  orderItem: { display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${COLORS.lightGrey}`, paddingBottom: 12, marginBottom: 12 },
  orderImgBox: { width: 50, height: 50, borderRadius: 8, backgroundColor: COLORS.lightGrey, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  orderImg: { width: '100%', height: '100%', objectFit: 'cover' },
  orderInfo: { flex: 1 },
  orderName: { fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 3 },
  orderSub: { fontSize: 12, color: COLORS.textLight },
  orderPrice: { fontSize: 14, fontWeight: 700, color: COLORS.primary },
  subtotalRow: { display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${COLORS.border}` },
  subtotalLabel: { fontSize: 15, fontWeight: 700, color: COLORS.text },
  subtotalVal: { fontSize: 15, fontWeight: 800, color: COLORS.text },
  field: { marginBottom: 16 },
  fieldLabel: { display: 'block', fontSize: 11, fontWeight: 700, color: COLORS.textMuted, letterSpacing: 1, marginBottom: 8 },
  input: { width: '100%', border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', backgroundColor: COLORS.secondary, boxSizing: 'border-box' },
  payOption: { display: 'flex', alignItems: 'center', border: `1.5px solid ${COLORS.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 10, cursor: 'pointer' },
  payOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '08' },
  payLabel: { fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 4 },
  paySub: { fontSize: 12, color: COLORS.textLight },
  radio: { width: 22, height: 22, borderRadius: '50%', border: `2px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.primary },
  radioInner: { width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS.primary },
  summaryCol: { position: 'sticky', top: 80 },
  summaryCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  sumRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: COLORS.textLight, marginBottom: 10 },
  totalRow: { borderTop: `1px solid ${COLORS.border}`, paddingTop: 14, marginTop: 4, marginBottom: 20 },
  totalLabel: { fontSize: 17, fontWeight: 700, color: COLORS.text },
  totalAmt: { fontSize: 26, fontWeight: 900, color: COLORS.primary },
  errorMsg: { backgroundColor: '#FFF3F3', color: COLORS.error, padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 14 },
  placeBtn: { width: '100%', padding: '15px', backgroundColor: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginBottom: 12 },
  disclaimer: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', lineHeight: 1.6 },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#fff', borderRadius: 20, padding: '40px 32px', maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalIcon: { fontSize: 52, marginBottom: 12 },
  modalTitle: { fontSize: 24, fontWeight: 900, color: '#1a1a1a', marginBottom: 8 },
  modalOrderId: { fontSize: 14, color: '#888', marginBottom: 4 },
  modalTotal: { fontSize: 18, color: '#1a1a1a', marginBottom: 12 },
  modalSub: { fontSize: 13, color: '#666', marginBottom: 28, lineHeight: 1.6 },
  modalBtns: { display: 'flex', flexDirection: 'column', gap: 12 },
  waBtn: { display: 'block', backgroundColor: '#25D366', color: '#fff', borderRadius: 12, padding: '14px 24px', fontSize: 15, fontWeight: 700, textDecoration: 'none' },
  doneBtn: { backgroundColor: '#f0f0f0', color: '#333', border: 'none', borderRadius: 12, padding: '14px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
};
