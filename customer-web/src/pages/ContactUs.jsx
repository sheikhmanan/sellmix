import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../constants/colors';

export default function ContactUs() {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

  return (
    <div style={s.root}>
      <div style={s.container}>

        <p style={s.breadcrumb}>
          <Link to="/" style={s.breadLink}>Home</Link>
          <span style={s.sep}> / </span>
          <span style={s.breadCur}>Contact Us</span>
        </p>

        <h1 style={s.pageTitle}>Contact Us</h1>
        <p style={s.subtitle}>Get in touch with us — we're always happy to help.</p>

        {/* Contact Cards */}
        <div style={s.cardsRow}>
          <a href="tel:03178384342" style={s.card}>
            <span style={s.cardIcon}>📞</span>
            <p style={s.cardLabel}>Call Us</p>
            <p style={s.cardValue}>03178384342</p>
            <p style={s.cardNote}>9:00 AM – 9:00 PM, 7 days</p>
          </a>

          <a href="https://wa.me/923178384342" target="_blank" rel="noreferrer" style={{ ...s.card, borderColor: '#25D36640' }}>
            <span style={s.cardIcon}>💬</span>
            <p style={s.cardLabel}>WhatsApp</p>
            <p style={s.cardValue}>03178384342</p>
            <p style={s.cardNote}>Quick replies on WhatsApp</p>
          </a>

          <div style={{ ...s.card, cursor: 'default' }}>
            <span style={s.cardIcon}>📍</span>
            <p style={s.cardLabel}>Our Location</p>
            <p style={s.cardValue}>Chichawatni</p>
            <p style={s.cardNote}>Punjab, Pakistan</p>
          </div>
        </div>

        {/* Info Block */}
        <div style={s.infoBlock}>
          <h2 style={s.infoTitle}>GET IN TOUCH WITH US</h2>
          <p style={s.infoSub}>
            If you need any help, please contact us via phone or WhatsApp. We will get back to you
            as soon as possible.
          </p>
          <div style={s.infoRows}>
            <div style={s.infoRow}>
              <span style={s.infoKey}>📞 Mobile Number:</span>
              <span style={s.infoVal}>03178384342</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoKey}>🕐 Hours:</span>
              <span style={s.infoVal}>Mon – Sun, 9:00am – 9:00pm</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoKey}>📍 Address:</span>
              <span style={s.infoVal}>Block #16, Govt Crescent Girls College Road, Chichawatni</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoKey}>🚚 Delivery Area:</span>
              <span style={s.infoVal}>Chichawatni city only</span>
            </div>
          </div>
        </div>

        {/* Delivery Slots */}
        <div style={s.slotsBox}>
          <h2 style={s.slotsTitle}>Delivery Slots</h2>
          <div style={s.slotsRow}>
            <div style={s.slotCard}>
              <p style={s.slotIcon}>🌅</p>
              <p style={s.slotName}>Morning Slot</p>
              <p style={s.slotTime}>10:00 AM – 1:00 PM</p>
            </div>
            <div style={s.slotCard}>
              <p style={s.slotIcon}>🌆</p>
              <p style={s.slotName}>Afternoon Slot</p>
              <p style={s.slotTime}>4:00 PM – 7:00 PM</p>
            </div>
          </div>
          <p style={s.slotNote}>Delivery fee: Rs. 150 flat • Chichawatni city only</p>
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
  subtitle: { fontSize: 14, color: '#777', marginBottom: 28 },

  cardsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: '28px 20px', textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)', textDecoration: 'none',
    border: `1.5px solid ${COLORS.primary}30`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
  },
  cardIcon: { fontSize: 36, marginBottom: 8 },
  cardLabel: { fontSize: 12, fontWeight: 700, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardValue: { fontSize: 18, fontWeight: 800, color: COLORS.primary },
  cardNote: { fontSize: 12, color: '#888' },

  infoBlock: { backgroundColor: '#fff', borderRadius: 16, padding: '32px 36px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: 20 },
  infoTitle: { fontSize: 16, fontWeight: 800, color: '#1a1a1a', marginBottom: 8, letterSpacing: 0.5 },
  infoSub: { fontSize: 13, color: '#777', marginBottom: 22, lineHeight: 1.7 },
  infoRows: { display: 'flex', flexDirection: 'column', gap: 14 },
  infoRow: { display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' },
  infoKey: { fontSize: 14, fontWeight: 700, color: '#1a1a1a', minWidth: 160 },
  infoVal: { fontSize: 14, color: '#555' },

  slotsBox: { backgroundColor: '#fff', borderRadius: 16, padding: '28px 32px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', textAlign: 'center' },
  slotsTitle: { fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 20 },
  slotsRow: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 },
  slotCard: { backgroundColor: '#f5f0ff', borderRadius: 14, padding: '20px 32px', borderLeft: `4px solid ${COLORS.primary}` },
  slotIcon: { fontSize: 28, marginBottom: 6 },
  slotName: { fontSize: 14, fontWeight: 800, color: COLORS.primary, marginBottom: 4 },
  slotTime: { fontSize: 18, fontWeight: 800, color: '#1a1a1a' },
  slotNote: { fontSize: 13, color: '#888' },
};
