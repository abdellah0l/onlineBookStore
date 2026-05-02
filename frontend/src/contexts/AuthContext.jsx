/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// creatin a context for the auth endpionts and the user state to wrap the app with it
// and use it in the components to access the user state
// (seee the video i sent (the react course) to learn about the context and how to use it in the components)
const AuthContext = createContext();

// ask ai to explain this code 3jzt nktb :/
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/me`,
          {
            credentials: "include",
          },
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Authenticated user:", data);
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setError(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signUp = async (email, password, username) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password, username }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        toast.success(data.message || "Signed up successfully!");
        navigate("/");
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Signing in with:", { email, password });

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/signin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        toast.success(data.message || "Signed in successfully!");
        navigate("/"); 
      } else {
        const errorData = await response.json();
        console.error("Sign-in error:", errorData);
        setError(errorData.message);
        toast.error(errorData.message || "Failed to sign in");
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (response.ok) {
        setUser(null);
        toast.success("Logged out successfully!");
        navigate("/signin");
      } else {
        const errorData = await response.json();
        setError(errorData.message || errorData.error || "Logout failed");
      }
    } catch (err) {
      setError(err);
      toast.error(err.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signUp, signIn, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
