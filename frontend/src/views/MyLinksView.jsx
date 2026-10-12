import React, { useState } from 'react';
import { useLinks } from '../hooks/useLinks';
import { categoriesApi } from '../api/categoriesApi';
import LinkCard from '../components/links/LinkCard';
import LinkModal from '../components/links/LinkModal';
import CategoryChips from '../components/categories/CategoryChips';
import CategoryModal from '../components/categories/CategoryModal';
import SearchInput from '../components/common/SearchInput';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { Plus, Inbox, AlertTriangle } from 'lucide-react';

export default function MyLinksView() {
  const {
    links, categories, loading, error, search, setSearch,
    categoryId, setCategoryId, starred, setStarred, sort, setSort,
    addLink, editLink, removeLink, toggleStar, togglePin, trackClick, fetchCategories,
  } = useLinks();

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);
  const [targetMoveId, setTargetMoveId] = useState('');

  const handleOpenAdd = () => { setEditingLink(null); setIsLinkModalOpen(true); };
  const handleOpenEdit = (link) => { setEditingLink(link); setIsLinkModalOpen(true); };

  const handleSaveLink = async (payload) => {
    if (editingLink) await editLink(editingLink.id, payload);
    else await addLink(payload);
    await fetchCategories();
  };

  const otherCats = categories.filter((c) => c.id !== catToDelete?.id);
  const linksInCat = links.all.filter((l) => l.category_id === catToDelete?.id);

  const handleConfirmDeleteCat = async () => {
    if (!catToDelete) return;
    const moveTo = linksInCat.length > 0 ? (targetMoveId || otherCats[0]?.id) : null;
    await categoriesApi.deleteCategory(catToDelete.id, moveTo);
    if (categoryId === catToDelete.id) setCategoryId(null);
    setCatToDelete(null);
    setTargetMoveId('');
    await fetchCategories();
  };

  const renderCard = (link) => (
    <LinkCard
      key={link.id}
      link={link}
      category={categories.find((c) => c.id === link.category_id)}
      onToggleStar={toggleStar}
      onTogglePin={togglePin}
      onEdit={handleOpenEdit}
      onDelete={removeLink}
      onOpen={trackClick}
    />
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>My Links</h1>
        <Button variant="primary" onClick={handleOpenAdd} icon={Plus}>Add link</Button>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search title, URL or tag" />
        </div>
        <select
          className="input"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ width: 'auto', minWidth: '150px', borderRadius: 'var(--radius-full)', padding: '9px 14px' }}
        >
          <option value="newest">Sort: Newest</option>
          <option value="title">Sort: Title</option>
          <option value="clicks">Sort: Most Clicked</option>
        </select>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <CategoryChips
          categories={categories}
          activeCategoryId={categoryId}
          onSelectCategory={setCategoryId}
          isStarredActive={starred}
          onToggleStarred={() => setStarred((prev) => !prev)}
          onOpenCategoryModal={() => setIsCatModalOpen(true)}
          onDeleteCategory={(cat) => {
            setCatToDelete(cat);
            const others = categories.filter((c) => c.id !== cat.id);
            if (others.length > 0) setTargetMoveId(String(others[0].id));
          }}
        />
      </div>

      {loading ? (
        <div className="state-box">Loading your links...</div>
      ) : error ? (
        <div className="state-box" style={{ color: '#D32F2F' }}>{error}</div>
      ) : links.all.length === 0 ? (
        <div className="state-box">
          <Inbox size={40} style={{ marginBottom: '12px', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No links found</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>Start your personal vault by saving your first link!</p>
        </div>
      ) : (
        <>
          {links.pinned.length > 0 && (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '12px' }}>PINNED</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {links.pinned.map(renderCard)}
              </div>
            </section>
          )}

          {links.unpinned.length > 0 && (
            <section>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                {links.pinned.length > 0 ? 'ALL LINKS' : 'LINKS'}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {links.unpinned.map(renderCard)}
              </div>
            </section>
          )}
        </>
      )}

      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSubmit={handleSaveLink}
        initialData={editingLink}
        categories={categories}
        onCategoryCreated={fetchCategories}
      />

      <CategoryModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        categories={categories}
        onRefresh={fetchCategories}
      />

      {/* Delete Custom Category Modal */}
      <Modal isOpen={Boolean(catToDelete)} onClose={() => setCatToDelete(null)} title="Delete Custom Category" maxWidth="450px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {linksInCat.length > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E65100', fontWeight: 700 }}>
                <AlertTriangle size={20} /> Dependency Warning
              </div>
              <p style={{ fontSize: '0.9rem' }}>
                Category <strong>"{catToDelete?.name}"</strong> has {linksInCat.length} link(s). Select where to move them before deleting:
              </p>
              <div>
                <label className="label" htmlFor="move-cat-target">Move links to:</label>
                <select id="move-cat-target" className="input" value={targetMoveId} onChange={(e) => setTargetMoveId(e.target.value)}>
                  {otherCats.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
            </>
          ) : (
            <p style={{ fontSize: '0.92rem' }}>
              Are you sure you want to delete custom category <strong>"{catToDelete?.name}"</strong>?
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="outline" onClick={() => setCatToDelete(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirmDeleteCat} style={{ backgroundColor: '#D32F2F', borderColor: '#D32F2F', color: '#FFF' }}>
              {linksInCat.length > 0 ? 'Move & Delete' : 'Confirm Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
