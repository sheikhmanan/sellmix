import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../constants/colors';

export default function AboutUs() {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);
  return (
    <div style={s.root}>
      <div style={s.container}>

        <p style={s.breadcrumb}>
          <Link to="/" style={s.breadLink}>Home</Link>
          <span style={s.sep}> / </span>
          <span style={s.breadCur}>About Us</span>
        </p>

        <h1 style={s.pageTitle}>About Us</h1>

        <p style={s.intro}>
          Welcome to <strong>SellMix</strong>,
        </p>
        <p style={s.body}>
          Your number one source for quality grocery products in Chichawatni. We are dedicated to
          bringing you the very best products whilst focusing on three core principles:
          <strong> dependability, customer service, and freshness</strong>. SellMix was founded
          with a simple goal — to offer quality groceries at honest prices while making it easy
          and convenient for every household in Chichawatni.
        </p>

        <div style={s.section}>
          <h2 style={s.sTitle}>Mission Statement</h2>
          <p style={s.sBody}>
            SellMix is on a mission to deliver quality beyond question and save you money — adding
            something special to your everyday shopping experience.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.sTitle}>Vision Statement</h2>
          <p style={s.sBody}>
            For every household in Chichawatni to experience the convenience of fresh, quality
            groceries delivered right to their door at the best possible prices.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.sTitle}>Core Values</h2>
          <p style={s.sBody}>
            To listen to our customers and care for their needs. To provide fresh, quality products
            with honesty and transparency. To build lasting relationships through commitment,
            respect, and trust.
          </p>
        </div>

        <div style={s.contactBox}>
          <h2 style={s.sTitle}>Contact Us</h2>
          <p style={s.sBody}>📞 <strong>03178384342</strong></p>
          <p style={s.sBody}>📍 Block #16, Govt Crescent Girls College Road, Chichawatni</p>
          <a href="https://wa.me/923178384342" target="_blank" rel="noreferrer" style={s.waBtn}>
            💬 Chat on WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '70vh', backgroundColor: '#f5f5f5', padding: '32px 20px 60px' },
  container: { maxWidth: 820, margin: '0 auto', backgroundColor: '#fff', borderRadius: 16, padding: '40px 44px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' },

  breadcrumb: { fontSize: 13, color: '#aaa', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 4 },
  breadLink: { color: COLORS.primary, textDecoration: 'none', fontWeight: 600 },
  sep: { color: '#ccc' },
  breadCur: { color: '#555' },

  pageTitle: { fontSize: 28, fontWeight: 900, color: '#1a1a1a', marginBottom: 20 },
  intro: { fontSize: 15, color: '#333', marginBottom: 10, lineHeight: 1.7 },
  body: { fontSize: 14, color: '#555', lineHeight: 1.9, marginBottom: 32 },

  section: { marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid #f0f0f0' },
  sTitle: { fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 12, textAlign: 'center' },
  sBody: { fontSize: 14, color: '#555', lineHeight: 1.9, textAlign: 'center' },

  contactBox: { marginTop: 8 },
  waBtn: {
    display: 'inline-block', marginTop: 14, backgroundColor: '#25D366',
    color: '#fff', padding: '10px 22px', borderRadius: 10, fontSize: 14,
    fontWeight: 700, textDecoration: 'none',
  },
};
