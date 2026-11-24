"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Silent & safe profile refresh (Never triggers Next.js red overlay)
  const refreshProfile = useCallback(async (customToken) => {
    const activeToken = customToken || localStorage.getItem("texora_token");
    if (!activeToken) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
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
    } catch {
      // Backend offline or restarting — fallback silently to localStorage user
      try {
        const cached = localStorage.getItem("texora_user");
        if (cached) setUser(JSON.parse(cached));
      } catch {}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("texora_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {}
    refreshProfile();
  }, [refreshProfile]);

  const loginSuccess = (userData, token) => {
    if (token) localStorage.setItem("texora_token", token);
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

  const updateUserAddresses = (addresses) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, savedAddresses: addresses };
      localStorage.setItem("texora_user", JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    localStorage.removeItem("texora_token");
    localStorage.removeItem("texora_user");
    setUser(null);
  };

  const openAuthModal = (afterLoginCallback = null) => {
    if (typeof afterLoginCallback === "function") {
      setPendingAction(() => afterLoginCallback);
    } else {
      setPendingAction(null);
    }
    setIsAuthModalOpen(true);
  };

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