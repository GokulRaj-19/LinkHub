import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Crown, ArrowRight, Bookmark } from 'lucide-react';

export default function TeamCard({ team }) {
  const isLeader = team.my_role === 'lead';

  return (
    <article
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '170px',
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            {team.name}
          </h3>
          <span
            className="badge"
            style={{
              backgroundColor: isLeader ? 'var(--color-action)' : 'var(--color-surface-subtle)',
              color: isLeader ? 'var(--color-text-on-action)' : 'var(--color-text)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {isLeader && <Crown size={12} />}
            <span>{isLeader ? 'Leader' : 'Member'}</span>
          </span>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
          {team.description || 'No description provided.'}
        </p>
      </div>

      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            color: 'var(--color-text-subtle)',
            marginBottom: '12px',
            paddingTop: '8px',
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Users size={14} /> {team.member_count} member{team.member_count !== 1 ? 's' : ''}
          </span>
          <span>Lead: {team.lead_name}</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link
            to={`/teams/${team.id}`}
            className="btn btn-primary btn-sm"
            style={{ flex: 1, textDecoration: 'none' }}
          >
            <span>Manage Squad</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            to={`/teams/${team.id}/links`}
            className="btn btn-outline btn-sm"
            style={{ textDecoration: 'none', padding: '6px 12px' }}
            title="Shared Team Links"
          >
            <Bookmark size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
