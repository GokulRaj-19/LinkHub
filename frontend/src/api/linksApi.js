import { getCollection, saveCollection, logAudit, mockRequest } from './client';

export function normalizeUrl(url) {
  let cleaned = (url || '').trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = 'https://' + cleaned;
  }
  try {
    const parsed = new URL(cleaned);
    return parsed.origin.toLowerCase() + parsed.pathname.replace(/\/$/, '') + parsed.search + parsed.hash;
  } catch (e) {
    return cleaned;
  }
}

export const linksApi = {
  getLinks: async (userId, { search = '', categoryId = null, starred = false, sort = 'newest' } = {}) => {
    return mockRequest(() => {
      let links = getCollection('links').filter((l) => l.user_id === userId && !l.is_deleted);

      if (search.trim()) {
        const query = search.toLowerCase().trim();
        links = links.filter(
          (l) =>
            l.title.toLowerCase().includes(query) ||
            l.url.toLowerCase().includes(query) ||
            (l.tag && l.tag.toLowerCase().includes(query)) ||
            (l.note && l.note.toLowerCase().includes(query))
        );
      }

      if (categoryId) {
        links = links.filter((l) => l.category_id === Number(categoryId));
      }

      if (starred) {
        links = links.filter((l) => l.is_starred);
      }

      // Sort pinned links first (sorted by pinned_at desc)
      // Then unpinned sorted by chosen sort criterion
      const pinned = links
        .filter((l) => l.is_pinned)
        .sort((a, b) => new Date(b.pinned_at || 0) - new Date(a.pinned_at || 0));

      let unpinned = links.filter((l) => !l.is_pinned);
      if (sort === 'title') {
        unpinned.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === 'clicks') {
        unpinned.sort((a, b) => (b.click_count || 0) - (a.click_count || 0));
      } else {
        // newest
        unpinned.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }

      return { pinned, unpinned, all: [...pinned, ...unpinned] };
    });
  },

  createLink: async (data) => {
    return mockRequest(() => {
      const links = getCollection('links');
      const normalized = normalizeUrl(data.url);

      const duplicate = links.find(
        (l) => l.user_id === data.user_id && !l.is_deleted && normalizeUrl(l.url) === normalized
      );
      if (duplicate) {
        throw new Error('This URL already exists in your vault.');
      }

      const newLink = {
        id: Date.now(),
        user_id: data.user_id,
        category_id: data.category_id ? Number(data.category_id) : null,
        title: data.title.trim(),
        url: normalized,
        note: data.note ? data.note.trim() : '',
        tag: data.tag ? data.tag.trim() : '',
        is_starred: Boolean(data.is_starred),
        is_pinned: Boolean(data.is_pinned),
        pinned_at: data.is_pinned ? new Date().toISOString() : null,
        source_link_id: data.source_link_id || null,
        click_count: 0,
        is_deleted: false,
        created_at: new Date().toISOString(),
      };

      links.unshift(newLink);
      saveCollection('links', links);
      logAudit(data.user_id, 'CREATE_LINK', 'LINK', newLink.id, { title: newLink.title });
      return newLink;
    });
  },

  updateLink: async (id, data) => {
    return mockRequest(() => {
      const links = getCollection('links');
      const index = links.findIndex((l) => l.id === Number(id));
      if (index === -1) throw new Error('Link not found.');

      const current = links[index];
      if (data.url) {
        const normalized = normalizeUrl(data.url);
        const duplicate = links.find(
          (l) =>
            l.id !== Number(id) &&
            l.user_id === current.user_id &&
            !l.is_deleted &&
            normalizeUrl(l.url) === normalized
        );
        if (duplicate) throw new Error('This URL already exists in your vault.');
        current.url = normalized;
      }

      if (data.title !== undefined) current.title = data.title.trim();
      if (data.note !== undefined) current.note = data.note.trim();
      if (data.tag !== undefined) current.tag = data.tag.trim();
      if (data.category_id !== undefined) {
        current.category_id = data.category_id ? Number(data.category_id) : null;
      }
      if (data.is_starred !== undefined) current.is_starred = Boolean(data.is_starred);
      if (data.is_pinned !== undefined) {
        const wasPinned = current.is_pinned;
        current.is_pinned = Boolean(data.is_pinned);
        if (!wasPinned && current.is_pinned) {
          current.pinned_at = new Date().toISOString();
        } else if (!current.is_pinned) {
          current.pinned_at = null;
        }
      }

      saveCollection('links', links);
      return current;
    });
  },

  deleteLink: async (id) => {
    return mockRequest(() => {
      const links = getCollection('links');
      const index = links.findIndex((l) => l.id === Number(id));
      if (index !== -1) {
        links[index].is_deleted = true;
        saveCollection('links', links);
      }
      return true;
    });
  },

  toggleStar: async (id) => {
    return mockRequest(() => {
      const links = getCollection('links');
      const item = links.find((l) => l.id === Number(id));
      if (!item) throw new Error('Link not found');
      item.is_starred = !item.is_starred;
      saveCollection('links', links);
      return item;
    });
  },

  togglePin: async (id) => {
    return mockRequest(() => {
      const links = getCollection('links');
      const item = links.find((l) => l.id === Number(id));
      if (!item) throw new Error('Link not found');
      item.is_pinned = !item.is_pinned;
      item.pinned_at = item.is_pinned ? new Date().toISOString() : null;
      saveCollection('links', links);
      return item;
    });
  },

  clickLink: async (id) => {
    return mockRequest(() => {
      const links = getCollection('links');
      const item = links.find((l) => l.id === Number(id));
      if (item) {
        item.click_count = (item.click_count || 0) + 1;
        saveCollection('links', links);
      }
      return item;
    });
  },
};
