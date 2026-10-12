import { getCollection, saveCollection, mockRequest } from './client';

export const categoriesApi = {
  getCategories: async (userId, teamId = null) => {
    return mockRequest(() => {
      const categories = getCollection('categories');
      if (teamId) {
        return categories.filter((c) => c.team_id === Number(teamId));
      }
      return categories.filter((c) => c.user_id === Number(userId));
    });
  },

  createCategory: async ({ user_id, userId, team_id = null, teamId = null, name, color = '#7048E0' }) => {
    const finalUserId = user_id || userId;
    const finalTeamId = team_id || teamId;
    return mockRequest(() => {
      const categories = getCollection('categories');
      const cleanName = (name || '').trim();

      const exists = categories.some((c) => {
        if (finalTeamId) {
          return c.team_id === Number(finalTeamId) && c.name.toLowerCase() === cleanName.toLowerCase();
        }
        return c.user_id === Number(finalUserId) && c.name.toLowerCase() === cleanName.toLowerCase();
      });

      if (exists) {
        throw new Error(`Category "${cleanName}" already exists.`);
      }

      const newCategory = {
        id: Date.now(),
        user_id: finalUserId ? Number(finalUserId) : null,
        team_id: finalTeamId ? Number(finalTeamId) : null,
        name: cleanName,
        color: color || '#7048E0',
        created_at: new Date().toISOString(),
      };

      categories.push(newCategory);
      saveCollection('categories', categories);
      return newCategory;
    });
  },

  updateCategory: async (id, { name, color }) => {
    return mockRequest(() => {
      const categories = getCollection('categories');
      const index = categories.findIndex((c) => c.id === Number(id));
      if (index === -1) throw new Error('Category not found');

      const cat = categories[index];
      if (name) {
        const cleanName = name.trim();
        const exists = categories.some(
          (c) =>
            c.id !== Number(id) &&
            c.user_id === cat.user_id &&
            c.name.toLowerCase() === cleanName.toLowerCase()
        );
        if (exists) throw new Error(`Category "${cleanName}" already exists.`);
        cat.name = cleanName;
      }
      if (color) cat.color = color;

      saveCollection('categories', categories);
      return cat;
    });
  },

  deleteCategory: async (id, moveToCategoryId = null) => {
    return mockRequest(() => {
      const links = getCollection('links');
      const associatedLinks = links.filter(
        (l) => l.category_id === Number(id) && !l.is_deleted
      );

      if (associatedLinks.length > 0 && !moveToCategoryId) {
        const err = new Error(
          `Cannot delete: ${associatedLinks.length} link(s) belong to this category. Select a replacement category to move them first.`
        );
        err.hasDependentLinks = true;
        err.linkCount = associatedLinks.length;
        throw err;
      }

      // Reassign links to the target category
      if (moveToCategoryId) {
        links.forEach((l) => {
          if (l.category_id === Number(id)) {
            l.category_id = Number(moveToCategoryId);
          }
        });
        saveCollection('links', links);
      }

      const categories = getCollection('categories');
      const filtered = categories.filter((c) => c.id !== Number(id));
      saveCollection('categories', filtered);
      return true;
    });
  },
};
