import { apiRequest } from "./client";

export function normalizeUrl(url) {
  let cleaned = (url || "").trim();

  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }

  try {
    const parsed = new URL(cleaned);

    return (
      parsed.origin.toLowerCase() +
      parsed.pathname.replace(/\/$/, "") +
      parsed.search +
      parsed.hash
    );
  } catch {
    return cleaned;
  }
}

export const linksApi = {
  getLinks: async (
    userId,
    { search = "", categoryId = null, starred = false, sort = "newest" } = {},
  ) => {
    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (categoryId) params.set("category_id", categoryId);
    if (starred) params.set("starred", "true");
    if (sort) params.set("sort", sort);

    const query = params.toString();
    const data = await apiRequest(`/links${query ? `?${query}` : ""}`);

    if (Array.isArray(data)) {
      const pinned = data.filter((link) => link.is_pinned);
      const unpinned = data.filter((link) => !link.is_pinned);

      return { pinned, unpinned, all: [...pinned, ...unpinned] };
    }

    return {
      pinned: data.pinned || [],
      unpinned: data.unpinned || [],
      all: data.all || [...(data.pinned || []), ...(data.unpinned || [])],
    };
  },

  createLink: async (data) => {
    const payload = {
      title: (data.title || "").trim(),
      url: normalizeUrl(data.url),
      category_id: data.category_id || null,
      note: (data.note || "").trim(),
      tag: (data.tag || "").trim(),
      is_starred: Boolean(data.is_starred),
      is_pinned: Boolean(data.is_pinned),
      source_link_id: data.source_link_id || null,
    };

    const result = await apiRequest("/links", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return result.link || result;
  },

  updateLink: async (id, data) => {
    const payload = { ...data };

    if (payload.url) payload.url = normalizeUrl(payload.url);
    if (payload.category_id === "") payload.category_id = null;

    const result = await apiRequest(`/links/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    return result.link || result;
  },

  deleteLink: async (id) => {
    await apiRequest(`/links/${id}`, { method: "DELETE" });
    return true;
  },

  toggleStar: async (id) => {
    const result = await apiRequest(`/links/${id}/star`, {
      method: "PATCH",
    });

    return result.link || result;
  },

  togglePin: async (id) => {
    const result = await apiRequest(`/links/${id}/pin`, {
      method: "PATCH",
    });

    return result.link || result;
  },

  clickLink: async (id) => {
    const result = await apiRequest(`/links/${id}/click`, {
      method: "POST",
    });

    return result.link || result;
  },
};
