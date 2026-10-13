import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function TaskWorkDetails({ task, canManageProgress, onOpenModal }) {
  if (task.member_notes) {
    return (
      <div
        style={{
          marginTop: '10px',
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-surface-subtle)',
          borderLeft: '3px solid var(--color-action)',
          fontSize: '0.82rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-action)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MessageSquare size={12} /> Work Details
          </span>
          {canManageProgress && (
            <button
              type="button"
              onClick={onOpenModal}
              style={{ background: 'none', border: 'none', color: 'var(--color-action)', cursor: 'pointer', fontSize: '0.72rem', textDecoration: 'underline', padding: 0 }}
            >
              Update
            </button>
          )}
        </div>
        <p style={{ margin: '4px 0 0', color: 'var(--color-text)', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
          {task.member_notes}
        </p>
      </div>
    );
  }

  if (canManageProgress) {
    return (
      <button
        type="button"
        onClick={onOpenModal}
        style={{
          marginTop: '8px',
          width: '100%',
          padding: '6px 8px',
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed var(--color-border)',
          backgroundColor: 'transparent',
          color: 'var(--color-text-subtle)',
          fontSize: '0.78rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
        }}
        title="Add details about what you have done"
      >
        <MessageSquare size={12} color="var(--color-action)" />
        <span>+ Add details of what you've done</span>
      </button>
    );
  }

  return null;
}
