import React, { useState } from 'react';
import Button from '../common/Button';
import { Copy, Check, RefreshCw } from 'lucide-react';

export default function TeamCodeBox({ code, isLeader, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleRegenerate = async () => {
    if (window.confirm('Regenerating will invalidate the previous team code. Continue?')) {
      setRegenerating(true);
      try {
        await onRegenerate();
      } finally {
        setRegenerating(false);
      }
    }
  };

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div
        style={{
          fontSize: '0.8rem',
          fontWeight: 800,
          letterSpacing: '0.08em',
          color: 'var(--color-text-muted)',
          marginBottom: '12px',
        }}
      >
        TEAM CODE
      </div>

      <div
        style={{
          fontSize: '2rem',
          fontWeight: 800,
          fontFamily: 'monospace',
          letterSpacing: '0.12em',
          color: 'var(--color-text)',
          marginBottom: '18px',
        }}
      >
        {code || '--------'}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          icon={copied ? Check : Copy}
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>

        {isLeader && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerating}
            icon={RefreshCw}
          >
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </Button>
        )}
      </div>
    </div>
  );
}
