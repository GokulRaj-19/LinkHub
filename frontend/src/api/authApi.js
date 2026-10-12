import { getCollection, saveCollection, logAudit, mockRequest } from './client';

export const authApi = {
  login: async (email, password) => {
    return mockRequest(() => {
      const users = getCollection('users');
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) throw new Error('Invalid email or password.');
      if (!user.is_active) throw new Error('Account is inactive. Contact support.');
      if (user.password !== password) throw new Error('Invalid email or password.');

      const sessionUser = { ...user };
      delete sessionUser.password;
      localStorage.setItem('linkhub_current_user', JSON.stringify(sessionUser));
      logAudit(user.id, 'LOGIN', 'USER', user.id, { email: user.email });
      return sessionUser;
    });
  },

  register: async ({ full_name, email, password, theme = 'sketch' }) => {
    return mockRequest(() => {
      const users = getCollection('users');
      const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) throw new Error('An account with this email already exists.');

      const newUser = {
        id: Date.now(),
        email: email.trim(),
        password,
        full_name: full_name.trim(),
        role: 'user',
        theme: theme || 'sketch',
        is_active: true,
        created_at: new Date().toISOString(),
      };
      users.push(newUser);
      saveCollection('users', users);

      // Create default categories for the new user
      const categories = getCollection('categories');
      categories.push(
        { id: Date.now() + 1, user_id: newUser.id, team_id: null, name: 'Work', color: '#7048E0' },
        { id: Date.now() + 2, user_id: newUser.id, team_id: null, name: 'Learning', color: '#28A8E0' }
      );
      saveCollection('categories', categories);

      // Auto-accept any pending invites for this email
      const invites = getCollection('team_invites');
      const memberships = getCollection('team_memberships');
      invites.forEach((inv) => {
        if (inv.email.toLowerCase() === email.toLowerCase() && inv.status === 'pending') {
          inv.status = 'accepted';
          memberships.push({
            id: Date.now() + Math.random(),
            team_id: inv.team_id,
            user_id: newUser.id,
            role: 'member',
            joined_at: new Date().toISOString(),
          });
        }
      });
      saveCollection('team_invites', invites);
      saveCollection('team_memberships', memberships);

      const sessionUser = { ...newUser };
      delete sessionUser.password;
      localStorage.setItem('linkhub_current_user', JSON.stringify(sessionUser));
      logAudit(newUser.id, 'REGISTER', 'USER', newUser.id, { email: newUser.email });
      return sessionUser;
    });
  },

  logout: async () => {
    return mockRequest(() => {
      localStorage.removeItem('linkhub_current_user');
      return true;
    });
  },

  getCurrentUser: () => {
    const raw = localStorage.getItem('linkhub_current_user');
    return raw ? JSON.parse(raw) : null;
  },

  updateProfile: async (data) => {
    return mockRequest(() => {
      const current = authApi.getCurrentUser();
      if (!current) throw new Error('Unauthorized');
      const users = getCollection('users');
      const index = users.findIndex((u) => u.id === current.id);
      if (index === -1) throw new Error('User not found');

      if (data.full_name) users[index].full_name = data.full_name;
      if (data.password) users[index].password = data.password;

      saveCollection('users', users);
      const updated = { ...users[index] };
      delete updated.password;
      localStorage.setItem('linkhub_current_user', JSON.stringify(updated));
      return updated;
    });
  },

  updateTheme: async (theme) => {
    return mockRequest(() => {
      const current = authApi.getCurrentUser();
      if (current) {
        const users = getCollection('users');
        const index = users.findIndex((u) => u.id === current.id);
        if (index !== -1) {
          users[index].theme = theme;
          saveCollection('users', users);
        }
        current.theme = theme;
        localStorage.setItem('linkhub_current_user', JSON.stringify(current));
      }
      return theme;
    });
  },
};
