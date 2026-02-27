import React from 'react';
import { Link } from 'react-router-dom';
import { COLORS } from '../constants/colors';

export default function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.inner}>
        <div style={s.col}>
          <h3 style={s.brand}>SellMix</h3>
          <p style={s.tagline}>Chichawatni's finest grocery store.<br />Fresh products delivered to your door.</p>
          <p style={s.contact}>📞 0300-1234567</p>
          <p style={s.contact}>📍 Chichawatni, Punjab, Pakistan</p>
        </div>

        <div style={s.col}>
          <h4 style={s.colTitle}>Quick Links</h4>
          <Link to="/" style={s.link}>Home</Link>
          <Link to="/products" style={s.link}>All Products</Link>
          <Link to="/track" style={s.link}>Track Order</Link>
          <Link to="/orders" style={s.link}>My Orders</Link>
        </div>

        <div style={s.col}>
          <h4 style={s.colTitle}>Categories</h4>
          <Link to="/products?search=masala" style={s.link}>Recipe Mixes</Link>
          <Link to="/products?search=tea" style={s.link}>Tea</Link>
          <Link to="/products?search=rice" style={s.link}>Rice & Grains</Link>
          <Link to="/products?search=oil" style={s.link}>Cooking Oil</Link>
        </div>

        <div style={s.col}>
          <h4 style={s.colTitle}>Payment Methods</h4>
          <p style={s.payMethod}>💵 Cash on Delivery</p>
          <p style={s.payMethod}>📱 JazzCash</p>
          <p style={s.payMethod}>📲 EasyPaisa</p>
          <div style={s.whatsappBox}>
            <p style={s.waLabel}>Order via WhatsApp</p>
            <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer" style={s.waBtn}>
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

const s = {
  footer: { backgroundColor: '#1a1a2e', color: '#ccc', marginTop: 60 },
  inner: { maxWidth: 1200, margin: '0 auto', padding: '48px 20px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 },
  col: { display: 'flex', flexDirection: 'column', gap: 8 },
  brand: { fontSize: 24, fontWeight: 800, color: COLORS.primary, marginBottom: 8 },
  tagline: { fontSize: 13, lineHeight: 1.7, color: '#aaa' },
  contact: { fontSize: 13, color: '#bbb', marginTop: 4 },
  colTitle: { fontSize: 14, fontWeight: 700, color: COLORS.white, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  link: { fontSize: 13, color: '#aaa', textDecoration: 'none', padding: '3px 0' },
  payMethod: { fontSize: 13, color: '#bbb' },
  whatsappBox: { marginTop: 12, backgroundColor: '#25D366' + '22', borderRadius: 10, padding: '12px', border: '1px solid #25D36640' },
  waLabel: { fontSize: 12, color: '#aaa', marginBottom: 8 },
  waBtn: { backgroundColor: '#25D366', color: COLORS.white, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-block' },
  bottom: { borderTop: '1px solid #333', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 },
  copy: { fontSize: 12, color: '#666' },
};
