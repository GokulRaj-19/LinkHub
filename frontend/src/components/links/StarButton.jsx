import React from 'react';
import { Star } from 'lucide-react';

export default function StarButton({ isStarred, onToggle }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={isStarred ? 'Unstar link' : 'Star link'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px',
        borderRadius: 'var(--radius-full)',
        color: isStarred ? '#EAB308' : 'var(--color-text-muted)',
        transition: 'transform var(--transition-fast)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <Star
        size={18}
        fill={isStarred ? '#EAB308' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
      />
    </button>
  );
}
