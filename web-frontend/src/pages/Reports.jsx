import { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';

const PKR = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

export default function Reports() {
  // Use LOCAL date (not UTC) so it matches the server's timezone
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const [selectedDate, setSelectedDate] = useState(today);
  const [daily, setDaily] = useState(null);
  const [range, setRange] = useState([]);
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingRange, setLoadingRange] = useState(false);

  const fetchDaily = (date) => {
    setLoadingDaily(true);
    ordersAPI.getDailyReport(date)
      .then((r) => setDaily(r.data))
      .catch(() => setDaily(null))
      .finally(() => setLoadingDaily(false));
  };

  const fetchRange = () => {
    setLoadingRange(true);
    ordersAPI.getRangeReport(7)
      .then((r) => setRange(r.data))
      .catch(() => setRange([]))
      .finally(() => setLoadingRange(false));
  };

  useEffect(() => {
    fetchDaily(today);
    fetchRange();
  }, []);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    fetchDaily(e.target.value);
  };

  const marginPct = daily && daily.totalRevenue > 0
    ? Math.round((daily.grossProfit / daily.totalRevenue) * 100)
    : 0;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>📊 Profit Reports</h1>
          <p style={s.sub}>Track daily sales, cost and gross profit</p>
        </div>
        <input
          type="date"
          value={selectedDate}
          max={today}
          onChange={handleDateChange}
          style={s.datePicker}
        />
      </div>

      {/* Daily Summary Cards */}
      {loadingDaily ? (
        <div style={s.loadingRow}>{[...Array(4)].map((_, i) => <div key={i} style={s.skeleton} />)}</div>
      ) : daily ? (
        <>
          <div style={s.cards}>
            <div style={{ ...s.card, borderTop: '4px solid #3498db' }}>
              <p style={s.cardLabel}>Orders</p>
              <p style={s.cardValue}>{daily.totalOrders}</p>
              <p style={s.cardSub}>{new Date(selectedDate).toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
            </div>
            <div style={{ ...s.card, borderTop: '4px solid #34C759' }}>
              <p style={s.cardLabel}>Total Revenue</p>
              <p style={{ ...s.cardValue, color: '#34C759' }}>{PKR(daily.totalRevenue)}</p>
              <p style={s.cardSub}>Sale price collected</p>
            </div>
            <div style={{ ...s.card, borderTop: '4px solid #FF9500' }}>
              <p style={s.cardLabel}>Total Cost</p>
              <p style={{ ...s.cardValue, color: '#FF9500' }}>{PKR(daily.totalCost)}</p>
              <p style={s.cardSub}>Your buying cost</p>
            </div>
            <div style={{ ...s.card, borderTop: '4px solid #AF52DE', backgroundColor: '#fdf4ff' }}>
              <p style={s.cardLabel}>Gross Profit</p>
              <p style={{ ...s.cardValue, color: '#AF52DE' }}>{PKR(daily.grossProfit)}</p>
              <p style={s.cardSub}>Margin: {marginPct}%</p>
            </div>
          </div>

          {/* Product Breakdown Table */}
          <div style={s.tableCard}>
            <div style={s.tableHeader}>
              <h2 style={s.tableTitle}>Product Breakdown</h2>
              <span style={s.tableCount}>{daily.products?.length || 0} products sold</span>
            </div>

            {daily.products?.length === 0 ? (
              <div style={s.empty}>
                <p style={{ fontSize: 40, marginBottom: 8 }}>📭</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>No orders on this date</p>
                <p style={{ fontSize: 13, color: '#8E8E93', marginTop: 4 }}>Select a date with orders to see the breakdown</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={s.table}>
                  <thead>
                    <tr style={s.thead}>
                      <th style={s.th}>Product Name</th>
                      <th style={{ ...s.th, textAlign: 'center' }}>Qty Sold</th>
                      <th style={{ ...s.th, textAlign: 'right' }}>Sale Price</th>
                      <th style={{ ...s.th, textAlign: 'right' }}>Cost Price</th>
                      <th style={{ ...s.th, textAlign: 'right' }}>Revenue</th>
                      <th style={{ ...s.th, textAlign: 'right' }}>Cost</th>
                      <th style={{ ...s.th, textAlign: 'right' }}>Gross Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daily.products.map((p, i) => {
                      const profitPct = p.revenue > 0 ? Math.round((p.grossProfit / p.revenue) * 100) : 0;
                      return (
                        <tr key={i} style={{ ...s.trow, backgroundColor: i % 2 === 0 ? '#fff' : '#f9f9fb' }}>
                          <td style={s.td}>
                            <span style={s.productName}>{p.name}</span>
                          </td>
                          <td style={{ ...s.td, textAlign: 'center' }}>
                            <span style={s.qtyBadge}>{p.qtySold}</span>
                          </td>
                          <td style={{ ...s.td, textAlign: 'right', color: '#3498db' }}>{PKR(p.salePrice)}</td>
                          <td style={{ ...s.td, textAlign: 'right', color: '#FF9500' }}>
                            {p.costPrice > 0 ? PKR(p.costPrice) : <span style={s.noCost}>—</span>}
                          </td>
                          <td style={{ ...s.td, textAlign: 'right', fontWeight: 600 }}>{PKR(p.revenue)}</td>
                          <td style={{ ...s.td, textAlign: 'right', color: '#FF9500' }}>{PKR(p.cost)}</td>
                          <td style={{ ...s.td, textAlign: 'right' }}>
                            <span style={{ ...s.profitChip, backgroundColor: p.grossProfit >= 0 ? '#f0fdf4' : '#fff0f0', color: p.grossProfit >= 0 ? '#15803d' : '#dc2626' }}>
                              {PKR(p.grossProfit)} <span style={{ fontSize: 11, opacity: 0.8 }}>({profitPct}%)</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={s.tfootRow}>
                      <td style={{ ...s.td, fontWeight: 700 }}>TOTAL</td>
                      <td style={{ ...s.td, textAlign: 'center', fontWeight: 700 }}>
                        {daily.products.reduce((s, p) => s + p.qtySold, 0)}
                      </td>
                      <td style={s.td} />
                      <td style={s.td} />
                      <td style={{ ...s.td, textAlign: 'right', fontWeight: 700, color: '#34C759' }}>{PKR(daily.totalRevenue)}</td>
                      <td style={{ ...s.td, textAlign: 'right', fontWeight: 700, color: '#FF9500' }}>{PKR(daily.totalCost)}</td>
                      <td style={{ ...s.td, textAlign: 'right' }}>
                        <span style={{ ...s.profitChip, backgroundColor: '#fdf4ff', color: '#AF52DE', fontWeight: 700, fontSize: 14 }}>
                          {PKR(daily.grossProfit)} ({marginPct}%)
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={s.empty}><p>Failed to load report.</p></div>
      )}

      {/* Last 7 Days Chart */}
      <div style={s.tableCard}>
        <div style={s.tableHeader}>
          <h2 style={s.tableTitle}>Last 7 Days Overview</h2>
        </div>
        {loadingRange ? (
          <div style={s.loadingRow}>{[...Array(7)].map((_, i) => <div key={i} style={{ ...s.skeleton, height: 60 }} />)}</div>
        ) : (
          <>
            {/* Bar visual */}
            <div style={s.barChart}>
              {range.map((d, i) => {
                const maxProfit = Math.max(...range.map((r) => r.grossProfit), 1);
                const barH = Math.max((d.grossProfit / maxProfit) * 100, 4);
                const isToday = d.date === today;
                return (
                  <div key={i} style={s.barCol}>
                    <span style={s.barAmt}>{d.grossProfit > 0 ? `${Math.round(d.grossProfit / 1000)}k` : '0'}</span>
                    <div style={{ ...s.bar, height: `${barH}%`, backgroundColor: isToday ? '#AF52DE' : '#3498db' }} title={`Profit: ${PKR(d.grossProfit)}`} />
                    <span style={{ ...s.barLabel, fontWeight: isToday ? 700 : 400, color: isToday ? '#AF52DE' : '#8E8E93' }}>
                      {new Date(d.date + 'T12:00:00').toLocaleDateString('en-PK', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Summary table */}
            <div style={{ overflowX: 'auto', marginTop: 16 }}>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th style={s.th}>Date</th>
                    <th style={{ ...s.th, textAlign: 'center' }}>Orders</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>Revenue</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>Cost</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>Gross Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {range.map((d, i) => (
                    <tr
                      key={i}
                      style={{ ...s.trow, backgroundColor: d.date === today ? '#fdf4ff' : i % 2 === 0 ? '#fff' : '#f9f9fb', cursor: 'pointer' }}
                      onClick={() => { setSelectedDate(d.date); fetchDaily(d.date); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    >
                      <td style={s.td}>
                        {new Date(d.date + 'T12:00:00').toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {d.date === today && <span style={s.todayChip}>Today</span>}
                      </td>
                      <td style={{ ...s.td, textAlign: 'center' }}>{d.orders}</td>
                      <td style={{ ...s.td, textAlign: 'right', color: '#34C759', fontWeight: 600 }}>{PKR(d.revenue)}</td>
                      <td style={{ ...s.td, textAlign: 'right', color: '#FF9500' }}>{PKR(d.cost)}</td>
                      <td style={{ ...s.td, textAlign: 'right' }}>
                        <span style={{ ...s.profitChip, backgroundColor: d.grossProfit >= 0 ? '#fdf4ff' : '#fff0f0', color: d.grossProfit >= 0 ? '#AF52DE' : '#dc2626' }}>
                          {PKR(d.grossProfit)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { padding: 24, maxWidth: 1100, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 },
  title: { fontSize: 24, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 },
  sub: { fontSize: 14, color: '#8E8E93' },
  datePicker: { padding: '10px 14px', border: '1.5px solid #E5E5EA', borderRadius: 10, fontSize: 14, color: '#1a1a1a', backgroundColor: '#fff', cursor: 'pointer' },

  cards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardLabel: { fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  cardValue: { fontSize: 26, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 },
  cardSub: { fontSize: 12, color: '#8E8E93' },

  tableCard: { backgroundColor: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 24, overflow: 'hidden' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #F2F2F7' },
  tableTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a1a' },
  tableCount: { fontSize: 13, color: '#8E8E93', backgroundColor: '#F2F2F7', padding: '4px 12px', borderRadius: 20 },

  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { backgroundColor: '#f5f6f3' },
  th: { padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'left', whiteSpace: 'nowrap' },
  trow: { borderBottom: '1px solid #F2F2F7', transition: 'background 0.15s' },
  td: { padding: '14px 16px', fontSize: 14, color: '#1a1a1a', verticalAlign: 'middle' },
  tfootRow: { backgroundColor: '#f5f6f3', borderTop: '2px solid #E5E5EA' },

  productName: { fontWeight: 600 },
  qtyBadge: { display: 'inline-block', backgroundColor: '#EBF5FF', color: '#3498db', fontWeight: 700, fontSize: 13, padding: '2px 10px', borderRadius: 20 },
  noCost: { color: '#C7C7CC', fontSize: 16 },
  profitChip: { display: 'inline-block', padding: '4px 10px', borderRadius: 8, fontSize: 13, fontWeight: 600 },
  todayChip: { marginLeft: 8, backgroundColor: '#AF52DE22', color: '#AF52DE', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 },

  barChart: { display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '16px 24px 0', borderBottom: '1px solid #F2F2F7' },
  barCol: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '60%', minHeight: 4, borderRadius: '4px 4px 0 0', transition: 'height 0.3s' },
  barLabel: { fontSize: 11, marginTop: 6, marginBottom: 8 },
  barAmt: { fontSize: 10, color: '#8E8E93' },

  loadingRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 },
  skeleton: { height: 110, backgroundColor: '#F2F2F7', borderRadius: 14, animation: 'pulse 1.5s infinite' },
  empty: { textAlign: 'center', padding: '48px 24px', color: '#8E8E93' },
};
