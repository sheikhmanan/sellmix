import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../constants/colors';

export default function TermsConditions() {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);
  return (
    <div style={s.root}>
      <div style={s.container}>

        <p style={s.breadcrumb}>
          <Link to="/" style={s.breadLink}>Home</Link>
          <span style={s.sep}> / </span>
          <span style={s.breadCur}>Terms & Conditions</span>
        </p>

        <h1 style={s.pageTitle}>Terms & Conditions</h1>
        <p style={s.intro}>
          Please read these terms carefully before using our website or mobile app.
        </p>

        <div style={s.section}>
          <h2 style={s.sTitle}>1. Terms of Site</h2>
          <ul style={s.list}>
            <li>By using SellMix you agree to these Terms & Conditions. We may update or change the website at any time without notice.</li>
            <li>When you register, you create a mobile number and password which you must keep confidential. Do not share your login details with anyone.</li>
            <li>We reserve the right to decline a new registration or suspend any account at any time.</li>
            <li>You must not misuse the site by introducing viruses or attempting to gain unauthorised access to our systems.</li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.sTitle}>2. Terms of Sale</h2>
          <ul style={s.list}>
            <li>Delivery is available within <strong>Chichawatni city</strong> only.</li>
            <li>All prices shown are inclusive of any applicable tax.</li>
            <li>Goods are supplied for personal use only. We reserve the right to refuse orders we consider to be for commercial or non-domestic purposes.</li>
            <li>Food goods are supplied at the temperature appropriate to that food and will be delivered in good condition.</li>
            <li>Products are subject to availability. If a product is unavailable, we will contact you to offer an alternative.</li>
            <li>Product images on the app or website are for reference only. The actual product packaging may differ slightly.</li>
            <li>SellMix reserves the right to cancel any order before delivery. You will be notified if your order is cancelled.</li>
            <li>If your items are delivered damaged or do not meet our standards, please contact us immediately at <strong>03178384342</strong>.</li>
            <li>Unless the goods are faulty, it is not possible to return perishable food items.</li>
            <li>Due to bad weather or other events outside our control, your order may be delayed. We will reschedule a new delivery slot for you.</li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.sTitle}>3. Delivery</h2>
          <ul style={s.list}>
            <li>We deliver <strong>twice daily</strong> in Chichawatni — Morning (10 AM – 1 PM) and Afternoon (4 PM – 7 PM).</li>
            <li>Delivery fee: <strong>Rs. 150 flat</strong> within Chichawatni city.</li>
            <li>Someone aged 18 or over must be available to receive and inspect the delivery.</li>
            <li>Delivery times are subject to availability and may change without notice.</li>
            <li>We reserve the right to restrict delivery in certain areas at any time.</li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.sTitle}>4. Payment</h2>
          <ul style={s.list}>
            <li>We currently accept <strong>Cash on Delivery</strong> only.</li>
            <li>Please have the exact amount ready at the time of delivery.</li>
          </ul>
        </div>

        <div style={s.section}>
          <h2 style={s.sTitle}>5. Termination</h2>
          <p style={s.body}>
            These Terms are effective unless terminated by you or SellMix. You may stop using
            the site at any time. We may also terminate access immediately and without notice if
            you fail to comply with any term or provision of these Terms of Use.
          </p>
        </div>

        <div style={s.section}>
          <h2 style={s.sTitle}>6. Changes</h2>
          <p style={s.body}>
            We reserve the right to amend these Terms & Conditions at any time. If we make
            changes, we will let you know by posting the updated terms on our website and app.
            Continued use of SellMix after any changes means you accept the new terms.
          </p>
        </div>

        <div style={{ marginTop: 8 }}>
          <h2 style={s.sTitle}>Contact</h2>
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

  pageTitle: { fontSize: 28, fontWeight: 900, color: '#1a1a1a', marginBottom: 8 },
  intro: { fontSize: 14, color: '#777', marginBottom: 28 },

  section: { marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid #f0f0f0' },
  sTitle: { fontSize: 18, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 },
  body: { fontSize: 14, color: '#555', lineHeight: 1.9, marginBottom: 8 },
  list: { paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#555', lineHeight: 1.8 },
};
