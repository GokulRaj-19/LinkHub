import { apiRequest } from "./client";

export const categoriesApi = {
  getCategories: async (userId, teamId = null) => {
    const query = teamId ? `?team_id=${encodeURIComponent(teamId)}` : "";

    const data = await apiRequest(`/categories${query}`);
    return Array.isArray(data) ? data : data.categories || [];
  },

  createCategory: async ({
    user_id,
    userId,
    team_id = null,
    teamId = null,
    name,
    color = "#7048E0",
  }) => {
    const payload = {
      name: (name || "").trim(),
      color,
    };

    const finalTeamId = team_id ?? teamId;

    if (finalTeamId) {
      payload.team_id = Number(finalTeamId);
    }

    const data = await apiRequest("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return data.category || data;
  },

  updateCategory: async (id, { name, color }) => {
    const payload = {};

    if (name !== undefined) payload.name = name.trim();
    if (color !== undefined) payload.color = color;

    const data = await apiRequest(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    return data.category || data;
  },

  deleteCategory: async (id, moveToCategoryId = null) => {
    let endpoint = `/categories/${id}`;

    if (moveToCategoryId) {
      endpoint += `?move_to=${encodeURIComponent(moveToCategoryId)}`;
    }

    await apiRequest(endpoint, {
      method: "DELETE",
      ...(moveToCategoryId
        ? { body: JSON.stringify({ move_to: Number(moveToCategoryId) }) }
        : {}),
    });

    return true;
  },
};
