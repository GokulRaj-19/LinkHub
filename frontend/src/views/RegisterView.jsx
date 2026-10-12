import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/common/Button';
import ThemeDropdown from '../components/common/ThemeDropdown';
import { UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function RegisterView() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register({ full_name: fullName, email, password, theme });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto' }}>
      <div className="card" style={{ padding: '32px 28px', position: 'relative' }}>
        <ThemeDropdown />

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img
            src="/logo.png"
            alt="LinkHub"
            className="app-logo"
            style={{ width: '56px', height: '56px', margin: '0 auto 10px', display: 'block' }}
          />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Get started with your personal link vault and squads
          </p>
        </div>

        {error && (
          <div role="alert" style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(211, 47, 47, 0.12)', border: '1px solid #D32F2F', color: '#D32F2F', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <AlertCircle size={18} /><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label" htmlFor="reg-name">Full Name</label>
            <input id="reg-name" type="text" className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="e.g. Eswar" />
          </div>

          <div>
            <label className="label" htmlFor="reg-email">Email Address</label>
            <input id="reg-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="example@gmail.com" />
          </div>

          <div>
            <label className="label" htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                className="input"
                style={{ paddingRight: '42px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 6 characters"
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

          <Button type="submit" variant="primary" disabled={loading} icon={UserPlus} style={{ marginTop: '8px', width: '100%' }}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ fontWeight: 700, color: 'var(--color-action)', textDecoration: 'underline' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
