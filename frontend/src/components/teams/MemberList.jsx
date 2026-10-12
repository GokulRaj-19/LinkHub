import React from 'react';
import { Crown, Trash2 } from 'lucide-react';

export default function MemberList({
  members = [],
  isLeader = false,
  onRemoveMember,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {members.map((member) => {
        const isMemLeader = member.role === 'lead';
        return (
          <div
            key={member.user_id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              >
                {member.name.charAt(0)}
              </div>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{member.name}</span>
                {member.email && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginLeft: '8px' }}>
                    {member.email}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: isMemLeader ? 'var(--color-action)' : 'var(--color-text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {isMemLeader && <Crown size={12} />}
                {isMemLeader ? 'Leader' : 'Member'}
              </span>

              {isLeader && !isMemLeader && (
                <button
                  type="button"
                  onClick={() => onRemoveMember(member.user_id)}
                  aria-label={`Remove ${member.name}`}
                  className="btn-icon"
                  style={{ padding: '4px', color: '#D32F2F' }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
