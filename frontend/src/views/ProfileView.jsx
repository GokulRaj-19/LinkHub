import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { User, Check, AlertCircle, KeyRound, Eye, EyeOff } from 'lucide-react';

export default function ProfileView() {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password && password !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const updateData = { full_name: fullName };
      if (password) updateData.password = password;
      await updateProfile(updateData);
      setMessage('Profile updated successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
          Profile Settings
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Manage your personal account credentials and security
        </p>
      </div>

      <div className="card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-action)',
              color: 'var(--color-text-on-action)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.4rem',
            }}
          >
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user?.full_name}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              <span className="badge" style={{ textTransform: 'capitalize' }}>Role: {user?.role}</span>
              <span className="badge" style={{ textTransform: 'capitalize' }}>Theme: {user?.theme}</span>
            </div>
          </div>
        </div>

        {message && (
          <div role="status" style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(46, 125, 50, 0.12)', border: '1px solid #2E7D32', color: '#2E7D32', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Check size={18} /><span>{message}</span>
          </div>
        )}

        {error && (
          <div role="alert" style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(211, 47, 47, 0.12)', border: '1px solid #D32F2F', color: '#D32F2F', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <AlertCircle size={18} /><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="label" htmlFor="user-fullname">Full Name</label>
            <input id="user-fullname" type="text" className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>

          <div>
            <label className="label" htmlFor="user-email">Email Address</label>
            <input id="user-email" type="email" className="input" value={user?.email || ''} disabled style={{ opacity: 0.7 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>Email address cannot be modified once registered.</span>
          </div>

          <div style={{ borderTop: 'var(--card-border-width) solid var(--color-border-subtle)', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <KeyRound size={16} /> Change Password
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label" htmlFor="new-pass">New Password (leave blank to keep current)</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    id="new-pass"
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    style={{ paddingRight: '42px' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="btn-icon"
                    style={{ position: 'absolute', right: '8px', padding: '6px', color: 'var(--color-text-muted)' }}
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="confirm-pass">Confirm New Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    id="confirm-pass"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input"
                    style={{ paddingRight: '42px' }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="btn-icon"
                    style={{ position: 'absolute', right: '8px', padding: '6px', color: 'var(--color-text-muted)' }}
                  >
                    {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" disabled={loading} icon={User} style={{ marginTop: '8px' }}>
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </Button>
        </form>
      </div>
    </div>
  );
}
