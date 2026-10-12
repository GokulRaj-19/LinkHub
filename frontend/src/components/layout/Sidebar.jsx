import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bookmark, 
  Star,
  Users, 
  CheckSquare, 
  Palette, 
  ShieldCheck, 
  User, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Links', path: '/links', icon: Bookmark },
    { name: 'Starred', path: '/starred', icon: Star },
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Appearance', path: '/appearance', icon: Palette },
  ];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Logs', path: '/admin/logs', icon: ShieldCheck });
  }

  return (
    <aside
      className="sidebar-desktop"
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--color-surface)',
        borderRight: 'var(--card-border-width) solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        padding: '24px 16px',
        flexShrink: 0,
      }}
    >
      <div style={{ marginBottom: '32px', padding: '0 8px' }}>
        <h1
          style={{
            fontSize: '1.6rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--color-text)',
          }}
        >
          <img
            src="/logo.png"
            alt="LinkHub"
            className="app-logo"
            style={{ width: '32px', height: '32px', flexShrink: 0 }}
          />
          <span>LinkHub</span>
        </h1>
        {user && (
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {user.email}
          </div>
        )}
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
                fontSize: '0.95rem',
                backgroundColor: isActive ? 'var(--color-action)' : 'transparent',
                color: isActive ? 'var(--color-text-on-action)' : 'var(--color-text)',
                transition: 'all var(--transition-fast)',
              })}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {user && (
        <div
          style={{
            borderTop: 'var(--card-border-width) solid var(--color-border-subtle)',
            paddingTop: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <NavLink
            to="/profile"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: isActive ? 'var(--color-action)' : 'var(--color-text)',
            })}
          >
            <User size={18} />
            <span>Profile</span>
          </NavLink>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: 'var(--color-text-muted)',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
}
