import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { categoriesApi } from '../../api/categoriesApi';
import { useAuth } from '../../context/AuthContext';
import { Plus, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';

export default function CategoryModal({
  isOpen,
  onClose,
  categories,
  onRefresh,
}) {
  const { user } = useAuth();
  const [newCatName, setNewCatName] = useState('');
  const [error, setError] = useState('');
  const [deletePendingCat, setDeletePendingCat] = useState(null);
  const [targetCatId, setTargetCatId] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setError('');
    try {
      await categoriesApi.createCategory({ user_id: user.id, name: newCatName });
      setNewCatName('');
      onRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteRequest = async (cat) => {
    setError('');
    try {
      await categoriesApi.deleteCategory(cat.id);
      onRefresh();
    } catch (err) {
      if (err.hasDependentLinks) {
        setDeletePendingCat(cat);
        const others = categories.filter((c) => c.id !== cat.id);
        if (others.length > 0) setTargetCatId(String(others[0].id));
      } else {
        setError(err.message);
      }
    }
  };

  const handleConfirmMoveAndDelete = async () => {
    if (!targetCatId) {
      setError('Please choose a replacement category to move links to.');
      return;
    }
    try {
      await categoriesApi.deleteCategory(deletePendingCat.id, targetCatId);
      setDeletePendingCat(null);
      setTargetCatId('');
      onRefresh();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Categories">
      {error && (
        <div
          role="alert"
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(211, 47, 47, 0.12)',
            border: '1px solid #D32F2F',
            color: '#D32F2F',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Dependency Warning Dialog if links exist */}
      {deletePendingCat ? (
        <div style={{ backgroundColor: 'var(--color-surface-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #E65100', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E65100', fontWeight: 700, marginBottom: '8px' }}>
            <AlertTriangle size={18} /> Dependency Warning
          </div>
          <p style={{ fontSize: '0.85rem', marginBottom: '12px', color: 'var(--color-text)' }}>
            Category <strong>"{deletePendingCat.name}"</strong> has links attached. To avoid orphaned links, choose where to move them:
          </p>
          <div style={{ marginBottom: '16px' }}>
            <label className="label" htmlFor="move-target-cat">Move links to:</label>
            <select
              id="move-target-cat"
              className="input"
              value={targetCatId}
              onChange={(e) => setTargetCatId(e.target.value)}
            >
              {categories.filter((c) => c.id !== deletePendingCat.id).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="outline" size="sm" onClick={() => setDeletePendingCat(null)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleConfirmMoveAndDelete}>Move & Delete</Button>
          </div>
        </div>
      ) : (
        <>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <input
              type="text"
              className="input"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="New category name (e.g. Design)"
              required
            />
            <Button type="submit" variant="primary" icon={Plus}>Add</Button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
            {categories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteRequest(cat)}
                  className="btn-icon"
                  style={{ color: '#D32F2F', padding: '4px' }}
                  aria-label={`Delete category ${cat.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
}
