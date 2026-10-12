import React, { useState } from 'react';
import Button from '../common/Button';
import { UserPlus, AlertCircle, CheckCircle, Info } from 'lucide-react';

export default function JoinTeamForm({ onJoin }) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success' | 'info' | 'error', message: '' }
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setStatus(null);
    setLoading(true);

    try {
      const res = await onJoin(code);
      if (res.alreadyMember) {
        setStatus({ type: 'info', message: res.message });
      } else {
        setStatus({ type: 'success', message: res.message });
        setCode('');
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to join squad.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
        Join Squad with Code
      </h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
        Enter an 8-character squad invite code to become a member.
      </p>

      {status && (
        <div
          role="alert"
          style={{
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '14px',
            backgroundColor:
              status.type === 'success'
                ? 'rgba(46, 125, 50, 0.12)'
                : status.type === 'info'
                ? 'rgba(33, 150, 243, 0.12)'
                : 'rgba(211, 47, 47, 0.12)',
            color:
              status.type === 'success'
                ? '#2E7D32'
                : status.type === 'info'
                ? '#1976D2'
                : '#D32F2F',
            border: `1px solid ${
              status.type === 'success'
                ? '#2E7D32'
                : status.type === 'info'
                ? '#1976D2'
                : '#D32F2F'
            }`,
          }}
        >
          {status.type === 'success' ? (
            <CheckCircle size={16} />
          ) : status.type === 'info' ? (
            <Info size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          className="input"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. K7M2Q9XA"
          maxLength={10}
          required
          style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}
        />
        <Button type="submit" variant="primary" disabled={loading} icon={UserPlus} style={{ whiteSpace: 'nowrap' }}>
          {loading ? 'Joining...' : 'Join Squad'}
        </Button>
      </form>
    </div>
  );
}
