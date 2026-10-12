import React from 'react';
import StarButton from './StarButton';
import PinButton from './PinButton';
import { ExternalLink, Edit2, Trash2, Eye } from 'lucide-react';

export default function LinkCard({
  link,
  category,
  onToggleStar,
  onTogglePin,
  onEdit,
  onDelete,
  onOpen,
}) {
  const getHostname = (rawUrl) => {
    try {
      return new URL(rawUrl).hostname.replace(/^www\./, '');
    } catch {
      return rawUrl;
    }
  };

  const handleLinkClick = () => {
    onOpen(link.id);
  };

  return (
    <article
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '160px',
        position: 'relative',
        transition: 'transform var(--transition-fast)',
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, fontFamily: 'var(--font-heading)', lineHeight: 1.3 }}>
              {link.title}
            </h3>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: '4px',
                wordBreak: 'break-all',
              }}
            >
              <span>{getHostname(link.url)}</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              onClick={() => onEdit(link)}
              aria-label={`Edit ${link.title}`}
              className="btn-icon"
              style={{ padding: '5px' }}
            >
              <Edit2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(link.id)}
              aria-label={`Delete ${link.title}`}
              className="btn-icon"
              style={{ padding: '5px', color: '#D32F2F' }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {link.note && (
          <div
            style={{
              fontSize: '0.82rem',
              color: 'var(--color-text-muted)',
              marginTop: '10px',
              padding: '8px 10px',
              border: '1px dashed var(--color-border-subtle)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            {link.note}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px', alignItems: 'center' }}>
          {category && (
            <span
              className="badge badge-dashed"
              style={{
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
              }}
            >
              {category.name}
            </span>
          )}
          {link.tag && (
            <span className="badge" style={{ fontSize: '0.75rem', opacity: 0.85 }}>
              #{link.tag}
            </span>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', display: 'inline-flex', alignItems: 'center', gap: '3px', marginLeft: 'auto' }}>
            <Eye size={12} /> {link.click_count || 0}
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid var(--color-border-subtle)',
        }}
      >
        <StarButton isStarred={link.is_starred} onToggle={() => onToggleStar(link.id)} />
        <PinButton isPinned={link.is_pinned} onToggle={() => onTogglePin(link.id)} />
      </div>
    </article>
  );
}
