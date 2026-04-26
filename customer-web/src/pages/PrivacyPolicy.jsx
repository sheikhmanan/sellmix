import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../constants/colors';

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);
  return (
    <div style={s.root}>
      <div style={s.container}>

        <p style={s.breadcrumb}>
          <Link to="/" style={s.breadLink}>Home</Link>
          <span style={s.sep}> / </span>
          <span style={s.breadCur}>Privacy Policy</span>
        </p>

        <h1 style={s.pageTitle}>Welcome to SellMix's Privacy Centre</h1>

        <div style={s.section}>
          <h2 style={s.sTitle}>Our Promise</h2>
          <p style={s.body}>
            SellMix is all about you — our customers, our community, and our partners. We are
            working hard to serve you and we understand that your privacy and personal information
            is extremely important. We truly value the trust you place in us. We want you to be
            confident that your data is safe and secure with us, and that we use it only to offer
            you a better, more personalised shopping experience.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.sTitle}>What We Collect</h2>
          <ul style={s.list}>
            <li>Name</li>
            <li>Address</li>
            <li>Mobile Number</li>
            <li>Order History</li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.sTitle}>How We Use Your Information</h2>
          <ul style={s.list}>
            <li>To process and deliver your orders</li>
            <li>To improve your shopping experience</li>
            <li>For safety and security</li>
            <li>To contact you about your orders</li>
            <li>To inform you about new products and offers</li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.sTitle}>Security</h2>
          <ul style={s.list}>
            <li>Access to your account is protected by a password you create and control.</li>
            <li>We use strong data encryption to protect your personal information.</li>
            <li>We regularly monitor our systems for possible vulnerabilities.</li>
            <li>We never share your personal information with third parties without your consent.</li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.sTitle}>Contact</h2>
          <p style={s.body}>
            If you have any questions about our Privacy Policy, please contact us at:
          </p>
          <p style={s.body}>📞 <strong>03178384342</strong></p>
          <p style={s.body}>📍 Block #16, Govt Crescent Girls College Road, Chichawatni</p>
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

  pageTitle: { fontSize: 26, fontWeight: 900, color: '#1a1a1a', marginBottom: 28 },

  section: { marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid #f0f0f0' },
  sTitle: { fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 },
  body: { fontSize: 14, color: '#555', lineHeight: 1.9, marginBottom: 8 },
  list: { paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 },
};
