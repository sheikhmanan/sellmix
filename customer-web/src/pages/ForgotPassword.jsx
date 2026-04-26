import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { COLORS } from '../constants/colors';

const api = axios.create({ baseURL: '/api' });

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1 = enter mobile, 2 = enter new password, 3 = success
  const [mobile, setMobile] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFindAccount = async (e) => {
    e.preventDefault();
    if (!mobile) return setError('Please enter your mobile number');
    setError('');
    setLoading(true);
    try {
      // Verify mobile exists by attempting a dry-check via reset endpoint with no password
      // We'll just move to step 2 and let the final submit catch "not found"
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!newPassword) return setError('Please enter a new password');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { mobile, newPassword });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
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

        {step === 1 && (
          <>
            <p style={s.title}>Forgot Password</p>
            <p style={s.sub}>Enter the mobile number linked to your account.</p>
            <form onSubmit={handleFindAccount} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>Mobile Number</label>
                <input
                  style={s.input}
                  type="tel"
                  placeholder="0300 1234567"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </div>
              {error && <p style={s.error}>⚠️ {error}</p>}
              <button type="submit" style={s.btn} disabled={loading}>
                {loading ? 'Checking...' : 'Continue'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <p style={s.title}>Set New Password</p>
            <p style={s.sub}>Choose a new password for <strong>{mobile}</strong>.</p>
            <form onSubmit={handleReset} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>New Password</label>
                <div style={s.passWrap}>
                  <input
                    style={s.passInput}
                    type={showPass ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowPass(!showPass)}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Confirm Password</label>
                <input
                  style={s.input}
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {error && <p style={s.error}>⚠️ {error}</p>}
              <button type="submit" style={s.btn} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button type="button" style={s.backBtn} onClick={() => { setStep(1); setError(''); }}>
                ← Back
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <div style={s.successBox}>
            <p style={s.successIcon}>✅</p>
            <p style={s.successTitle}>Password Reset!</p>
            <p style={s.successSub}>Your password has been updated successfully.</p>
            <Link to="/login" style={s.btn}>Login Now</Link>
          </div>
        )}

        {step !== 3 && (
          <p style={s.backToLogin}>
            Remember your password?{' '}
            <Link to="/login" style={s.link}>Login</Link>
          </p>
        )}
      </div>
    </div>
  );
}

const s = {
  root: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.secondary, padding: 20 },
  card: { backgroundColor: COLORS.white, borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' },
  logoWrap: { textAlign: 'center', marginBottom: 20 },
  logo: { fontSize: 28, fontWeight: 900, color: COLORS.primary },
  logoSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  title: { fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 },
  sub: { fontSize: 13, color: COLORS.textLight, marginBottom: 22 },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: COLORS.text },
  input: { border: `1.5px solid ${COLORS.border}`, borderRadius: 10, padding: '13px 14px', fontSize: 15, outline: 'none', backgroundColor: COLORS.secondary },
  passWrap: { display: 'flex', border: `1.5px solid ${COLORS.border}`, borderRadius: 10, overflow: 'hidden', backgroundColor: COLORS.secondary },
  passInput: { flex: 1, padding: '13px 14px', fontSize: 15, border: 'none', outline: 'none', backgroundColor: 'transparent' },
  eyeBtn: { padding: '0 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 },
  error: { backgroundColor: '#FFF3F3', color: COLORS.error, padding: '10px 14px', borderRadius: 8, fontSize: 13 },
  btn: { backgroundColor: COLORS.primary, color: COLORS.white, border: 'none', borderRadius: 12, padding: '15px', fontSize: 16, fontWeight: 700, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'block' },
  backBtn: { background: 'none', border: 'none', color: COLORS.primary, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '8px 0' },
  backToLogin: { textAlign: 'center', fontSize: 14, color: COLORS.textLight, marginTop: 20 },
  link: { color: COLORS.primary, fontWeight: 700, textDecoration: 'none' },
  successBox: { textAlign: 'center', padding: '10px 0 20px' },
  successIcon: { fontSize: 48, marginBottom: 12 },
  successTitle: { fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 },
  successSub: { fontSize: 14, color: COLORS.textLight, marginBottom: 24 },
};
