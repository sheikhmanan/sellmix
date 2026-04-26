import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../constants/colors';

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

export default function Footer() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <footer style={m.footer}>
        {/* Brand */}
        <div style={m.brandRow}>
          <span style={m.brand}>SellMix</span>
          <p style={m.tagline}>Chichawatni's finest grocery store</p>
        </div>

        {/* Links grid */}
        <div style={m.linksGrid}>
          <div style={m.linkCol}>
            <p style={m.colTitle}>Quick Links</p>
            <Link to="/" style={m.link}>Home</Link>
            <Link to="/products" style={m.link}>All Products</Link>
            <Link to="/track" style={m.link}>Track Order</Link>
            <Link to="/orders" style={m.link}>My Orders</Link>
          </div>
          <div style={m.linkCol}>
            <p style={m.colTitle}>Company</p>
            <Link to="/about" style={m.link}>About Us</Link>
            <Link to="/contact" style={m.link}>Contact Us</Link>
          </div>
          <div style={m.linkCol}>
            <p style={m.colTitle}>Contact</p>
            <a href="tel:03178384342" style={m.link}>📞 03178384342</a>
            <a href="https://wa.me/923178384342" target="_blank" rel="noreferrer" style={m.link}>💬 WhatsApp</a>
          </div>
        </div>

        {/* Bottom */}
        <div style={m.bottom}>
          <p style={m.copy}>© {new Date().getFullYear()} SellMix — Chichawatni</p>
        </div>
      </footer>
    );
  }

  return (
    <footer style={s.footer}>
      <div style={s.inner}>
        <div style={s.col}>
          <h3 style={s.brand}>SellMix</h3>
          <p style={s.tagline}>Chichawatni's finest grocery store.<br />Fresh products delivered to your door.</p>
          <p style={s.contact}>📞 03178384342</p>
          <p style={s.contact}>📍 Block #16, Govt Crescent Girls College Road, Chichawatni</p>
        </div>

        <div style={s.col}>
          <h4 style={s.colTitle}>Quick Links</h4>
          <Link to="/" style={s.link}>Home</Link>
          <Link to="/products" style={s.link}>All Products</Link>
          <Link to="/track" style={s.link}>Track Order</Link>
          <Link to="/orders" style={s.link}>My Orders</Link>
        </div>

        <div style={s.col}>
          <h4 style={s.colTitle}>Company</h4>
          <Link to="/about" style={s.link}>About Us</Link>
          <Link to="/contact" style={s.link}>Contact Us</Link>
        </div>

        <div style={s.col}>
          <h4 style={s.colTitle}>Payment Methods</h4>
          <p style={s.payMethod}>💵 Cash on Delivery</p>
          <div style={s.whatsappBox}>
            <p style={s.waLabel}>Order via WhatsApp</p>
            <a href="https://wa.me/923178384342" target="_blank" rel="noreferrer" style={s.waBtn}>
              💬 Chat Now
            </a>
          </div>
        </div>
      </div>

      <div style={s.bottom}>
        <p style={s.copy}>© {new Date().getFullYear()} SellMix — Chichawatni. All rights reserved.</p>
        <p style={s.copy}>Delivery within Chichawatni City • Rs. 150 flat fee</p>
      </div>
    </footer>
  );
}

// Mobile styles
const m = {
  footer: { backgroundColor: '#1a1a2e', color: '#ccc', marginTop: 40, paddingBottom: 0 },
  brandRow: { textAlign: 'center', padding: '28px 20px 16px' },
  brand: { fontSize: 28, fontWeight: 900, color: COLORS.primary, letterSpacing: -0.5 },
  tagline: { fontSize: 12, color: '#888', marginTop: 4 },
  linksGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderTop: '1px solid #2a2a3e', borderBottom: '1px solid #2a2a3e' },

  linkCol: { display: 'flex', flexDirection: 'column', gap: 10, padding: '20px 20px' },
  colTitle: { fontSize: 11, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  link: { fontSize: 13, color: '#aaa', textDecoration: 'none' },
  infoRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 20px', borderBottom: '1px solid #2a2a3e' },
  infoItem: { fontSize: 12, color: '#bbb' },
  waBtn: { backgroundColor: '#25D366', color: '#fff', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: 'none' },
  bottom: { padding: '14px 20px', textAlign: 'center' },
  copy: { fontSize: 11, color: '#555' },
};

// Desktop styles
const s = {
  footer: { backgroundColor: '#1a1a2e', color: '#ccc', marginTop: 60 },
  inner: { maxWidth: 1200, margin: '0 auto', padding: '48px 20px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 },
  col: { display: 'flex', flexDirection: 'column', gap: 8 },
  brand: { fontSize: 24, fontWeight: 800, color: COLORS.primary, marginBottom: 8 },
  tagline: { fontSize: 13, lineHeight: 1.7, color: '#aaa' },
  contact: { fontSize: 13, color: '#bbb', marginTop: 4 },
  colTitle: { fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  link: { fontSize: 13, color: '#aaa', textDecoration: 'none', padding: '3px 0' },
  payMethod: { fontSize: 13, color: '#bbb' },
  whatsappBox: { marginTop: 12, backgroundColor: '#25D366' + '22', borderRadius: 10, padding: '12px', border: '1px solid #25D36640' },
  waLabel: { fontSize: 12, color: '#aaa', marginBottom: 8 },
  waBtn: { backgroundColor: '#25D366', color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-block' },
  bottom: { borderTop: '1px solid #333', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 },
  copy: { fontSize: 12, color: '#666' },
};
