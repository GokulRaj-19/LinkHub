import React from 'react';

export default function StripeBar() {
  return (
    <div
      aria-hidden="true"
      style={{
        height: 'var(--stripe-height)',
        background: 'var(--stripe-bg)',
        width: '100%',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'background var(--transition-fast)',
      }}
    />
  );
}
