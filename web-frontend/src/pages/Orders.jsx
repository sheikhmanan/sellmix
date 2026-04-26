import { useState, useEffect, useRef } from 'react';
import { ordersAPI } from '../services/api';

let _ordersBeepUrl = null;
function playNewOrderSound() {
  try {
    if (!_ordersBeepUrl) {
      const rate = 22050, freqs = [880, 1100, 1320], noteDur = 0.12, gap = 0.06;
      const total = freqs.length * (noteDur + gap);
      const n = Math.ceil(rate * total);
      const buf = new ArrayBuffer(44 + n * 2);
      const v = new DataView(buf);
      const wr = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
      wr(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true);
      wr(8, 'WAVE'); wr(12, 'fmt '); v.setUint32(16, 16, true);
      v.setUint16(20, 1, true); v.setUint16(22, 1, true);
      v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true);
      v.setUint16(32, 2, true); v.setUint16(34, 16, true);
      wr(36, 'data'); v.setUint32(40, n * 2, true);
      const step = noteDur + gap;
      for (let i = 0; i < n; i++) {
        const t = i / rate;
        const b = Math.floor(t / step);
        const tNote = t - b * step;
        let s = 0;
        if (b < freqs.length && tNote < noteDur) {
          const attack = Math.min(tNote / 0.01, 1);
          const release = Math.min((noteDur - tNote) / 0.01, 1);
          s = Math.sin(2 * Math.PI * freqs[b] * t) * Math.min(attack, release) * 0.6;
        }
        v.setInt16(44 + i * 2, Math.round(s * 32767), true);
      }
      _ordersBeepUrl = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
    }
    const a = new Audio(_ordersBeepUrl);
    a.volume = 0.8;
    a.play().catch(() => {});
  } catch {}
}

const STATUSES = ['placed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];

function printOrder(o) {
  const deliveryLine = o.deliverySlot?.slot
    ? (() => {
        const base = new Date(o.createdAt);
        const d = o.deliverySlot.date;
        let date = new Date(base.getFullYear(), base.getMonth(), base.getDate());
        if (d === 'Tomorrow') date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
        else if (d !== 'Today') { const p = new Date(`${d} ${new Date().getFullYear()}`); if (!isNaN(p)) date = p; }
        return `${date.toLocaleDateString('en-PK')} &nbsp;·&nbsp; ${o.deliverySlot.slot}`;
      })()
    : '';

  const itemsHtml = (o.items || []).map((item) => `
    <tr>
      <td style="padding:8px 6px;border-bottom:1px solid #eee;">${item.name}${item.weight ? ` <span style="color:#888;font-size:11px">(${item.weight})</span>` : ''}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #eee;text-align:right;">Rs. ${item.price?.toLocaleString()}</td>
      <td style="padding:8px 6px;border-bottom:1px solid #eee;text-align:right;font-weight:700;">Rs. ${(item.price * item.quantity)?.toLocaleString()}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html><head><title>Order #${o.orderId}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; padding: 24px; max-width: 600px; margin: 0 auto; }
    .header { text-align:center; border-bottom: 2px solid #3498db; padding-bottom: 14px; margin-bottom: 16px; }
    .header h1 { font-size: 26px; color: #3498db; font-weight: 900; letter-spacing: 1px; }
    .header p { font-size: 11px; color: #888; margin-top: 2px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
    .meta-box { flex: 1; min-width: 180px; background: #f5f5f5; border-radius: 8px; padding: 10px 14px; }
    .meta-box label { font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px; }
    .meta-box span { font-size: 13px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    thead tr { background: #3498db; color: #fff; }
    thead th { padding: 8px 6px; text-align: left; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
    thead th:nth-child(2) { text-align:center; }
    thead th:nth-child(3), thead th:nth-child(4) { text-align:right; }
    .totals { margin-left: auto; width: 220px; }
    .totals div { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; border-bottom: 1px solid #eee; }
    .totals .grand { font-weight: 900; font-size: 16px; color: #3498db; border-bottom: none; margin-top: 6px; padding-top: 8px; border-top: 2px solid #3498db; }
    .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 12px; }
    @media print { body { padding: 8px; } }
  </style></head><body>
  <div class="header">
    <h1>SellMix</h1>
    <p>Chichawatni's Finest Grocery &nbsp;|&nbsp; Block #16, Govt Crescent Girls College Road, Chichawatni</p>
    <p>📞 03178384342</p>
  </div>
  <div class="meta">
    <div class="meta-box"><label>Order ID</label><span>#${o.orderId}</span></div>
    <div class="meta-box"><label>Customer</label><span>${o.customerName}</span></div>
    <div class="meta-box"><label>WhatsApp</label><span>${o.whatsapp}</span></div>
    <div class="meta-box"><label>Payment</label><span>${o.paymentMethod}</span></div>
    <div class="meta-box" style="flex-basis:100%;"><label>Delivery Address</label><span>${o.address}, ${o.city}</span></div>
    ${deliveryLine ? `<div class="meta-box" style="flex-basis:100%;"><label>Delivery Date &amp; Slot</label><span>${deliveryLine}</span></div>` : ''}
    ${o.notes ? `<div class="meta-box" style="flex-basis:100%;"><label>Notes</label><span>${o.notes}</span></div>` : ''}
  </div>
  <table>
    <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="totals">
    <div><span>Subtotal</span><span>Rs. ${o.subtotal?.toLocaleString()}</span></div>
    <div><span>Delivery Fee</span><span>Rs. ${o.deliveryFee?.toLocaleString()}</span></div>
    ${o.discount > 0 ? `<div style="color:#34C759"><span>Discount</span><span>- Rs. ${o.discount?.toLocaleString()}</span></div>` : ''}
    <div class="grand"><span>Total</span><span>Rs. ${o.total?.toLocaleString()}</span></div>
  </div>
  <div class="footer">Thank you for shopping with SellMix! &nbsp;|&nbsp; Printed on ${new Date().toLocaleString('en-PK')}</div>
  <script>window.onload = function(){ window.print(); window.onafterprint = function(){ window.close(); }; }</script>
  </body></html>`;

  const w = window.open('', '_blank', 'width=680,height=900');
  w.document.write(html);
  w.document.close();
}
const STATUS_COLORS = { placed: '#FF9500', packed: '#9B59B6', out_for_delivery: '#3498db', delivered: '#34C759', cancelled: '#FF3B30' };
const STATUS_LABELS = { placed: 'Pending', packed: 'Packed', out_for_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled' };
const PAYMENT_COLORS = { COD: '#FF9500', JazzCash: '#E74C3C', EasyPaisa: '#27AE60' };

// Resolves the actual delivery date from the stored relative label + order createdAt
function resolveDeliveryDate(deliverySlotDate, createdAt) {
  const base = new Date(createdAt);
  const baseDay = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  if (deliverySlotDate === 'Today') return baseDay;
  if (deliverySlotDate === 'Tomorrow') return new Date(baseDay.getFullYear(), baseDay.getMonth(), baseDay.getDate() + 1);
  // Fixed label like "Fri, Apr 24" — parse with current year
  const parsed = new Date(`${deliverySlotDate} ${new Date().getFullYear()}`);
  return isNaN(parsed) ? baseDay : parsed;
}

// Returns true if this order is in the current/next upcoming delivery slot
function isNextSlotOrder(order) {
  if (!order.deliverySlot?.slot) return false;
  if (['delivered', 'cancelled'].includes(order.status)) return false;
  const isMorning = order.deliverySlot.slot.startsWith('10');
  const h = new Date().getHours();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const delivery = resolveDeliveryDate(order.deliverySlot.date, order.createdAt);
  if (delivery.getTime() !== today.getTime()) return false;
  // Morning slot (10 AM–1 PM): urgent before 1 PM
  if (isMorning && h < 13) return true;
  // Afternoon slot (4 PM–7 PM): urgent only after morning slot ends (after 1 PM) and before 7 PM
  if (!isMorning && h >= 13 && h < 19) return true;
  return false;
}

// Returns color config based on the resolved delivery date vs today
function slotUrgency(deliverySlot, createdAt) {
  if (!deliverySlot?.slot) return null;
  const isMorning = deliverySlot.slot.startsWith('10');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const delivery = resolveDeliveryDate(deliverySlot.date, createdAt);
  const deliveryTime = delivery.getTime();

  let dateBadge;
  if (deliveryTime === today.getTime()) {
    dateBadge = { bg: '#e8f8ee', color: '#1a9e4f', label: '🟢 Today' };
  } else if (deliveryTime === tomorrow.getTime()) {
    dateBadge = { bg: '#f3e8ff', color: '#7c3aed', label: '🟣 Tomorrow' };
  } else {
    const label = delivery.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    dateBadge = { bg: '#f3e8ff', color: '#7c3aed', label: `🟣 ${label}` };
  }
  const slotBadge = isMorning
    ? { bg: '#fff0f0', color: '#c0392b', label: '🔴 Morning' }
    : { bg: '#fffbe0', color: '#b7770d', label: '🟡 Afternoon' };
  return { dateBadge, slotBadge };
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [morningReminder, setMorningReminder] = useState(false);
  const [afternoonReminder, setAfternoonReminder] = useState(false);
  const latestOrderId = useRef(null);
  const allOrdersRef = useRef([]);

  useEffect(() => { load(true); }, [filter]);

  useEffect(() => {
    const interval = setInterval(() => poll(), 12000);
    return () => clearInterval(interval);
  }, [filter]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const h = now.getHours();
      const todayStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);

      const isDeliveryToday = (o) => {
        if (!o.deliverySlot?.date) return false;
        const delivery = resolveDeliveryDate(o.deliverySlot.date, o.createdAt);
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return delivery.getTime() === todayMidnight.getTime();
      };

      const pending = allOrdersRef.current.filter(
        (o) => isDeliveryToday(o) && !['delivered', 'cancelled'].includes(o.status)
      );

      // Morning reminder: 8 AM – 10 AM, for pending morning (10 AM–1 PM) orders today
      setMorningReminder(h >= 8 && h < 10 && pending.some((o) => o.deliverySlot?.slot?.startsWith('10')));
      // Afternoon reminder: 2 PM – 4 PM, for pending afternoon (4 PM–7 PM) orders today
      setAfternoonReminder(h >= 14 && h < 16 && pending.some((o) => o.deliverySlot?.slot?.startsWith('4')));
    };
    checkReminders();
    const t = setInterval(checkReminders, 60000);
    return () => clearInterval(t);
  }, []);

  const load = async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const params = (filter && filter !== 'urgent') ? { status: filter } : {};
      const res = await ordersAPI.getAll(params);
      const fetched = res.data.orders;
      if (fetched.length > 0) {
        const newestId = fetched[0]._id;
        if (!initial && latestOrderId.current && latestOrderId.current !== newestId) {
          playNewOrderSound();
          setNewOrderAlert(true);
          setTimeout(() => setNewOrderAlert(false), 5000);
        }
        latestOrderId.current = newestId;
      }
      allOrdersRef.current = fetched;
      setOrders(fetched);
      setTotal(res.data.total);
    } catch {}
    if (initial) setLoading(false);
  };

  const poll = () => load(false);

  const updateStatus = async (id, status) => {
    try {
      await ordersAPI.updateStatus(id, status);
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o));
    } catch {}
  };

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  const displayedOrders = filter === 'urgent' ? orders.filter(isNextSlotOrder) : orders;
  const urgentCount = orders.filter(isNextSlotOrder).length;

  return (
    <div style={s.page}>
      {newOrderAlert && (
        <div style={s.newOrderBanner}>
          🔔 New order received!
        </div>
      )}
      {morningReminder && (
        <div style={s.morningBanner}>
          ⏰ Reminder: You have pending <b>Morning (10:00 AM – 1:00 PM)</b> deliveries today — prepare now!
        </div>
      )}
      {afternoonReminder && (
        <div style={s.afternoonBanner}>
          ⏰ Reminder: You have pending <b>Afternoon (4:00 PM – 7:00 PM)</b> deliveries today — don't miss them!
        </div>
      )}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Orders</h1>
          <p style={s.sub}>{total} total orders</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={s.tabs}>
        <button style={{ ...s.tab, ...(filter === '' ? s.tabActive : {}) }} onClick={() => setFilter('')}>All</button>
        <button
          style={{ ...s.tab, ...(filter === 'urgent' ? s.urgentTabActive : s.urgentTab) }}
          onClick={() => setFilter('urgent')}
        >
          ⚡ Urgent
          {urgentCount > 0 && (
            <span style={{ ...s.urgentBadge, backgroundColor: filter === 'urgent' ? '#fff' : '#FF9500', color: filter === 'urgent' ? '#FF9500' : '#fff' }}>{urgentCount}</span>
          )}
        </button>
        {STATUSES.map((st) => (
          <button
            key={st}
            style={{ ...s.tab, ...(filter === st ? { ...s.tabActive, backgroundColor: STATUS_COLORS[st] + '20', color: STATUS_COLORS[st] } : {}) }}
            onClick={() => setFilter(st)}
          >
            {STATUS_LABELS[st]}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#8E8E93', padding: 24 }}>Loading orders...</p>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {['', 'Order ID', 'Customer', 'WhatsApp', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Action'].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedOrders.map((o) => {
                const urgent = isNextSlotOrder(o);
                return (
                <>
                  {/* Main order row */}
                  <tr
                    key={o._id}
                    style={{
                      ...s.tr,
                      backgroundColor: expanded === o._id ? '#f0f7ff' : urgent ? '#fffbf0' : '#fff',
                      cursor: 'pointer',
                      borderLeft: urgent ? '4px solid #FF9500' : '4px solid transparent',
                    }}
                    onClick={() => toggle(o._id)}
                  >
                    {/* Expand toggle */}
                    <td style={{ ...s.td, width: 32, textAlign: 'center', fontSize: 16, color: '#3498db' }}>
                      {expanded === o._id ? '▼' : '▶'}
                    </td>
                    <td style={s.td}>
                      <b style={{ color: '#3498db' }}>#{o.orderId}</b>
                      {urgent && (
                        <span style={s.urgentBadge}>⚡ NOW</span>
                      )}
                    </td>
                    <td style={s.td}>
                      <p style={{ fontWeight: 600, marginBottom: 2 }}>{o.customerName}</p>
                      <p style={{ fontSize: 12, color: '#8E8E93' }}>{o.address?.slice(0, 28)}{o.address?.length > 28 ? '…' : ''}</p>
                    </td>
                    <td style={s.td}>{o.whatsapp}</td>
                    <td style={s.td}>
                      <span style={s.itemCountBadge}>{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</span>
                    </td>
                    <td style={s.td}><b>Rs. {o.total?.toLocaleString()}</b></td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, backgroundColor: (PAYMENT_COLORS[o.paymentMethod] || '#8E8E93') + '20', color: PAYMENT_COLORS[o.paymentMethod] || '#8E8E93' }}>
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.badge, backgroundColor: STATUS_COLORS[o.status] + '20', color: STATUS_COLORS[o.status] }}>
                        {STATUS_LABELS[o.status]}
                      </span>
                    </td>
                    <td style={s.td}>
                      {o.deliverySlot?.slot && (() => {
                        const deliveryDate = resolveDeliveryDate(o.deliverySlot.date, o.createdAt);
                        const u = slotUrgency(o.deliverySlot, o.createdAt);
                        return (
                          <>
                            <p style={{ fontWeight: 600 }}>
                              {deliveryDate.toLocaleDateString('en-PK')}
                            </p>
                            <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 11, backgroundColor: u.dateBadge.bg, color: u.dateBadge.color, fontWeight: 800, padding: '2px 8px', borderRadius: 10 }}>
                                {u.dateBadge.label}
                              </span>
                              <span style={{ fontSize: 11, backgroundColor: u.slotBadge.bg, color: u.slotBadge.color, fontWeight: 800, padding: '2px 8px', borderRadius: 10 }}>
                                {u.slotBadge.label}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                      {!o.deliverySlot?.slot && (
                        <p>{new Date(o.createdAt).toLocaleDateString('en-PK')}</p>
                      )}
                    </td>
                    <td style={s.td} onClick={(e) => e.stopPropagation()}>
                      <select
                        style={s.select}
                        value={o.status}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                      >
                        {STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABELS[st]}</option>)}
                      </select>
                    </td>
                  </tr>

                  {/* Expanded items row */}
                  {expanded === o._id && (
                    <tr key={`${o._id}-items`} style={{ backgroundColor: '#f0f7ff' }}>
                      <td colSpan={10} style={{ padding: '0 16px 16px 48px' }}>
                        <div style={s.itemsBox}>
                          {/* Items table */}
                          <p style={s.itemsTitle}>🛒 Order Items</p>
                          <table style={s.itemsTable}>
                            <thead>
                              <tr style={{ backgroundColor: '#e8f1fb' }}>
                                <th style={s.ith}>Product</th>
                                <th style={{ ...s.ith, textAlign: 'center' }}>Qty</th>
                                <th style={{ ...s.ith, textAlign: 'right' }}>Unit Price</th>
                                <th style={{ ...s.ith, textAlign: 'right' }}>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {o.items?.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #dbeafe' }}>
                                  <td style={s.itd}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                      {item.image
                                        ? <img src={item.image} alt={item.name} style={s.itemThumb} />
                                        : <div style={s.itemThumbPlaceholder}>🛒</div>}
                                      <div>
                                        <p style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                                        {item.weight && <p style={{ fontSize: 12, color: '#8E8E93' }}>{item.weight}</p>}
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ ...s.itd, textAlign: 'center' }}>
                                    <span style={s.qtyChip}>{item.quantity}</span>
                                  </td>
                                  <td style={{ ...s.itd, textAlign: 'right', color: '#3498db', fontWeight: 600 }}>
                                    Rs. {item.price?.toLocaleString()}
                                  </td>
                                  <td style={{ ...s.itd, textAlign: 'right', fontWeight: 700 }}>
                                    Rs. {(item.price * item.quantity)?.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Order summary footer */}
                          <div style={s.orderSummary}>
                            <div style={s.summaryLeft}>
                              <p style={s.summaryNote}>📍 <b>Address:</b> {o.address}, {o.city}</p>
                              {o.deliverySlot?.slot && (() => {
                                const deliveryDate = resolveDeliveryDate(o.deliverySlot.date, o.createdAt);
                                const u = slotUrgency(o.deliverySlot, o.createdAt);
                                return (
                                  <p style={s.slotNote}>
                                    📅 <b>Delivery Date:</b> {deliveryDate.toLocaleDateString('en-PK')} {' · '}
                                    <span style={{ backgroundColor: u.dateBadge.bg, color: u.dateBadge.color, fontWeight: 800, fontSize: 12, padding: '3px 10px', borderRadius: 20 }}>
                                      {u.dateBadge.label}
                                    </span>
                                    {' '}
                                    <span style={{ backgroundColor: u.slotBadge.bg, color: u.slotBadge.color, fontWeight: 800, fontSize: 12, padding: '3px 10px', borderRadius: 20 }}>
                                      {u.slotBadge.label} · {o.deliverySlot.slot}
                                    </span>
                                  </p>
                                );
                              })()}
                              {o.notes && <p style={s.summaryNote}>📝 <b>Notes:</b> {o.notes}</p>}
                              {o.promoCode && <p style={s.summaryNote}>🏷️ <b>Promo:</b> {o.promoCode}</p>}
                              <button
                                style={s.printBtn}
                                onClick={(e) => { e.stopPropagation(); printOrder(o); }}
                              >
                                🖨️ Print Order
                              </button>
                            </div>
                            <div style={s.summaryRight}>
                              <div style={s.summaryRow}><span>Subtotal</span><span>Rs. {o.subtotal?.toLocaleString()}</span></div>
                              <div style={s.summaryRow}><span>Delivery Fee</span><span>Rs. {o.deliveryFee?.toLocaleString()}</span></div>
                              {o.discount > 0 && <div style={{ ...s.summaryRow, color: '#34C759' }}><span>Discount</span><span>- Rs. {o.discount?.toLocaleString()}</span></div>}
                              <div style={{ ...s.summaryRow, fontWeight: 800, fontSize: 15, borderTop: '1.5px solid #dbeafe', paddingTop: 8, marginTop: 4 }}>
                                <span>Total</span><span style={{ color: '#3498db' }}>Rs. {o.total?.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
              })}
              {!orders.length && (
                <tr><td colSpan={10} style={{ ...s.td, textAlign: 'center', color: '#8E8E93', padding: 40 }}>No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { padding: 28 },
  newOrderBanner: { backgroundColor: '#1a9e4f', color: '#fff', fontWeight: 800, fontSize: 15, padding: '12px 20px', borderRadius: 10, marginBottom: 16, textAlign: 'center', boxShadow: '0 4px 12px rgba(26,158,79,0.3)' },
  morningBanner: { backgroundColor: '#c0392b', color: '#fff', fontWeight: 700, fontSize: 14, padding: '14px 20px', borderRadius: 10, marginBottom: 16, textAlign: 'center', boxShadow: '0 4px 12px rgba(192,57,43,0.3)', lineHeight: 1.5 },
  afternoonBanner: { backgroundColor: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: 14, padding: '14px 20px', borderRadius: 10, marginBottom: 16, textAlign: 'center', boxShadow: '0 4px 12px rgba(124,58,237,0.3)', lineHeight: 1.5 },
  urgentBadge: { display: 'inline-block', marginLeft: 8, backgroundColor: '#FF9500', color: '#fff', fontSize: 10, fontWeight: 900, padding: '2px 7px', borderRadius: 6, letterSpacing: 0.5, verticalAlign: 'middle' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 800, color: '#1a1a1a' },
  sub: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  tabs: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  tab: { padding: '8px 18px', borderRadius: 20, border: '1.5px solid #E5E5EA', backgroundColor: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#6B6B6B' },
  tabActive: { backgroundColor: '#3498db20', color: '#3498db', borderColor: '#3498db' },
  urgentTab: { padding: '8px 18px', borderRadius: 20, border: '1.5px solid #FF9500', backgroundColor: '#fff8f0', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#FF9500', display: 'flex', alignItems: 'center', gap: 6 },
  urgentTabActive: { padding: '8px 18px', borderRadius: 20, border: '1.5px solid #FF9500', backgroundColor: '#FF9500', fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 },
  urgentBadge: { backgroundColor: '#FF9500', color: '#fff', borderRadius: 10, fontSize: 11, fontWeight: 800, padding: '1px 7px', minWidth: 18, textAlign: 'center' },
  tableWrap: { backgroundColor: '#fff', borderRadius: 16, overflow: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 980 },
  th: { textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, color: '#8E8E93', letterSpacing: 1, borderBottom: '1px solid #F2F2F7', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #F2F2F7', transition: 'background 0.15s' },
  td: { padding: '14px 16px', fontSize: 14, color: '#1a1a1a', verticalAlign: 'middle' },
  badge: { padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' },
  itemCountBadge: { backgroundColor: '#EBF5FF', color: '#3498db', fontWeight: 700, fontSize: 12, padding: '3px 10px', borderRadius: 20 },
  select: { border: '1.5px solid #E5E5EA', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer', outline: 'none' },

  // Expanded items section
  itemsBox: { backgroundColor: '#fff', borderRadius: 12, border: '1.5px solid #dbeafe', overflow: 'hidden' },
  itemsTitle: { fontSize: 13, fontWeight: 700, color: '#1a1a1a', padding: '12px 16px', borderBottom: '1px solid #dbeafe', backgroundColor: '#f8fbff' },
  itemsTable: { width: '100%', borderCollapse: 'collapse' },
  ith: { padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'left' },
  itd: { padding: '12px 16px', fontSize: 14, color: '#1a1a1a', verticalAlign: 'middle' },
  itemThumb: { width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 },
  itemThumbPlaceholder: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#F2F2F7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  qtyChip: { backgroundColor: '#EBF5FF', color: '#3498db', fontWeight: 700, fontSize: 13, padding: '3px 12px', borderRadius: 20, display: 'inline-block' },

  orderSummary: { display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderTop: '1px solid #dbeafe', gap: 20, flexWrap: 'wrap', backgroundColor: '#f8fbff' },
  summaryLeft: { flex: 1, display: 'flex', flexDirection: 'column', gap: 6 },
  summaryNote: { fontSize: 13, color: '#4b5563' },
  printBtn: { marginTop: 12, backgroundColor: '#1a2332', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, width: 'fit-content' },
  slotNote: { fontSize: 13, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 6 },
  slotBadge: { backgroundColor: '#EBF5FF', color: '#3498db', fontWeight: 800, fontSize: 12, padding: '3px 10px', borderRadius: 20 },
  summaryRight: { minWidth: 220, display: 'flex', flexDirection: 'column', gap: 6 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4b5563' },
};
