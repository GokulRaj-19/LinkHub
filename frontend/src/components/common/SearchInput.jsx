import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search title, URL or tag',
  id = 'search-input',
}) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <label htmlFor={id} className="sr-only" style={{ display: 'none' }}>
        {placeholder}
      </label>
      <Search
        size={18}
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '14px',
          color: 'var(--color-text-muted)',
          pointerEvents: 'none',
        }}
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input"
        style={{
          paddingLeft: '42px',
          paddingRight: value ? '38px' : '14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.95rem',
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: '12px',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
