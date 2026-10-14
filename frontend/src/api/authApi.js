import { apiRequest } from "./client";

export const authApi = {
  login: async (email, password) => {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password }),
    });

    if (data.token) {
      sessionStorage.setItem("linkhub_token", data.token);
    }

    return data.user;
  },

  register: async ({ full_name, email, password, theme = "sketch" }) => {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        full_name: full_name.trim(),
        email: email.trim(),
        password,
        theme,
      }),
    });

    if (data.token) {
      sessionStorage.setItem("linkhub_token", data.token);
    }

    return data.user;
  },

  logout: async () => {
    try {
      if (sessionStorage.getItem("linkhub_token")) {
        await apiRequest("/auth/logout", { method: "POST" });
      }
    } finally {
      sessionStorage.removeItem("linkhub_token");
    }

    return true;
  },

  getCurrentUser: async () => {
    if (!sessionStorage.getItem("linkhub_token")) {
      return null;
    }

    try {
      const data = await apiRequest("/users/me");
      return data.user || data;
    } catch (error) {
      if (
        error.message === "Unauthorized" ||
        error.message.toLowerCase().includes("token")
      ) {
        sessionStorage.removeItem("linkhub_token");
        return null;
      }

      throw error;
    }
  },

  updateProfile: async (data) => {
    const updated = await apiRequest("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    return updated.user || updated;
  },

  updateTheme: async (theme) => {
    const data = await apiRequest("/users/me/theme", {
      method: "PATCH",
      body: JSON.stringify({ theme }),
    });

    return data.theme || theme;
  },
};
