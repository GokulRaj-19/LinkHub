import React from 'react';

export default function KanbanColumn({
  title,
  count = 0,
  children,
  badgeColor = 'var(--color-surface-subtle)',
}) {
  return (
    <section
      style={{
        flex: 1,
        minWidth: '280px',
        backgroundColor: 'var(--color-surface-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '10px',
          borderBottom: 'var(--card-border-width) solid var(--color-border-subtle)',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
          {title}
        </h3>
        <span
          className="badge"
          style={{
            backgroundColor: badgeColor,
            fontWeight: 700,
            fontSize: '0.8rem',
          }}
        >
          {count}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        {children}
      </div>
    </section>
  );
}
