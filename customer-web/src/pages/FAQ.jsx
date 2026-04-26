import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../constants/colors';

const FAQS = [
  {
    q: 'What is SellMix?',
    a: 'SellMix is Chichawatni\'s most convenient online grocery store. You can order fresh groceries, recipe mixes, cooking oil, tea, rice, and hundreds of other daily-use products directly from our website or mobile app.',
  },
  {
    q: 'What kind of products do you sell?',
    a: 'You can choose from a wide range of products including grocery essentials, recipe mixes (masala), cooking oil, rice & grains, tea, biscuits, dairy, and much more — all sourced fresh for Chichawatni households.',
  },
  {
    q: 'Do you deliver to my location?',
    a: 'We currently deliver within Chichawatni city only. If you are unsure whether we deliver to your area, please contact us at 03178384342.',
  },
  {
    q: 'What areas do you deliver in?',
    a: 'SellMix delivers across all areas within Chichawatni city including all major mohallas, housing schemes, and surrounding localities. Call us at 03178384342 to confirm your area.',
  },
  {
    q: 'Do you charge any taxes over and above the rates shown?',
    a: 'No. The prices shown on our website and app are the final prices. We do not charge anything over and above the rates shown.',
  },
  {
    q: 'Is there a minimum order value?',
    a: 'There is no minimum order requirement. You can order any amount.',
  },
  {
    q: 'What is the delivery fee?',
    a: 'We charge a flat delivery fee of Rs. 150 within Chichawatni city.',
  },
  {
    q: 'How can I make changes to my order before confirmation?',
    a: 'You can edit your cart freely before placing your order. Once your order is placed, please contact us immediately at 03178384342 to request changes before it is confirmed and packed.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We currently accept Cash on Delivery only. Please have the exact amount ready when our delivery rider arrives.',
  },
  {
    q: 'What if I have a complaint regarding my order?',
    a: 'Complaints, feedback, and queries are always welcome. Call us at 03178384342 (9:00am – 9:00pm) or message us on WhatsApp. Our customer care team is always happy to help.',
  },
  {
    q: 'Can I track my order?',
    a: 'Yes! After placing your order, go to "My Orders" in your account to track the current status of your order.',
  },
  {
    q: 'How do I find products?',
    a: 'You can browse by category using the Categories menu, or use the search bar to find specific products by name.',
  },
];

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={s.item}>
      <button style={s.question} onClick={() => setOpen(!open)}>
        <span>{q}</span>
        <span style={s.chevron}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <p style={s.answer}>{a}</p>}
    </div>
  );
}

export default function FAQ() {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  return (
    <div style={s.root}>
      <div style={s.container}>

        <p style={s.breadcrumb}>
          <Link to="/" style={s.breadLink}>Home</Link>
          <span style={s.sep}> / </span>
          <span style={s.breadCur}>FAQs</span>
        </p>

        <h1 style={s.pageTitle}>Frequently Asked Questions</h1>
        <p style={s.subtitle}>Everything you need to know about SellMix.</p>

        <div style={s.list}>
          {FAQS.map((f) => <AccordionItem key={f.q} q={f.q} a={f.a} />)}
        </div>

        <div style={s.contactBox}>
          <p style={s.contactTitle}>Didn't find your answer?</p>
          <p style={s.contactSub}>Our team is available 9:00 AM – 9:00 PM, 7 days a week.</p>
          <div style={s.btns}>
            <a href="tel:03178384342" style={s.callBtn}>📞 03178384342</a>
            <a href="https://wa.me/923178384342" target="_blank" rel="noreferrer" style={s.waBtn}>💬 WhatsApp</a>
          </div>
        </div>

      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '70vh', backgroundColor: '#f5f5f5', padding: '32px 20px 60px' },
  container: { maxWidth: 860, margin: '0 auto' },
  breadcrumb: { fontSize: 13, color: '#aaa', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 4 },
  breadLink: { color: COLORS.primary, textDecoration: 'none', fontWeight: 600 },
  sep: { color: '#ccc' },
  breadCur: { color: '#555' },
  pageTitle: { fontSize: 28, fontWeight: 900, color: '#1a1a1a', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#777', textAlign: 'center', marginBottom: 32 },
  list: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 32 },
  item: { borderBottom: '1px solid #f0f0f0' },
  question: {
    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 14, fontWeight: 700, color: '#1a1a1a', textAlign: 'left', gap: 12,
  },
  chevron: { fontSize: 11, color: '#999', flexShrink: 0 },
  answer: { fontSize: 14, color: '#555', lineHeight: 1.8, padding: '0 20px 16px', margin: 0 },
  contactBox: { backgroundColor: COLORS.primary + '0f', border: `1.5px solid ${COLORS.primary}30`, borderRadius: 16, padding: '28px 32px', textAlign: 'center' },
  contactTitle: { fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 },
  contactSub: { fontSize: 13, color: '#666', marginBottom: 20 },
  btns: { display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' },
  callBtn: { display: 'inline-block', backgroundColor: COLORS.primary, color: '#fff', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' },
  waBtn: { display: 'inline-block', backgroundColor: '#25D366', color: '#fff', padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' },
};
