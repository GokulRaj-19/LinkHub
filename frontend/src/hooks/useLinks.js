import { useState, useEffect, useCallback } from 'react';
import { linksApi } from '../api/linksApi';
import { categoriesApi } from '../api/categoriesApi';
import { useAuth } from '../context/AuthContext';

export function useLinks({ defaultStarred = false } = {}) {
  const { user } = useAuth();
  const [links, setLinks] = useState({ pinned: [], unpinned: [], all: [] });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [starred, setStarred] = useState(defaultStarred);
  const [sort, setSort] = useState('newest');

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    try {
      const data = await categoriesApi.getCategories(user.id);
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  const fetchLinks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await linksApi.getLinks(user.id, {
        search,
        categoryId,
        starred,
        sort,
      });
      setLinks(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch links.');
    } finally {
      setLoading(false);
    }
  }, [user, search, categoryId, starred, sort]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const addLink = async (payload) => {
    const created = await linksApi.createLink({ ...payload, user_id: user.id });
    await fetchLinks();
    return created;
  };

  const editLink = async (id, payload) => {
    const updated = await linksApi.updateLink(id, payload);
    await fetchLinks();
    return updated;
  };

  const removeLink = async (id) => {
    await linksApi.deleteLink(id);
    await fetchLinks();
  };

  const toggleStar = async (id) => {
    await linksApi.toggleStar(id);
    await fetchLinks();
  };

  const togglePin = async (id) => {
    await linksApi.togglePin(id);
    await fetchLinks();
  };

  const trackClick = async (id) => {
    await linksApi.clickLink(id);
    setLinks((prev) => ({
      ...prev,
      all: prev.all.map((l) => (l.id === id ? { ...l, click_count: (l.click_count || 0) + 1 } : l)),
      pinned: prev.pinned.map((l) => (l.id === id ? { ...l, click_count: (l.click_count || 0) + 1 } : l)),
      unpinned: prev.unpinned.map((l) => (l.id === id ? { ...l, click_count: (l.click_count || 0) + 1 } : l)),
    }));
  };

  return {
    links,
    categories,
    loading,
    error,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    starred,
    setStarred,
    sort,
    setSort,
    fetchLinks,
    fetchCategories,
    addLink,
    editLink,
    removeLink,
    toggleStar,
    togglePin,
    trackClick,
  };
}
