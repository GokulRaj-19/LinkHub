import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Home } from 'lucide-react';

export default function Error403View() {
  return (
    <div className="state-box" style={{ maxWidth: '500px', margin: '60px auto' }}>
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: 'var(--radius-full)',
          border: '2px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          color: 'var(--color-action)',
        }}
      >
        <Lock size={36} />
      </div>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
        403 - Access Forbidden
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
        You don't have permission to access this squad or admin resource.
      </p>
      <Link to="/dashboard" className="btn btn-primary" style={{ gap: '8px' }}>
        <Home size={18} />
        <span>Back to Home</span>
      </Link>
    </div>
  );
}
