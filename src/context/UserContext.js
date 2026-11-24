
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const UserContext = createContext();

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Refresh user profile from backend
  const refreshProfile = useCallback(async (customToken) => {
    const activeToken =
      customToken || localStorage.getItem("texora_token");

    if (!activeToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        const userData = data.user || data;

        setUser(userData);
        localStorage.setItem("texora_user", JSON.stringify(userData));
      } else if (res.status === 401) {
        localStorage.removeItem("texora_token");
        localStorage.removeItem("texora_user");
        setUser(null);
      }
    } catch (error) {
      console.error("Profile refresh failed:", error);

      // Fallback to cached user if backend is unavailable
      try {
        const cached = localStorage.getItem("texora_user");

        if (cached) {
          setUser(JSON.parse(cached));
        }
      } catch {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load saved user and refresh profile
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("texora_user");

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem("texora_user");
    }

    refreshProfile();
  }, [refreshProfile]);

  // Handle successful login
  const loginSuccess = (userData, token) => {
    if (token) {
      localStorage.setItem("texora_token", token);
    }

    if (userData) {
      localStorage.setItem("texora_user", JSON.stringify(userData));
      setUser(userData);
    }

    setIsAuthModalOpen(false);

    if (typeof pendingAction === "function") {
      pendingAction();
      setPendingAction(null);
    }
  };

  // Update saved addresses
  const updateUserAddresses = (addresses) => {
    setUser((prev) => {
      if (!prev) return prev;

      const updated = {
        ...prev,
        savedAddresses: addresses,
      };

      localStorage.setItem("texora_user", JSON.stringify(updated));

      return updated;
    });
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("texora_token");
    localStorage.removeItem("texora_user");

    setUser(null);
    setIsAuthModalOpen(false);
    setPendingAction(null);
  };

  // Open authentication modal
  const openAuthModal = (afterLoginCallback = null) => {
    if (typeof afterLoginCallback === "function") {
      setPendingAction(() => afterLoginCallback);
    } else {
      setPendingAction(null);
    }

    setIsAuthModalOpen(true);
  };

  // Close authentication modal
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingAction(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn: !!user,
        loading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginSuccess,
        logout,
        refreshProfile,
        updateUserAddresses,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
