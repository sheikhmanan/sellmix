import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!mobile || !password) return setError('Please enter mobile and password');
    setError('');
    setLoading(true);
    try {
      await login(mobile, password);
      navigate('/');
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

        <h2 style={s.heading}>Welcome back</h2>
        <p style={s.sub}>Login to track orders and checkout faster.</p>

        <form onSubmit={handleLogin} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Mobile Number</label>
            <input style={s.input} type="tel" placeholder="0300 1234567" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={s.passWrap}>
              <input style={s.passInput} type={showPass ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" style={s.eyeBtn} onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</button>
            </div>
          </div>

          {error && <p style={s.error}>⚠️ {error}</p>}

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={s.registerTxt}>
          Don't have an account?{' '}
          <Link to="/register" style={s.link}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.secondary, padding: 20 },
  card: { backgroundColor: COLORS.white, borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' },
  logoWrap: { textAlign: 'center', marginBottom: 28 },
  logo: { fontSize: 28, fontWeight: 900, color: COLORS.primary },
  logoSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  heading: { fontSize: 22, fontWeight: 800, color: COLORS.text, marginBottom: 6 },
  sub: { fontSize: 14, color: COLORS.textLight, marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: COLORS.text },
  input: { border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: '13px 14px', fontSize: 15, outline: 'none', backgroundColor: COLORS.secondary },
  passWrap: { display: 'flex', border: `1.5px solid ${COLORS.border}`, borderRadius: 10, overflow: 'hidden', backgroundColor: COLORS.secondary },
  passInput: { flex: 1, padding: '13px 14px', fontSize: 15, border: 'none', outline: 'none', backgroundColor: 'transparent' },
  eyeBtn: { padding: '0 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 },
  error: { backgroundColor: '#FFF3F3', color: COLORS.error, padding: '10px 14px', borderRadius: 8, fontSize: 13 },
  btn: { backgroundColor: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: 12, padding: '15px', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  registerTxt: { textAlign: 'center', fontSize: 14, color: COLORS.textLight, marginTop: 20 },
  link: { color: COLORS.primary, fontWeight: 700, textDecoration: 'none' },
};
