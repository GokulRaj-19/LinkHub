import React from 'react';
import { Pin } from 'lucide-react';

export default function PinButton({ isPinned, onToggle }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={isPinned ? 'Unpin link' : 'Pin link'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.82rem',
        fontWeight: 600,
        backgroundColor: isPinned ? 'var(--color-action)' : 'transparent',
        color: isPinned ? 'var(--color-text-on-action)' : 'var(--color-text)',
        border: 'var(--card-border-width) solid var(--color-border)',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
      }}
    >
      <Pin size={13} fill={isPinned ? 'currentColor' : 'none'} />
      <span>{isPinned ? 'Pinned' : 'Pin'}</span>
    </button>
  );
}
