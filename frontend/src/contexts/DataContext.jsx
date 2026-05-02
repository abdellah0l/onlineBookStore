/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { toast } from "sonner";

const DataContext = createContext();

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

export const DataProvider = ({ children }) => {
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
        throw new Error(data?.message || data?.error || "Request failed");
      }

      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  const getRecentBooks = useCallback(() => request("/api/v1/recent-books"), [request]);
  const getGenres = useCallback(() => request("/api/v1/genres"), [request]);
  const getBooks = useCallback((params) => request("/api/v1/books", {}, params), [request]);
  const getBook = useCallback((id) => request(`/api/v1/books/${id}`), [request]);
  const checkout = useCallback((bookId) => request("/api/v1/orders/checkout", {
    method: "POST",
    body: JSON.stringify({ book_id: bookId }),
  }), [request]);
  const addToWishlist = useCallback((bookId) =>
    request("/api/v1/orders/wishlist", {
      method: "POST",
      body: JSON.stringify({ book_id: bookId }),
    }).then((data) => {
      toast.success("Added to wishlist successfully!");
      return data;
    }).catch((err) => {
      toast.error(err.message || "Failed to add to wishlist");
      throw err;
    }), [request]);
  const getMe = useCallback(() => request("/api/v1/me"), [request]);
  const getReadUrl = useCallback((id) => request(`/api/v1/books/${id}/read`), [request]);

  const value = useMemo(() => ({
    getRecentBooks,
    getGenres,
    getBooks,
    getBook,
    checkout,
    addToWishlist,
    getMe,
    getReadUrl,
    loading,
    error,
  }), [getRecentBooks, getGenres, getBooks, getBook, checkout, addToWishlist, getMe, getReadUrl, loading, error]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
