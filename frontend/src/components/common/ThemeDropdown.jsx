import React, { useState } from 'react';
import { useTheme, THEMES } from '../../context/ThemeContext';
import { Palette, ChevronDown, Check } from 'lucide-react';

export default function ThemeDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { key: THEMES.SKETCH, label: 'Sketch (Default)' },
    { key: THEMES.BRAND, label: 'Brand Light' },
    { key: THEMES.DARK, label: 'Dark' },
    { key: THEMES.HIGH_CONTRAST, label: 'High Contrast' },
  ];

  const currentThemeLabel = themeOptions.find((t) => t.key === theme)?.label || 'Theme';

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="btn btn-sm btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '5px 12px' }}
        >
          <Palette size={14} />
          <span>{currentThemeLabel}</span>
          <ChevronDown size={13} />
        </button>

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              zIndex: 100,
              backgroundColor: 'var(--color-surface)',
              border: 'var(--card-border-width) solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--card-shadow)',
              padding: '4px',
              minWidth: '160px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {themeOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setTheme(opt.key);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  backgroundColor: theme === opt.key ? 'var(--color-surface-hover)' : 'transparent',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                }}
              >
                <span>{opt.label}</span>
                {theme === opt.key && <Check size={14} color="var(--color-action)" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
