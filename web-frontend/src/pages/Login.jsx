import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ mobile: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.mobile, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.brand}>SellMix</h1>
        <p style={s.sub}>Admin Dashboard — Chichawatni</p>

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Mobile Number</label>
          <input
            style={s.input}
            type="text"
            placeholder="03001234567"
            value={form.mobile}
            onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            required
          />

          <label style={s.label}>Password</label>
          <input
            style={s.input}
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />

          {error && <p style={s.error}>{error}</p>}

          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login to Admin'}
          </button>
        </form>

        <p style={s.hint}>Default: 03001234567 / admin123</p>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: '#3498db', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  brand: { fontSize: 36, fontWeight: 900, color: '#3498db', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 13, color: '#8E8E93', textAlign: 'center', marginBottom: 32 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 },
  input: { width: '100%', border: '1.5px solid #E5E5EA', borderRadius: 10, padding: '13px 16px', fontSize: 15, color: '#1a1a1a', marginBottom: 18, outline: 'none', boxSizing: 'border-box', backgroundColor: '#f5f6f3' },
  btn: { width: '100%', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: 12, padding: '15px', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 4 },
  error: { color: '#FF3B30', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  hint: { fontSize: 12, color: '#AEAEB2', textAlign: 'center', marginTop: 20 },
};
