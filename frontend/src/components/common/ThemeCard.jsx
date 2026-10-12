import React from 'react';
import { Check } from 'lucide-react';

export default function ThemeCard({
  themeKey,
  title,
  description,
  isActive,
  onSelect,
  previewStripe,
  canvasBg,
  cardBg,
  cardBorder,
  textColor,
  actionColor,
  actionText,
  fontFamily,
}) {
  return (
    <div
      onClick={() => onSelect(themeKey)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(themeKey);
        }
      }}
      className="card"
      style={{
        cursor: 'pointer',
        padding: '16px',
        border: isActive
          ? '2px solid var(--color-action)'
          : 'var(--card-border-width) solid var(--color-border)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        outline: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{title}</h3>
        {isActive && (
          <span
            className="badge"
            style={{
              backgroundColor: 'var(--color-action)',
              color: 'var(--color-text-on-action)',
              gap: '4px',
            }}
          >
            <Check size={14} /> Active
          </span>
        )}
      </div>

      {/* Mini Preview Box */}
      <div
        style={{
          background: canvasBg,
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid rgba(120, 120, 120, 0.2)',
          paddingBottom: '12px',
        }}
      >
        <div style={{ height: '8px', background: previewStripe, width: '100%' }} />
        <div style={{ padding: '12px' }}>
          <div
            style={{
              background: cardBg,
              border: cardBorder,
              borderRadius: '6px',
              padding: '10px',
              marginBottom: '10px',
              fontFamily: fontFamily || 'inherit',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: textColor }}>
              Link title
            </div>
            <div style={{ fontSize: '0.72rem', color: textColor, opacity: 0.7 }}>
              example.com
            </div>
          </div>

          <div
            style={{
              background: actionColor,
              color: actionText,
              padding: '6px 12px',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            + Add link
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
        {description}
      </div>
    </div>
  );
}
