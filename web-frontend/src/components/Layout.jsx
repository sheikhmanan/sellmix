import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const styles = {
  wrapper: { display: 'flex', height: '100vh', overflow: 'hidden' },
  main: { flex: 1, overflowY: 'auto', backgroundColor: '#f5f6f3' },
};

export default function Layout() {
  return (
    <div style={styles.wrapper}>
      <Sidebar />
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
