/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { toast } from "sonner";

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

  const getDashboard = useCallback(() => request("/api/v1/admin/dashboard"), [request]);
  const listBooks = useCallback((params) => request("/api/v1/admin/books", {}, params), [request]);
  const createBook = useCallback((payload) => (
    request("/api/v1/admin/books", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((data) => {
      toast.success("Book created successfully!");
      return data;
    }).catch((err) => {
      toast.error(err.message || "Failed to create book");
      throw err;
    })
  ), [request]);
  const updateBook = useCallback((id, payload) => (
    request(`/api/v1/admin/books/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }).then((data) => {
      toast.success("Book updated successfully!");
      return data;
    }).catch((err) => {
      toast.error(err.message || "Failed to update book");
      throw err;
    })
  ), [request]);
  const deleteBook = useCallback((id) => (
    request(`/api/v1/admin/books/${id}`, { method: "DELETE" }).then((data) => {
      toast.success("Book deleted successfully!");
      return data;
    }).catch((err) => {
      toast.error(err.message || "Failed to delete book");
      throw err;
    })
  ), [request]);
  const listGenres = useCallback(() => request("/api/v1/admin/genres"), [request]);
  const createGenre = useCallback((payload) => (
    request("/api/v1/admin/genres", {
      method: "POST",
      body: JSON.stringify(payload),
    }).then((data) => {
      toast.success("Genre created successfully!");
      return data;
    }).catch((err) => {
      toast.error(err.message || "Failed to create genre");
      throw err;
    })
  ), [request]);
  const updateGenre = useCallback((id, payload) => (
    request(`/api/v1/admin/genres/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }).then((data) => {
      toast.success("Genre updated successfully!");
      return data;
    }).catch((err) => {
      toast.error(err.message || "Failed to update genre");
      throw err;
    })
  ), [request]);
  const deleteGenre = useCallback((id) => (
    request(`/api/v1/admin/genres/${id}`, { method: "DELETE" }).then((data) => {
      toast.success("Genre deleted successfully!");
      return data;
    }).catch((err) => {
      toast.error(err.message || "Failed to delete genre");
      throw err;
    })
  ), [request]);
  const listUsers = useCallback((params) => request("/api/v1/admin/users", {}, params), [request]);
  const updateUserStatus = useCallback((id, status) => (
    request(`/api/v1/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }).then((data) => {
      toast.success("User status updated successfully!");
      return data;
    }).catch((err) => {
      toast.error(err.message || "Failed to update user status");
      throw err;
    })
  ), [request]);
  const listOrders = useCallback((params) => request("/api/v1/admin/orders", {}, params), [request]);
  const listReviews = useCallback((params) => request("/api/v1/admin/reviews", {}, params), [request]);
  const getAnalytics = useCallback((type) => request("/api/v1/admin/analytics", {}, { type }), [request]);
  const updateSettings = useCallback((payload) => (
    request("/api/v1/admin/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    }).then((data) => {
      toast.success("Settings updated successfully!");
      return data;
    }).catch((err) => {
      toast.error(err.message || "Failed to update settings");
      throw err;
    })
  ), [request]);

  const value = useMemo(() => ({
    getDashboard,
    listBooks,
    createBook,
    updateBook,
    deleteBook,
    listGenres,
    createGenre,
    updateGenre,
    deleteGenre,
    listUsers,
    updateUserStatus,
    listOrders,
    listReviews,
    getAnalytics,
    updateSettings,
    loading,
    error,
  }), [
    getDashboard,
    listBooks,
    createBook,
    updateBook,
    deleteBook,
    listGenres,
    createGenre,
    updateGenre,
    deleteGenre,
    listUsers,
    updateUserStatus,
    listOrders,
    listReviews,
    getAnalytics,
    updateSettings,
    loading,
    error,
  ]);

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
