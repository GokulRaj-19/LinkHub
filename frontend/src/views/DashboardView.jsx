import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCollection } from '../api/client';
import { Bookmark, Pin, Users, CheckSquare, ExternalLink, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';

export default function DashboardView() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ links: 0, pinned: 0, teams: 0, tasks: 0 });
  const [pinnedLinks, setPinnedLinks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);

  useEffect(() => {
    if (!user) return;
    const allLinks = getCollection('links').filter((l) => l.user_id === user.id && !l.is_deleted);
    const pinned = allLinks.filter((l) => l.is_pinned);
    const memberships = getCollection('team_memberships').filter((m) => m.user_id === user.id);
    const myTasks = getCollection('tasks').filter(
      (t) => t.assigned_to === user.id && t.status !== 'done'
    );

    setStats({
      links: allLinks.length,
      pinned: pinned.length,
      teams: memberships.length,
      tasks: myTasks.length,
    });
    setPinnedLinks(pinned.slice(0, 4));
    setAssignedTasks(myTasks.slice(0, 3));
  }, [user]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img
          src="/logo.png"
          alt="LinkHub"
          className="app-logo"
          style={{ width: '48px', height: '48px', flexShrink: 0 }}
        />
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            Welcome back, {user?.full_name}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Here is your LinkHub activity overview across your vault and squads.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-surface-subtle)' }}>
            <Bookmark size={24} color="var(--color-action)" />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{stats.links}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Saved Links</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-surface-subtle)' }}>
            <Pin size={24} color="var(--color-action)" />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{stats.pinned}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Pinned Vault</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-surface-subtle)' }}>
            <Users size={24} color="var(--color-action)" />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{stats.teams}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Active Squads</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-surface-subtle)' }}>
            <CheckSquare size={24} color="var(--color-action)" />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{stats.tasks}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Pending Tasks</div>
          </div>
        </div>
      </div>

      {/* Grid: Pinned Links and My Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Pinned Links Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pin size={18} /> Pinned Vault Links
            </h2>
            <Link to="/links" style={{ fontSize: '0.85rem', color: 'var(--color-action)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {pinnedLinks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              No pinned links yet. Pin important links from your vault to view them here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pinnedLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{link.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{link.url}</div>
                  </div>
                  <ExternalLink size={14} color="var(--color-text-muted)" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Pending Tasks Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={18} /> My Active Tasks
            </h2>
            <Link to="/tasks" style={{ fontSize: '0.85rem', color: 'var(--color-action)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Task Manager <ArrowRight size={14} />
            </Link>
          </div>

          {assignedTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              You have no pending assigned tasks!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {assignedTasks.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      Due {t.due_date || 'Soon'} · Priority: {t.priority}
                    </div>
                  </div>
                  <span className="badge" style={{ textTransform: 'capitalize' }}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
