export default function StatCard({ title, value, sub, subColor = '#34C759', icon, iconBg }) {
  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: '20px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <div>
        <p style={{ fontSize: 13, color: '#8E8E93', marginBottom: 6 }}>{title}</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: subColor, fontWeight: 600 }}>{sub}</p>}
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: iconBg || '#3498db20',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
      }}>
        {icon}
      </div>
    </div>
  );
}
