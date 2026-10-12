import { getCollection, saveCollection, logAudit, mockRequest } from './client';

export const tasksApi = {
  getTasks: async (teamId) => {
    return mockRequest(() => {
      const allTasks = getCollection('tasks').filter((t) => t.team_id === Number(teamId));
      const users = getCollection('users');

      return allTasks.map((t) => {
        const assignee = users.find((u) => u.id === t.assigned_to);
        const creator = users.find((u) => u.id === t.created_by);
        return {
          ...t,
          assignee_name: assignee ? assignee.full_name : 'Unassigned',
          assignee_email: assignee ? assignee.email : '',
          creator_name: creator ? creator.full_name : 'Unknown',
        };
      });
    });
  },

  createTask: async ({ team_id, title, description, assigned_to, priority, due_date, created_by }) => {
    return mockRequest(() => {
      // Validate assigned user is current squad member
      const memberships = getCollection('team_memberships');
      const isMember = memberships.some(
        (m) => m.team_id === Number(team_id) && m.user_id === Number(assigned_to)
      );
      if (!isMember) {
        throw new Error('Task can only be assigned to a current member of this squad.');
      }

      const tasks = getCollection('tasks');
      const newTask = {
        id: Date.now(),
        team_id: Number(team_id),
        title: title.trim(),
        description: (description || '').trim(),
        status: 'in_progress',
        priority: priority || 'medium',
        assigned_to: Number(assigned_to),
        created_by: Number(created_by),
        due_date: due_date || '',
        created_at: new Date().toISOString(),
      };

      tasks.unshift(newTask);
      saveCollection('tasks', tasks);
      logAudit(created_by, 'CREATE_TASK', 'TASK', newTask.id, { title: newTask.title, assigned_to });
      return newTask;
    });
  },

  updateTaskStatus: async (taskId, status, userId) => {
    return mockRequest(() => {
      const tasks = getCollection('tasks');
      const task = tasks.find((t) => t.id === Number(taskId));
      if (!task) throw new Error('Task not found');

      // Verify permission: Leader of team or the assigned user
      const teams = getCollection('teams');
      const team = teams.find((t) => t.id === task.team_id);
      const isLeader = team && team.lead_id === Number(userId);
      const isAssignee = task.assigned_to === Number(userId);

      if (!isLeader && !isAssignee) {
        throw new Error('You do not have permission to update this task.');
      }

      task.status = status;
      saveCollection('tasks', tasks);
      logAudit(userId, 'UPDATE_TASK_STATUS', 'TASK', taskId, { status });
      return task;
    });
  },

  deleteTask: async (taskId, userId) => {
    return mockRequest(() => {
      const tasks = getCollection('tasks');
      const task = tasks.find((t) => t.id === Number(taskId));
      if (!task) throw new Error('Task not found');

      const teams = getCollection('teams');
      const team = teams.find((t) => t.id === task.team_id);
      if (!team || team.lead_id !== Number(userId)) {
        throw new Error('Only the squad leader can delete tasks.');
      }

      const filtered = tasks.filter((t) => t.id !== Number(taskId));
      saveCollection('tasks', filtered);
      return true;
    });
  },

  // Team Links
  getTeamLinks: async (teamId) => {
    return mockRequest(() => {
      const links = getCollection('team_links').filter(
        (l) => l.team_id === Number(teamId) && !l.is_deleted
      );
      const users = getCollection('users');
      return links.map((l) => {
        const u = users.find((user) => user.id === l.added_by);
        return {
          ...l,
          added_by_name: u ? u.full_name : 'Team Member',
        };
      });
    });
  },

  createTeamLink: async ({ team_id, title, url, category_id, added_by }) => {
    return mockRequest(() => {
      const links = getCollection('team_links');
      const newLink = {
        id: Date.now(),
        team_id: Number(team_id),
        category_id: category_id ? Number(category_id) : null,
        added_by: Number(added_by),
        title: title.trim(),
        url: url.trim(),
        click_count: 0,
        is_deleted: false,
        created_at: new Date().toISOString(),
      };
      links.unshift(newLink);
      saveCollection('team_links', links);
      logAudit(added_by, 'CREATE_TEAM_LINK', 'TEAM_LINK', newLink.id, { title: newLink.title });
      return newLink;
    });
  },

  copyTeamLinkToPersonal: async (teamLinkId, userId) => {
    return mockRequest(() => {
      const teamLinks = getCollection('team_links');
      const tLink = teamLinks.find((l) => l.id === Number(teamLinkId));
      if (!tLink) throw new Error('Team link not found');

      const personalLinks = getCollection('links');
      const exists = personalLinks.some(
        (l) => l.user_id === Number(userId) && l.url === tLink.url && !l.is_deleted
      );

      if (exists) {
        return { alreadySaved: true };
      }

      const newPersonal = {
        id: Date.now(),
        user_id: Number(userId),
        category_id: null,
        title: tLink.title,
        url: tLink.url,
        note: `Saved from team workspace`,
        tag: 'team',
        is_starred: false,
        is_pinned: false,
        pinned_at: null,
        source_link_id: tLink.id,
        click_count: 0,
        is_deleted: false,
        created_at: new Date().toISOString(),
      };

      personalLinks.unshift(newPersonal);
      saveCollection('links', personalLinks);
      return { alreadySaved: false, link: newPersonal };
    });
  },
};
