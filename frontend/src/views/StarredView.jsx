import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLinks } from '../hooks/useLinks';
import LinkCard from '../components/links/LinkCard';
import LinkModal from '../components/links/LinkModal';
import SearchInput from '../components/common/SearchInput';
import Button from '../components/common/Button';
import { Star, Plus, Bookmark } from 'lucide-react';

export default function StarredView() {
  const {
    links, categories, loading, error, search, setSearch,
    categoryId, setCategoryId, sort, setSort,
    addLink, editLink, removeLink, toggleStar, togglePin, trackClick, fetchCategories,
  } = useLinks({ defaultStarred: true });

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);

  const handleOpenAdd = () => { setEditingLink(null); setIsLinkModalOpen(true); };
  const handleOpenEdit = (link) => { setEditingLink(link); setIsLinkModalOpen(true); };

  const handleSaveLink = async (payload) => {
    if (editingLink) await editLink(editingLink.id, payload);
    else await addLink({ ...payload, is_starred: true });
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
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Star size={26} fill="var(--color-star, #F59E0B)" color="var(--color-star, #F59E0B)" />
            Starred Links
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Quick access to your favorite links. They also remain available in My Links.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd} icon={Plus}>Add Starred Link</Button>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search starred title, URL or tag" />
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

      {categories.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => setCategoryId(null)}
            className="btn btn-sm"
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '6px 18px',
              fontWeight: 600,
              backgroundColor: !categoryId ? 'var(--color-action)' : 'transparent',
              color: !categoryId ? 'var(--color-text-on-action)' : 'var(--color-text)',
              border: 'var(--card-border-width) solid var(--color-border)',
            }}
          >
            All ({links.all.length})
          </button>
          {categories.map((cat) => {
            const count = links.all.filter((l) => l.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className="btn btn-sm"
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 16px',
                  fontWeight: 600,
                  backgroundColor: categoryId === cat.id ? 'var(--color-action)' : 'transparent',
                  color: categoryId === cat.id ? 'var(--color-text-on-action)' : 'var(--color-text)',
                  border: 'var(--card-border-width) solid var(--color-border)',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.name} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="state-box">Loading starred links...</div>
      ) : error ? (
        <div className="state-box" style={{ color: '#D32F2F' }}>{error}</div>
      ) : links.all.length === 0 ? (
        <div className="state-box">
          <Star size={44} style={{ marginBottom: '12px', opacity: 0.5, color: 'var(--color-star, #F59E0B)' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>No Starred Links Found</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '6px', color: 'var(--color-text-muted)' }}>
            Star links in your main vault to see them gathered here. They always remain in My Links as well!
          </p>
          <div style={{ marginTop: '16px' }}>
            <Link to="/links" className="btn btn-outline btn-sm" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={15} /> Go to My Links
            </Link>
          </div>
        </div>
      ) : (
        <>
          {links.pinned.length > 0 && (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                PINNED STARRED LINKS
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {links.pinned.map(renderCard)}
              </div>
            </section>
          )}

          {links.unpinned.length > 0 && (
            <section>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                {links.pinned.length > 0 ? 'ALL STARRED LINKS' : 'STARRED LINKS'}
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
    </div>
  );
}
