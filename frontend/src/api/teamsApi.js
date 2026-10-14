import { apiRequest } from "./client";

function normalizeTeam(team) {
  if (!team) return team;

  return {
    ...team,
    lead_id: team.lead_id ?? team.leader_id,
    team_code: team.team_code ?? team.code,
    code_active: team.code_active ?? true,
  };
}

function normalizeMember(member) {
  const user = member.user || {};

  return {
    ...member,
    user_id: member.user_id ?? user.id,
    name:
      member.name ||
      member.full_name ||
      member.user_name ||
      user.full_name ||
      "Member",
    email: member.email || user.email || "",
  };
}

export const teamsApi = {
  getTeams: async (userId) => {
    const data = await apiRequest("/teams/mine");
    const teams = Array.isArray(data) ? data : data.teams || [];

    return teams.map(normalizeTeam);
  },

  getTeam: async (teamId, userId) => {
    const data = await apiRequest(`/teams/${teamId}`);
    const team = normalizeTeam(data.team || data);

    return {
      ...team,
      members: (team.members || []).map(normalizeMember),
      member_count: team.member_count ?? (team.members || []).length,
    };
  },

  createTeam: async ({ name, description }) => {
    const data = await apiRequest("/teams", {
      method: "POST",
      body: JSON.stringify({
        name: name.trim(),
        description: (description || "").trim(),
      }),
    });

    return normalizeTeam(data.team || data);
  },

  joinTeamByCode: async (code, userId) => {
    const data = await apiRequest("/teams/join", {
      method: "POST",
      body: JSON.stringify({
        team_code: (code || "").trim().toUpperCase(),
      }),
    });

    return {
      ...data,
      team: normalizeTeam(data.team),
      alreadyMember: Boolean(data.alreadyMember ?? data.already_member),
    };
  },

  addMemberByEmail: async (teamId, email, leaderId) => {
    const data = await apiRequest(`/teams/${teamId}/members`, {
      method: "POST",
      body: JSON.stringify({ email: email.trim() }),
    });

    return data;
  },

  removeMember: async (teamId, targetUserId, leaderId) => {
    await apiRequest(`/teams/${teamId}/members/${targetUserId}`, {
      method: "DELETE",
    });

    return true;
  },

  regenerateCode: async (teamId, leaderId) => {
    const data = await apiRequest(`/teams/${teamId}/code/regenerate`, {
      method: "POST",
    });

    return data.team_code || data.code;
  },
};
