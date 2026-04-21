import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, BrainCircuit, History, LogOut } from 'lucide-react';

export default function Layout({ onLogout }) {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      {/* Sidebar */}
      <div className="sidebar" style={{ width: 250, borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: 24, background: 'white' }}>
        <h2 style={{ fontSize: 20, marginBottom: 40, color: 'var(--primary-color)' }}>✨ Editorial.AI</h2>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <li>
              <Link to="/" className={`nav-link ${currentPath === '/' ? 'active' : ''}`}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/upload" className={`nav-link ${currentPath === '/upload' ? 'active' : ''}`}>
                <UploadCloud size={18} /> Upload Data
              </Link>
            </li>
            <li>
              <Link to="/training" className={`nav-link ${currentPath === '/training' ? 'active' : ''}`}>
                <BrainCircuit size={18} /> Training Jobs
              </Link>
            </li>
            <li>
              <Link to="/history" className={`nav-link ${currentPath === '/history' ? 'active' : ''}`}>
                <History size={18} /> History
              </Link>
            </li>
          </ul>
        </nav>

        <button className="button" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5' }} onClick={onLogout}>
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
