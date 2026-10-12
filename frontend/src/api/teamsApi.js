import { getCollection, saveCollection, logAudit, mockRequest } from './client';

const genCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const failedJoins = new Map();

export const teamsApi = {
  getTeams: async (userId) => mockRequest(() => {
    const memberships = getCollection('team_memberships').filter((m) => m.user_id === Number(userId));
    const teamIds = memberships.map((m) => m.team_id);
    const teams = getCollection('teams').filter((t) => teamIds.includes(t.id));
    const users = getCollection('users');
    const allM = getCollection('team_memberships');

    return teams.map((team) => {
      const mem = memberships.find((m) => m.team_id === team.id);
      const leader = users.find((u) => u.id === team.lead_id);
      return {
        ...team,
        my_role: mem?.role || 'member',
        lead_name: leader?.full_name || 'Unknown',
        member_count: allM.filter((m) => m.team_id === team.id).length,
      };
    });
  }),

  getTeam: async (teamId, userId) => mockRequest(() => {
    const team = getCollection('teams').find((t) => t.id === Number(teamId));
    if (!team) throw new Error('Team not found');
    const memberships = getCollection('team_memberships').filter((m) => m.team_id === Number(teamId));
    const users = getCollection('users');

    const members = memberships.map((m) => {
      const u = users.find((user) => user.id === m.user_id);
      return { id: m.id, user_id: m.user_id, role: m.role, name: u?.full_name || 'Member', email: u?.email || '' };
    });

    return {
      ...team,
      is_leader: team.lead_id === Number(userId),
      my_role: memberships.find((m) => m.user_id === Number(userId))?.role || null,
      lead_name: users.find((u) => u.id === team.lead_id)?.full_name || 'Unknown',
      members,
      member_count: members.length,
    };
  }),

  createTeam: async ({ name, description, lead_id }) => mockRequest(() => {
    const teams = getCollection('teams');
    const newTeam = {
      id: Date.now(),
      name: name.trim(),
      description: (description || '').trim(),
      lead_id: Number(lead_id),
      team_code: genCode(),
      code_active: true,
      created_at: new Date().toISOString(),
    };
    teams.push(newTeam);
    saveCollection('teams', teams);

    const m = getCollection('team_memberships');
    m.push({ id: Date.now() + 1, team_id: newTeam.id, user_id: Number(lead_id), role: 'lead', joined_at: new Date().toISOString() });
    saveCollection('team_memberships', m);

    logAudit(lead_id, 'CREATE_TEAM', 'TEAM', newTeam.id, { name: newTeam.name });
    return newTeam;
  }),

  joinTeamByCode: async (code, userId) => mockRequest(() => {
    const clean = (code || '').trim().toUpperCase();
    const now = Date.now();
    const recent = (failedJoins.get(userId) || []).filter((t) => now - t < 60000);
    if (recent.length >= 5) throw new Error('Too many failed join attempts. Please wait 1 minute.');

    const team = getCollection('teams').find((t) => t.team_code === clean && t.code_active);
    if (!team) {
      recent.push(now);
      failedJoins.set(userId, recent);
      throw new Error('Invalid or disabled team code.');
    }

    const memberships = getCollection('team_memberships');
    if (memberships.some((m) => m.team_id === team.id && m.user_id === Number(userId))) {
      return { alreadyMember: true, team, message: `You are already a member of "${team.name}".` };
    }

    memberships.push({ id: Date.now(), team_id: team.id, user_id: Number(userId), role: 'member', joined_at: new Date().toISOString() });
    saveCollection('team_memberships', memberships);
    logAudit(userId, 'JOIN_TEAM', 'TEAM', team.id, { team_name: team.name });
    return { alreadyMember: false, team, message: `Successfully joined "${team.name}"!` };
  }),

  addMemberByEmail: async (teamId, email, leaderId) => mockRequest(() => {
    const clean = (email || '').trim().toLowerCase();
    if (!clean) {
      throw new Error('The user was invalid. Email address is required.');
    }
    const user = getCollection('users').find((u) => u.email.toLowerCase() === clean);
    const memberships = getCollection('team_memberships');

    if (user) {
      if (memberships.some((m) => m.team_id === Number(teamId) && m.user_id === user.id)) {
        throw new Error('User is already a member of the squad.');
      }
      memberships.push({ id: Date.now(), team_id: Number(teamId), user_id: user.id, role: 'member', joined_at: new Date().toISOString() });
      saveCollection('team_memberships', memberships);
      logAudit(leaderId, 'ADD_MEMBER', 'TEAM', teamId, { email: clean });
      return { status: 'added', user };
    }

    throw new Error('The user was invalid. No account exists with this email address.');
  }),

  removeMember: async (teamId, targetUserId, leaderId) => mockRequest(() => {
    const team = getCollection('teams').find((t) => t.id === Number(teamId));
    if (team?.lead_id === Number(targetUserId)) {
      throw new Error('A team leader cannot leave or be removed without transferring leadership.');
    }
    const filtered = getCollection('team_memberships').filter(
      (m) => !(m.team_id === Number(teamId) && m.user_id === Number(targetUserId))
    );
    saveCollection('team_memberships', filtered);

    const tasks = getCollection('tasks');
    tasks.forEach((t) => {
      if (t.team_id === Number(teamId) && t.assigned_to === Number(targetUserId) && t.status !== 'done') {
        t.assigned_to = null;
        t.unassigned_flag = true;
      }
    });
    saveCollection('tasks', tasks);
    logAudit(leaderId, 'REMOVE_MEMBER', 'TEAM', teamId, { removed_user_id: targetUserId });
    return true;
  }),

  regenerateCode: async (teamId, leaderId) => mockRequest(() => {
    const team = getCollection('teams').find((t) => t.id === Number(teamId));
    if (!team) throw new Error('Team not found');
    team.team_code = genCode();
    team.code_active = true;
    saveCollection('teams', getCollection('teams'));
    logAudit(leaderId, 'REGENERATE_CODE', 'TEAM', teamId, { new_code: team.team_code });
    return team.team_code;
  }),
};
