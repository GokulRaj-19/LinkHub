import { apiRequest } from "./client";

export const tasksApi = {
  getTasks: async (teamId) => {
    const data = await apiRequest(`/teams/${teamId}/tasks`);
    return Array.isArray(data) ? data : data.tasks || [];
  },

  createTask: async ({
    team_id,
    title,
    description,
    assigned_to,
    priority,
    assigned_date,
    due_date,
  }) => {
    const data = await apiRequest(`/teams/${team_id}/tasks`, {
      method: "POST",
      body: JSON.stringify({
        title: title.trim(),
        description: (description || "").trim(),
        assigned_to: assigned_to ? Number(assigned_to) : null,
        priority: priority || "medium",
        assigned_date: assigned_date || "",
        due_date: due_date || null,
      }),
    });

    return data.task || data;
  },

  updateTaskStatus: async (taskId, status, userId) => {
    const data = await apiRequest(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    return data.task || data;
  },

  updateTaskProgress: async (taskId, progress, userId, memberNotes = null) => {
    const payload = {
      progress: Math.max(0, Math.min(100, Math.round(Number(progress) || 0))),
    };

    if (memberNotes !== null && memberNotes !== undefined) {
      payload.member_notes = memberNotes.trim();
    }

    const data = await apiRequest(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    return data.task || data;
  },

  updateTask: async (taskId, updates, userId) => {
    const allowedFields = [
      "title",
      "description",
      "priority",
      "due_date",
      "assigned_date",
      "assigned_to",
      "member_notes",
      "status",
      "progress",
    ];

    const payload = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        payload[field] = updates[field];
      }
    }

    const data = await apiRequest(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    return data.task || data;
  },

  deleteTask: async (taskId, userId) => {
    await apiRequest(`/tasks/${taskId}`, { method: "DELETE" });
    return true;
  },

  // Team Links

  getTeamLinks: async (teamId) => {
    const data = await apiRequest(`/teams/${teamId}/links`);
    return Array.isArray(data) ? data : data.links || [];
  },

  createTeamLink: async ({ team_id, title, url, category_id }) => {
    const data = await apiRequest(`/teams/${team_id}/links`, {
      method: "POST",
      body: JSON.stringify({
        title: title.trim(),
        url: url.trim(),
        category_id: category_id || null,
      }),
    });

    return data.link || data;
  },

  copyTeamLinkToPersonal: async (teamLinkId, userId) => {
    const data = await apiRequest(`/teams/links/${teamLinkId}/copy`, {
      method: "POST",
    });

    return {
      ...data,
      alreadySaved: Boolean(data.alreadySaved ?? data.already_saved),
    };
  },
};
