import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Bookmark, Star, Users, CheckSquare, User } from 'lucide-react';

export default function MobileTabBar() {
  const tabs = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Links', path: '/links', icon: Bookmark },
    { name: 'Starred', path: '/starred', icon: Star },
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav
      className="mobile-tab-bar"
      aria-label="Mobile Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--mobile-tab-height)',
        backgroundColor: 'var(--color-surface)',
        borderTop: 'var(--card-border-width) solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 100,
        padding: '0 8px',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '44px',
              minHeight: '44px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-md)',
              color: isActive ? 'var(--color-action)' : 'var(--color-text-muted)',
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.72rem',
              gap: '3px',
              textDecoration: 'none',
              borderTop: isActive ? '2px solid var(--color-action)' : '2px solid transparent',
            })}
          >
            <Icon size={20} />
            <span>{tab.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
