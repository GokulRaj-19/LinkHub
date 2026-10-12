import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tasksApi } from '../api/tasksApi';
import { categoriesApi } from '../api/categoriesApi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { Bookmark, Plus, Check, ExternalLink, ArrowLeft, Inbox } from 'lucide-react';

export default function TeamLinksView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savedLinkIds, setSavedLinkIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [linksData, catsData] = await Promise.all([
        tasksApi.getTeamLinks(id),
        categoriesApi.getCategories(null, id),
      ]);
      setLinks(linksData);
      setCategories(catsData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveToPersonal = async (teamLinkId) => {
    await tasksApi.copyTeamLinkToPersonal(teamLinkId, user.id);
    setSavedLinkIds((prev) => new Set([...prev, teamLinkId]));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    await tasksApi.createTeamLink({
      team_id: id,
      title,
      url,
      added_by: user.id,
    });
    setTitle('');
    setUrl('');
    setIsModalOpen(false);
    loadData();
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <Link to={`/teams/${id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
          <ArrowLeft size={16} /> Back to Squad
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            Squad Shared Links
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Curated resources shared across your squad workspace.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} icon={Plus}>
          Add Team Link
        </Button>
      </div>

      {loading ? (
        <div className="state-box">Loading team links...</div>
      ) : links.length === 0 ? (
        <div className="state-box">
          <Inbox size={40} style={{ opacity: 0.6, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No team links yet</h3>
          <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>
            Share your first resource with the squad using the button above.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {links.map((link) => {
            const isSaved = savedLinkIds.has(link.id);
            return (
              <div key={link.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{link.title}</h3>
                  <a href={link.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    {link.url} <ExternalLink size={12} />
                  </a>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)', marginTop: '10px' }}>
                    Added by: {link.added_by_name}
                  </div>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border-subtle)' }}>
                  <Button
                    variant={isSaved ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => handleSaveToPersonal(link.id)}
                    disabled={isSaved}
                    icon={isSaved ? Check : Bookmark}
                    style={{ width: '100%' }}
                  >
                    {isSaved ? 'Saved to My Links' : 'Save to My Links'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Share Link with Squad">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="label" htmlFor="tl-title">Title *</label>
            <input id="tl-title" type="text" className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="tl-url">URL *</label>
            <input id="tl-url" type="text" className="input" value={url} onChange={(e) => setUrl(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Share Link</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
