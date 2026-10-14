const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

export async function apiRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem("linkhub_token");

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = new Error(
      data?.message || data?.msg || "API request failed.",
    );

    if (data?.hasDependentLinks !== undefined) {
      error.hasDependentLinks = data.hasDependentLinks;
    }

    if (data?.linkCount !== undefined) {
      error.linkCount = data.linkCount;
    }

    throw error;
  }

  return data;
}

export const delay = (ms = 150) =>
  new Promise((resolve) => setTimeout(resolve, ms));
