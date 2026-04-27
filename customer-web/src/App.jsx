import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ordersAPI } from './services/api';

const CANCEL_KEY = 'slx_cancelled_order_ids';

function playCancelSound() {
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3');
    audio.volume = 0.8;
    audio.play().catch(() => {});
  } catch (_) {}
}

function CancelWatcher() {
  const { user } = useAuth();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const check = async () => {
      try {
        const res = await ordersAPI.getMyOrders();
        const orders = res.data || [];
        const seenRaw = localStorage.getItem(CANCEL_KEY);
        const seen = new Set(JSON.parse(seenRaw || '[]'));
        const newlyCancelled = orders.filter(
          (o) => o.status === 'cancelled' && !seen.has(o._id)
        );
        if (newlyCancelled.length > 0) {
          newlyCancelled.forEach((o) => seen.add(o._id));
          localStorage.setItem(CANCEL_KEY, JSON.stringify([...seen]));
          playCancelSound();
          const ids = newlyCancelled.map((o) => `#${o.orderId}`).join(', ');
          alert(`❌ Order Cancelled\n\nYour order ${ids} has been cancelled. Please contact support if you have questions.`);
        }
      } catch (_) {}
    };

    check();
    timerRef.current = setInterval(check, 30000);
    return () => clearInterval(timerRef.current);
  }, [user]);

  return null;
}
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import Categories from './pages/Categories';
import ForgotPassword from './pages/ForgotPassword';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';

const SLOT_TOAST_KEY = 'slx_slot_toast_shown';

function DeliverySlotToast() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const prevUser = useRef(null);

  useEffect(() => {
    // Show only when user just logged in (null → user), not on page refresh
    if (user && !prevUser.current) {
      const lastShown = sessionStorage.getItem(SLOT_TOAST_KEY);
      if (!lastShown) {
        sessionStorage.setItem(SLOT_TOAST_KEY, '1');
        setVisible(true);
        setTimeout(() => setVisible(false), 20000);
      }
    }
    if (!user) sessionStorage.removeItem(SLOT_TOAST_KEY);
    prevUser.current = user;
  }, [user]);

  if (!visible) return null;

  return (
    <div style={ts.overlay}>
      <div style={ts.toast} className="slx-toast">
        <div style={ts.icon}>🚚</div>
        <div style={ts.body}>
          <p style={ts.title} className="slx-toast-title">We deliver twice a day in Chichawatni!</p>
          <div style={ts.slots} className="slx-toast-slots">
            <div style={ts.slot} className="slx-toast-slot">
              <span style={ts.slotIcon} className="slx-toast-slot-icon">🌅</span>
              <div>
                <p style={ts.slotName} className="slx-toast-slot-name">Morning Slot</p>
                <p style={ts.slotTime} className="slx-toast-slot-time">10:00 AM – 1:00 PM</p>
              </div>
            </div>
            <div style={ts.divider} className="slx-toast-divider" />
            <div style={ts.slot} className="slx-toast-slot">
              <span style={ts.slotIcon} className="slx-toast-slot-icon">🌆</span>
              <div>
                <p style={ts.slotName} className="slx-toast-slot-name">Afternoon Slot</p>
                <p style={ts.slotTime} className="slx-toast-slot-time">4:00 PM – 7:00 PM</p>
              </div>
            </div>
          </div>
          <p style={ts.note}>Please select your slot carefully at checkout ✅</p>
        </div>
        <button style={ts.close} onClick={() => setVisible(false)}>✕</button>
        <div style={ts.progressBar}>
          <div style={ts.progressFill} />
        </div>
      </div>
    </div>
  );
}

const ts = {
  overlay: { position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, width: '95%', maxWidth: 640, pointerEvents: 'none' },
  toast: { backgroundColor: '#fff', borderRadius: 20, padding: '26px 28px 14px', boxShadow: '0 16px 48px rgba(124,58,237,0.20), 0 2px 16px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden', borderTop: '6px solid #7c3aed', pointerEvents: 'auto' },
  icon: { fontSize: 38, marginBottom: 12 },
  body: { flex: 1 },
  title: { fontSize: 20, fontWeight: 900, marginBottom: 18, color: '#1a1a1a' },
  slots: { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 },
  divider: { width: 2, height: 52, backgroundColor: '#ede9fe' },
  slot: { display: 'flex', alignItems: 'center', gap: 14, flex: 1 },
  slotIcon: { fontSize: 30 },
  slotName: { fontSize: 14, fontWeight: 800, color: '#7c3aed', marginBottom: 4 },
  slotTime: { fontSize: 17, fontWeight: 900, color: '#1a1a1a', whiteSpace: 'nowrap' },
  note: { fontSize: 14, color: '#6b7280', marginBottom: 10 },
  close: { position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', color: '#9ca3af', fontSize: 20, cursor: 'pointer', padding: 4 },
  progressBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 5, backgroundColor: '#f3e8ff' },
  progressFill: { height: '100%', backgroundColor: '#7c3aed', animation: 'slx-drain 20s linear forwards', width: '100%' },
};

// Inject keyframe + responsive styles once
if (typeof document !== 'undefined' && !document.getElementById('slx-toast-style')) {
  const style = document.createElement('style');
  style.id = 'slx-toast-style';
  style.textContent = `
    @keyframes slx-drain { from { width: 100% } to { width: 0% } }
    @media (max-width: 480px) {
      .slx-toast { padding: 18px 16px 14px !important; }
      .slx-toast-title { font-size: 16px !important; margin-bottom: 12px !important; }
      .slx-toast-slots { flex-direction: column !important; gap: 10px !important; }
      .slx-toast-divider { width: 100% !important; height: 1px !important; }
      .slx-toast-slot { gap: 10px !important; }
      .slx-toast-slot-icon { font-size: 22px !important; }
      .slx-toast-slot-name { font-size: 12px !important; }
      .slx-toast-slot-time { font-size: 14px !important; }
    }
  `;
  document.head.appendChild(style);
}

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

function Layout() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isProductDetail = /^\/products\/[^/]+/.test(location.pathname);
  const hideShell = isMobile && isProductDetail;

  return (
    <>
      {!hideShell && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/track" element={<OrderTracking />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="*" element={<Home />} />
      </Routes>
      {!hideShell && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <CancelWatcher />
          <DeliverySlotToast />
          <Layout />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
