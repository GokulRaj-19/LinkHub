import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { categoriesApi } from '../../api/categoriesApi';
import { AlertCircle } from 'lucide-react';

export default function LinkModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  categories = [],
  onCategoryCreated,
}) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [tag, setTag] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [isStarred, setIsStarred] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setUrl(initialData.url || '');
      setNote(initialData.note || '');
      setTag(initialData.tag || '');
      setCategoryId(initialData.category_id ? String(initialData.category_id) : '');
      setIsStarred(Boolean(initialData.is_starred));
      setIsPinned(Boolean(initialData.is_pinned));
    } else {
      setTitle('');
      setUrl('');
      setNote('');
      setTag('');
      setCategoryId(categories.length > 0 ? String(categories[0].id) : '');
      setIsStarred(false);
      setIsPinned(false);
    }
    setIsCustom(false);
    setCustomName('');
    setError('');
  }, [initialData, categories, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim() || !url.trim()) {
      setError('Title and URL are required.');
      return;
    }

    setSaving(true);
    try {
      let targetCatId = categoryId ? Number(categoryId) : null;
      if (isCustom) {
        if (!customName.trim()) {
          setError('Please provide a name for your custom category.');
          setSaving(false);
          return;
        }
        const createdCat = await categoriesApi.createCategory({
          user_id: user?.id,
          name: customName.trim(),
        });
        targetCatId = createdCat.id;
        if (onCategoryCreated) onCategoryCreated(createdCat);
      }

      await onSubmit({
        title,
        url,
        note,
        tag,
        category_id: targetCatId,
        is_starred: isStarred,
        is_pinned: isPinned,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save link.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Vault Link' : 'Add New Link'}>
      {error && (
        <div role="alert" style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(211, 47, 47, 0.12)', border: '1px solid #D32F2F', color: '#D32F2F', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <AlertCircle size={16} /><span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label className="label" htmlFor="link-title">Title *</label>
          <input id="link-title" type="text" className="input" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Flask Docs" />
        </div>

        <div>
          <label className="label" htmlFor="link-url">URL *</label>
          <input id="link-url" type="text" className="input" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://example.com" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label className="label" htmlFor="link-category">Category</label>
            <select
              id="link-category"
              className="input"
              value={isCustom ? '__custom__' : categoryId}
              onChange={(e) => {
                if (e.target.value === '__custom__') {
                  setIsCustom(true);
                } else {
                  setIsCustom(false);
                  setCategoryId(e.target.value);
                }
              }}
            >
              <option value="">None (Uncategorized)</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              <option value="__custom__">+ Custom Category...</option>
            </select>

            {isCustom && (
              <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  className="input"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Custom category name..."
                  autoFocus
                  style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                />
                <button
                  type="button"
                  onClick={() => { setIsCustom(false); setCustomName(''); }}
                  className="btn btn-sm btn-outline"
                  style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="label" htmlFor="link-tag">Tag</label>
            <input id="link-tag" type="text" className="input" value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. backend" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="link-note">Note / Description</label>
          <textarea id="link-note" className="input" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Brief reminder or team notes" />
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input type="checkbox" checked={isStarred} onChange={(e) => setIsStarred(e.target.checked)} />
            <span>Star as Favourite</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
            <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
            <span>Pin to Top</span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : initialData ? 'Update Link' : 'Save Link'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
