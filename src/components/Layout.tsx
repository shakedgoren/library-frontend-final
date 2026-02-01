// components/Layout.tsx
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';  // ✅ הוסף useLocation
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectUserName, logout } from '../slices/loginSlice';
import myFavIcon from '../LoginPage/images/favicon.jpeg';
import '../LoginPage/css/modern.css';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUserName);
  const location = useLocation();  // ✅ לקבלת הנתיב הנוכחי

  const handleLogout = () => {
    dispatch(logout());
  };

  // ✅ פונקציה לבדיקת active
  const isActive = (path: string) => location.pathname === path ? 'nav-item active' : 'nav-item';

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-inner">
          {/* Header עם שם משתמש */}
      <div className="hero-header">
  <div className="hero-left">
    <div className="hero-badge">📚 מערכת ספרייה</div>
    <h1 className="hero-title">ספריית החלומות</h1>
    <p className="hero-subtitle">{user}, עבודה נעימה! הנה מצב המערכת בזמן אמת.</p>
  </div>

  <div className="hero-right">
    <div className="hero-chip">🚀 מהיר</div>
    <div className="hero-chip">🔒 מאובטח</div>
    <div className="hero-chip">📈 בזמן אמת</div>
    </div>
  </div>
</div>
      </header>

      <div className="app-main">
        <aside className="app-sidebar">
          <nav className="sidebar-nav">
            <Link to="/dashboard" className={isActive('/dashboard')}>📊 ראשי</Link>
            <Link to="/books" className={isActive('/books')}>📚 ספרים</Link>
            <Link to="/clients" className={isActive('/clients')}>👥 לקוחות</Link>
            <Link to="/loans" className={isActive('/loans')}>📈 השאלות</Link>
          </nav>
          
          <div className="logout-section">
            <button className="btn-logout" onClick={handleLogout}>
              🚪 התנתק
            </button>
          </div>
        </aside>
        
        <main className="app-content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
