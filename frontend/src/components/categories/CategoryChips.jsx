import React from 'react';
import { Plus, Star, X } from 'lucide-react';

export default function CategoryChips({
  categories = [],
  activeCategoryId,
  onSelectCategory,
  isStarredActive,
  onToggleStarred,
  onOpenCategoryModal,
  onDeleteCategory,
}) {
  const isAllActive = !activeCategoryId && !isStarredActive;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '6px',
        scrollbarWidth: 'none',
      }}
    >
      <button
        type="button"
        onClick={() => {
          onSelectCategory(null);
          if (isStarredActive) onToggleStarred();
        }}
        className="btn btn-sm"
        style={{
          borderRadius: 'var(--radius-full)',
          padding: '6px 18px',
          fontWeight: 600,
          backgroundColor: isAllActive ? 'var(--color-action)' : 'transparent',
          color: isAllActive ? 'var(--color-text-on-action)' : 'var(--color-text)',
          border: 'var(--card-border-width) solid var(--color-border)',
        }}
      >
        All
      </button>

      <button
        type="button"
        onClick={onToggleStarred}
        className="btn btn-sm"
        style={{
          borderRadius: 'var(--radius-full)',
          padding: '6px 16px',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: isStarredActive ? 'var(--color-action)' : 'transparent',
          color: isStarredActive ? 'var(--color-text-on-action)' : 'var(--color-text)',
          border: 'var(--card-border-width) solid var(--color-border)',
        }}
      >
        <Star size={14} fill={isStarredActive ? 'currentColor' : 'none'} />
        <span>Starred</span>
      </button>

      {categories.map((cat) => {
        const isActive = activeCategoryId === cat.id && !isStarredActive;
        const isCustom = !['work', 'learning'].includes(cat.name?.toLowerCase().trim());

        return (
          <div
            key={cat.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isActive ? 'var(--color-action)' : 'transparent',
              color: isActive ? 'var(--color-text-on-action)' : 'var(--color-text)',
              border: 'var(--card-border-width) solid var(--color-border)',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap',
            }}
          >
            <button
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: isCustom ? '6px 6px 6px 14px' : '6px 16px',
                fontWeight: 600,
                fontSize: '0.88rem',
                color: 'inherit',
                cursor: 'pointer',
              }}
            >
              {cat.name}
            </button>

            {isCustom && onDeleteCategory && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCategory(cat);
                }}
                aria-label={`Delete custom category ${cat.name}`}
                title={`Delete ${cat.name}`}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px 10px 6px 2px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isActive ? 'var(--color-text-on-action)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                }}
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={onOpenCategoryModal}
        className="btn btn-sm btn-dashed"
        style={{
          borderRadius: 'var(--radius-full)',
          padding: '6px 16px',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap',
        }}
      >
        <Plus size={14} />
        <span>New category</span>
      </button>
    </div>
  );
}
