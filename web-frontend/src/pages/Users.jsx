import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    authAPI.getUsers()
      .then((r) => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
    const t = setInterval(fetchUsers, 30000);
    return () => clearInterval(t);
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile.includes(search)
  );

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Customers</h1>
          <p style={s.sub}>{users.length} registered customer{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button style={s.refreshBtn} onClick={fetchUsers}>↻ Refresh</button>
      </div>

      <div style={s.searchRow}>
        <input
          style={s.search}
          placeholder="Search by name or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div style={s.center}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={s.center}>
          {search ? 'No customers match your search.' : 'No customers registered yet.'}
        </div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr style={s.thead}>
                <th style={s.th}>#</th>
                <th style={s.th}>Name</th>
                <th style={s.th}>Mobile</th>
                <th style={s.th}>Address</th>
                <th style={s.th}>City</th>
                <th style={s.th}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u._id} style={i % 2 === 0 ? s.trEven : s.trOdd}>
                  <td style={s.td}>{i + 1}</td>
                  <td style={{ ...s.td, fontWeight: 600 }}>{u.name}</td>
                  <td style={s.td}>
                    <a href={`tel:${u.mobile}`} style={s.phone}>{u.mobile}</a>
                  </td>
                  <td style={{ ...s.td, color: '#666', maxWidth: 200 }}>{u.address || '—'}</td>
                  <td style={s.td}>{u.city || 'Chichawatni'}</td>
                  <td style={{ ...s.td, color: '#888', whiteSpace: 'nowrap' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { padding: '28px 24px', maxWidth: 960, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 800, color: '#1a2332', margin: 0 },
  sub: { fontSize: 13, color: '#888', margin: '4px 0 0' },
  refreshBtn: {
    background: '#f0f4f8', border: '1px solid #ddd', borderRadius: 8,
    padding: '8px 16px', cursor: 'pointer', fontSize: 13, color: '#444', fontWeight: 600,
  },
  searchRow: { marginBottom: 20 },
  search: {
    width: '100%', padding: '10px 16px', fontSize: 14, borderRadius: 10,
    border: '1px solid #ddd', outline: 'none', boxSizing: 'border-box',
  },
  center: { textAlign: 'center', color: '#888', padding: 48, fontSize: 15 },
  tableWrap: { borderRadius: 12, overflow: 'hidden', border: '1px solid #e8ecf0' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  thead: { backgroundColor: '#1a2332' },
  th: { padding: '12px 16px', textAlign: 'left', color: '#fff', fontWeight: 700, fontSize: 12, letterSpacing: 0.5 },
  trEven: { backgroundColor: '#fff' },
  trOdd: { backgroundColor: '#f8fafc' },
  td: { padding: '13px 16px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' },
  phone: { color: '#3498db', textDecoration: 'none', fontWeight: 600 },
};
