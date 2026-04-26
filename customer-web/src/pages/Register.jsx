import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

export default function Register() {
  const [form, setForm] = useState({ name: '', mobile: '', password: '', address: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.password) return setError('Name, mobile and password are required');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setError('');
    setLoading(true);
    try {
      await register(form);
      window.location.replace('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <div style={s.card}>
        <div style={s.logoWrap}>
          <h1 style={s.logo}>SellMix</h1>
          <p style={s.logoSub}>Chichawatni's Finest Grocery</p>
        </div>

        <h2 style={s.heading}>Create your account</h2>
        <p style={s.sub}>Enter your details to get started.</p>

        <form onSubmit={handleRegister} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Full Name</label>
            <input style={s.input} placeholder="e.g. Ali Ahmed" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Mobile Number</label>
            <input style={s.input} type="tel" placeholder="0300 1234567" value={form.mobile} onChange={(e) => set('mobile', e.target.value)} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={s.passWrap}>
              <input style={s.passInput} type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={(e) => set('password', e.target.value)} />
              <button type="button" style={s.eyeBtn} onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</button>
            </div>
          </div>
          <div style={s.field}>
            <label style={s.label}>Delivery Address <span style={{ color: COLORS.textMuted, fontWeight: 400 }}>(optional)</span></label>
            <textarea style={{ ...s.input, height: 76, resize: 'vertical' }} placeholder="e.g. House #123, Street 4, Chichawatni" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </div>

          {error && <p style={s.error}>⚠️ {error}</p>}

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={s.terms}>By registering, you agree to our <span style={s.link}>Terms of Service</span>.</p>
        <p style={s.loginTxt}>Already have an account? <Link to="/login" style={s.link}>Login</Link></p>
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.secondary, padding: 20 },
  card: { backgroundColor: COLORS.white, borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' },
  logoWrap: { textAlign: 'center', marginBottom: 24 },
  logo: { fontSize: 28, fontWeight: 900, color: COLORS.primary },
  logoSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  heading: { fontSize: 22, fontWeight: 800, color: COLORS.text, marginBottom: 6 },
  sub: { fontSize: 14, color: COLORS.textLight, marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: COLORS.text },
  input: { border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: '13px 14px', fontSize: 15, outline: 'none', backgroundColor: COLORS.secondary, boxSizing: 'border-box', width: '100%', fontFamily: 'inherit' },
  passWrap: { display: 'flex', border: `1.5px solid ${COLORS.border}`, borderRadius: 10, overflow: 'hidden', backgroundColor: COLORS.secondary },
  passInput: { flex: 1, padding: '13px 14px', fontSize: 15, border: 'none', outline: 'none', backgroundColor: 'transparent' },
  eyeBtn: { padding: '0 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 },
  error: { backgroundColor: '#FFF3F3', color: COLORS.error, padding: '10px 14px', borderRadius: 8, fontSize: 13 },
  btn: { backgroundColor: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: 12, padding: '15px', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  terms: { textAlign: 'center', fontSize: 13, color: COLORS.textMuted, marginTop: 16 },
  loginTxt: { textAlign: 'center', fontSize: 14, color: COLORS.textLight, marginTop: 8 },
  link: { color: COLORS.primary, fontWeight: 700, textDecoration: 'none', cursor: 'pointer' },
};
