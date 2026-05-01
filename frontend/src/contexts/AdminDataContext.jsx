/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";

const AdminDataContext = createContext();

const buildUrl = (path, params) => {
  const url = new URL(
    `${import.meta.env.VITE_API_BASE_URL}${path}`,
    window.location.origin,
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  return url.toString();
};

export const AdminDataProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (path, options = {}, params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(buildUrl(path, params), {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        ...options,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Request failed");
      }

      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const api = useMemo(
    () => ({
      getDashboard: () => request("/api/v1/admin/dashboard"),
      listBooks: (params) => request("/api/v1/admin/books", {}, params),
      createBook: (payload) =>
        request("/api/v1/admin/books", {
          method: "POST",
          body: JSON.stringify(payload),
        }),
      updateBook: (id, payload) =>
        request(`/api/v1/admin/books/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        }),
      deleteBook: (id) =>
        request(`/api/v1/admin/books/${id}`, { method: "DELETE" }),
      listGenres: () => request("/api/v1/admin/genres"),
      createGenre: (payload) =>
        request("/api/v1/admin/genres", {
          method: "POST",
          body: JSON.stringify(payload),
        }),
      updateGenre: (id, payload) =>
        request(`/api/v1/admin/genres/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        }),
      deleteGenre: (id) =>
        request(`/api/v1/admin/genres/${id}`, { method: "DELETE" }),
      listUsers: (params) => request("/api/v1/admin/users", {}, params),
      updateUserStatus: (id, status) =>
        request(`/api/v1/admin/users/${id}`, {
          method: "PUT",
          body: JSON.stringify({ status }),
        }),
      listOrders: (params) => request("/api/v1/admin/orders", {}, params),
      listReviews: (params) => request("/api/v1/admin/reviews", {}, params),
      getAnalytics: (type) =>
        request("/api/v1/admin/analytics", {}, { type }),
      updateSettings: (payload) =>
        request("/api/v1/admin/settings", {
          method: "PUT",
          body: JSON.stringify(payload),
        }),
    }),
    [request],
  );

  const value = useMemo(
    () => ({
      ...api,
      loading,
      error,
    }),
    [api, loading, error],
  );

  return (
    <AdminDataContext.Provider value={value}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData must be used within an AdminDataProvider");
  }
  return context;
};
