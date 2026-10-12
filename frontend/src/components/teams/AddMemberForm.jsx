import React, { useState } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { UserPlus, AlertCircle, CheckCircle, UserX } from 'lucide-react';

export default function AddMemberForm({ onAddMember }) {
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [invalidUserMsg, setInvalidUserMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setFeedback(null);
    setLoading(true);

    try {
      const res = await onAddMember(email.trim());
      if (res?.status === 'added') {
        setFeedback({ type: 'success', text: `Added ${res.user.full_name} to squad!` });
      }
      setEmail('');
    } catch (err) {
      setInvalidUserMsg(err.message || 'The user was invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          fontSize: '0.8rem',
          fontWeight: 800,
          letterSpacing: '0.08em',
          color: 'var(--color-text-muted)',
          marginBottom: '10px',
        }}
      >
        ADD MEMBER BY EMAIL
      </div>

      {feedback && (
        <div
          role="status"
          style={{
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '10px',
            backgroundColor: feedback.type === 'success' ? 'rgba(46, 125, 50, 0.12)' : 'rgba(211, 47, 47, 0.12)',
            color: feedback.type === 'success' ? '#2E7D32' : '#D32F2F',
            border: `1px solid ${feedback.type === 'success' ? '#2E7D32' : '#D32F2F'}`,
          }}
        >
          {feedback.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@email.com"
          required
          style={{ fontSize: '0.9rem', padding: '8px 12px' }}
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={loading}
          icon={UserPlus}
          style={{ whiteSpace: 'nowrap' }}
        >
          {loading ? 'Adding...' : 'Add'}
        </Button>
      </form>

      {/* Pop-up message modal for invalid user */}
      <Modal
        isOpen={Boolean(invalidUserMsg)}
        onClose={() => setInvalidUserMsg(null)}
        title="Invalid User"
        maxWidth="420px"
      >
        <div style={{ textAlign: 'center', padding: '10px 4px 12px' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '14px',
              borderRadius: '50%',
              backgroundColor: 'rgba(211, 47, 47, 0.12)',
              color: '#D32F2F',
              marginBottom: '16px',
            }}
          >
            <UserX size={40} />
          </div>
          <h3
            style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--color-text)',
              marginBottom: '8px',
            }}
          >
            The user was invalid
          </h3>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
              marginBottom: '20px',
            }}
          >
            {invalidUserMsg}
          </p>
          <Button
            variant="primary"
            onClick={() => setInvalidUserMsg(null)}
            style={{ width: '100%' }}
          >
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}
