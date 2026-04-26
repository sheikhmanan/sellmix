import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../constants/colors';

const SECTIONS = [
  {
    title: 'Technical',
    items: [
      {
        q: 'Accessibility',
        a: 'We endeavour to make our website and app accessible for each and every one of our customers. Our website is designed to look its best in the latest browsers, but you\'ll still be able to access it from older browsers too.',
      },
      {
        q: 'I am having problems adding and removing items from my cart.',
        a: 'Please try clearing your browser\'s temporary internet files and cache, then reload the page. If the problem continues, try using a different browser or the SellMix mobile app.',
      },
      {
        q: 'Why do I get a "failed login" message when I try to sign in?',
        a: 'There may be a problem with your password. If you have forgotten your password, click the "Forgot Password" option on the login page and follow the steps to reset your password using your mobile number.',
      },
      {
        q: 'Why do I keep getting multiple products when I only asked for one?',
        a: 'In some browsers, clicking the "back" button actually repeats the last action you did. If this was an "add" request, you may be adding extras to your cart without realising it. Try using the website navigation instead of the browser back button.',
      },
    ],
  },
  {
    title: 'Return & Refund',
    items: [
      {
        q: 'What is SellMix\'s return and refund policy?',
        a: 'While we hope you\'ll be happy with your order, we do have a simple and easy-to-follow returns process. If you discover a product is faulty or you are not happy with it, please call our customer support at 03178384342 (9:00am – 9:00pm) to discuss your options — we\'ll be happy to help. If your product is faulty or damaged, we\'ll gladly refund it.',
      },
      {
        q: 'What if I want to return something?',
        a: 'You are eligible for a refund or replacement on items we delivered to you if the item was: (i) Incorrect, (ii) Damaged, (iii) Expired, or (iv) Missing. Please complain by calling 03178384342 (9:00am – 9:00pm). All complaints must be submitted within 2 hours of receiving the order for highly perishable items (bread, eggs, butter, frozen products) and 24 hours for all other items. We will send you the replacement or refund within 24 hours of your complaint, if it is verified.',
      },
      {
        q: 'What if my order is not complete?',
        a: 'When your delivery arrives, if you notice an item is missing and no substitute has been provided, please let your driver know and your bill will be instantly recalculated. If you realise any items are missing after your driver has left, please contact customer support at 03178384342 within 24 hours.',
      },
      {
        q: 'How long will my refund take to clear?',
        a: 'If there is any refund on a returned item, our driver will gladly refund you as soon as he receives the item from you.',
      },
      {
        q: 'What if my refund is cancelled?',
        a: 'Before being processed, all requests are checked. From time to time, a refund request is cancelled because it hasn\'t met our returns criteria.',
      },
      {
        q: 'What if I have a complaint regarding my order?',
        a: 'Complaints, feedback, and queries are always welcome. Give us a call at 03178384342 (9:00am – 9:00pm). Our customer care team is always happy to help.',
      },
    ],
  },
  {
    title: 'Payment & Delivery',
    items: [
      {
        q: 'Do we charge for delivery?',
        a: 'Yes, we charge a flat delivery fee of Rs. 150 within Chichawatni city.',
      },
      {
        q: 'What are our delivery times?',
        a: 'We deliver twice daily in Chichawatni:\n\n• Morning Slot: 10:00 AM – 1:00 PM\n• Afternoon Slot: 4:00 PM – 7:00 PM\n\nDelivery is available 7 days a week, however times may vary.',
      },
      {
        q: 'Can I schedule an order to my convenience?',
        a: 'Yes! At the checkout page, you can select a delivery slot of your choice — Morning or Afternoon.',
      },
      {
        q: 'What if I don\'t receive my order by the scheduled time?',
        a: 'On rare occasions due to unforeseen circumstances, your order might be delayed. In case of any delay, our customer support team will keep you updated. You can also reach us at 03178384342.',
      },
      {
        q: 'What if I\'m not home when you deliver my order?',
        a: 'Your shopping will be taken back. We will do our best to try to arrange another delivery time for you once you have contacted us at 03178384342.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We currently accept Cash on Delivery only. Please have the exact amount ready at the time of delivery.',
      },
    ],
  },
  {
    title: 'Order Status',
    items: [
      {
        q: 'Can I track the status of my order?',
        a: 'Yes, you can track the status of your order under the "My Orders" section in your account.',
      },
      {
        q: 'How do I track my order?',
        a: 'You can find your order status in your account at any time:\n\n1. Login to your account\n2. Go to My Orders\n3. The order status appears on the right side of the page\n\nStatuses include: Pending → Confirmed → Preparing → Out for Delivery → Delivered.',
      },
      {
        q: 'Will I get an order confirmation?',
        a: 'As soon as you place an order, you will receive an order confirmation with your order number and estimated delivery slot.',
      },
    ],
  },
  {
    title: 'Cancellation',
    items: [
      {
        q: 'What is SellMix\'s cancellation policy?',
        a: 'SellMix provides an easy and hassle-free cancellation policy. You can cancel your order at any time prior to it being confirmed. You cannot cancel your order after confirmation unless the item is damaged or faulty.',
      },
      {
        q: 'How can I cancel my order?',
        a: 'You can cancel your order by calling 03178384342 or via WhatsApp before your order is confirmed.',
      },
      {
        q: 'Why has my order been cancelled?',
        a: 'We\'ll always try our best to get your order to you. However, there are times when we\'re unable to — such as in extreme weather, a customer not being at home, or other circumstances beyond our control. We will contact you to inform you if your order is cancelled.',
      },
      {
        q: 'Can I change my delivery address?',
        a: 'You can change your delivery address before you confirm your order. After confirmation, we are unable to make changes to the delivery address.',
      },
    ],
  },
  {
    title: 'Availability',
    items: [
      {
        q: 'How do I check if something is in stock?',
        a: 'We always try our best to stock all your favourite products, but all the products we sell are subject to availability and our range can vary. Products that are out of stock will not be shown on the app or website.',
      },
      {
        q: 'How do I find products?',
        a: 'There are a few different ways to search for products:\n\n1. By category — browse using the Categories menu at the top of the page.\n2. By search — use the search bar to type the name of the product you\'re looking for.',
      },
      {
        q: 'Product Suggestions',
        a: 'We are always trying our best to increase our variety and quality. If you find that we do not have a particular product available, please contact us at 03178384342 or via WhatsApp and suggest which products you need.',
      },
    ],
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
      {open && (
        <p style={s.answer}>
          {a.split('\n').map((line, i) => (
            <span key={i}>{line}<br /></span>
          ))}
        </p>
      )}
    </div>
  );
}

export default function HelpCenter() {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  return (
    <div style={s.root}>
      <div style={s.container}>

        <p style={s.breadcrumb}>
          <Link to="/" style={s.breadLink}>Home</Link>
          <span style={s.sep}> / </span>
          <span style={s.breadCur}>Help Centre</span>
        </p>

        <h1 style={s.pageTitle}>Welcome to our Help Centre.</h1>
        <p style={s.subtitle}>Find answers to the most common questions about SellMix.</p>

        {SECTIONS.map((sec) => (
          <div key={sec.title} style={s.section}>
            <h2 style={s.sectionTitle}>{sec.title}</h2>
            {sec.items.map((item) => (
              <AccordionItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        ))}

        <div style={s.contactBox}>
          <p style={s.contactTitle}>Still need help?</p>
          <p style={s.contactSub}>Our team is available 9:00 AM – 9:00 PM, 7 days a week.</p>
          <div style={s.contactBtns}>
            <a href="tel:03178384342" style={s.callBtn}>📞 03178384342</a>
            <a href="https://wa.me/923178384342" target="_blank" rel="noreferrer" style={s.waBtn}>💬 WhatsApp Us</a>
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

  pageTitle: { fontSize: 28, fontWeight: 900, color: '#1a1a1a', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#777', marginBottom: 36 },

  section: { marginBottom: 36 },
  sectionTitle: {
    fontSize: 18, fontWeight: 800, color: COLORS.white,
    backgroundColor: COLORS.primary, padding: '12px 20px',
    borderRadius: 10, marginBottom: 4,
  },

  item: { borderBottom: '1px solid #e8e8e8', backgroundColor: '#fff', overflow: 'hidden' },
  question: {
    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 14, fontWeight: 700, color: '#1a1a1a', textAlign: 'left', gap: 12,
  },
  chevron: { fontSize: 11, color: '#999', flexShrink: 0 },
  answer: { fontSize: 14, color: '#555', lineHeight: 1.8, padding: '0 20px 16px', margin: 0 },

  contactBox: {
    backgroundColor: COLORS.primary + '0f', border: `1.5px solid ${COLORS.primary}30`,
    borderRadius: 16, padding: '28px 32px', marginTop: 16, textAlign: 'center',
  },
  contactTitle: { fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 },
  contactSub: { fontSize: 13, color: '#666', marginBottom: 20 },
  contactBtns: { display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' },
  callBtn: {
    display: 'inline-block', backgroundColor: COLORS.primary, color: '#fff',
    padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none',
  },
  waBtn: {
    display: 'inline-block', backgroundColor: '#25D366', color: '#fff',
    padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none',
  },
};
