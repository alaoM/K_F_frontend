"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { decrypt, encrypt } from "@/secure/__enc";
import { get } from "http";

// --- Types ---
export type UserRole = "buyer" | "seller" | "admin";

export interface User {
  id: string;
  role: UserRole;
  email: string;
  business_name?: string;
  isOnboarded: boolean;
  isVerified: boolean;
  fullName?: string;
  phoneNumber: number;
  location: string;
  address: string;
  hasSellerProfile: boolean;
  sellerProfile?: {
    businessName: string;
    businessEmail: string;
    businessPhoneNumber: string;
    businessAddress: string;
    businessCity: string;
    businessState: string;
    businessPostalCode: string;
    bio?: string;
    banner?: string;
    logo?: string;
  };
  userAvatar?: string;
  isTwoFactorEnabled: boolean;
  lifetimeSalesVolume: number;
  hasCreatedStore: boolean;
  hasCreatedCreatorProfile: boolean;
}

interface OnboardingData {
  address: string;
  location: string;
  phoneNumber: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  verify2FA: (userId: string, code: string, rememberMe: boolean) => Promise<void>;
  register: (payload: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
    location: string;
    isRegisteringToSell: boolean;
  }) => Promise<any>;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<any>;
  logout: (returnToCurrent?: boolean) => void;
  completeOnboarding: (data: OnboardingData) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_USER_KEY = "_user_";
export const COOKIE_TOKEN_KEY = "_tkn_";
export const COOKIE_REFRESH_KEY = "_ref_"

// Helper: Get Cookie Options
export const getCookieOptions = (days = 1) => ({
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: days * 24 * 60 * 60,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  // Helper: Persistence
  const updateLocalUser = (userData: User) => {
    setUser(userData);
    setCookie(COOKIE_USER_KEY, JSON.stringify(userData), { path: "/", maxAge: 7 * 24 * 60 * 60 });
  };
  const logout = useCallback(async (returnToCurrent = false) => {

    deleteCookie(COOKIE_USER_KEY);
    deleteCookie(COOKIE_TOKEN_KEY);
    deleteCookie(COOKIE_REFRESH_KEY);
    setUser(null);
    setToken(null);
    // Notify other tabs
    window.localStorage.setItem("logout_event", Date.now().toString());
    await fetch(`/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },

    });
    if (returnToCurrent && pathname !== "/login") {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else {
      router.push("/login");
    }
  }, [pathname, token, router]);

  const refreshUserData = useCallback(async () => {
    try {
      const response = await fetch("/api/users/me"); // Call your proxy route
      const result = await response.json();

      if (response.ok && result.success) {
        updateLocalUser(result.data); // Update state + cookies with fresh data
      } else if (response.status === 401) {
        logout(true);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  }, [token]);
  
  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/refresh", { method: "POST" });
      const result = await response.json();

      if (response.ok && result.success) {
        setToken(result.accessToken);
        // After getting new token, get the updated user data (with new role)
        await refreshUserData();
      } else {
        console.error("Token refresh failed");
      }
    } catch (error) {
      console.error("Failed to refresh token:", error);
    }
  }, [refreshUserData]);



  // --- HYBRID STEP 1: INSTANT RESTORATION ---
  const loadUserFromCookies = useCallback(() => {
    setIsLoading(true);
    const storedUser = getCookie(COOKIE_USER_KEY);
    const storedToken = getCookie(COOKIE_TOKEN_KEY);

    if (storedUser && storedToken) {
      try {
        const decryptedToken = decrypt(storedToken as string);
        const parsedUser = JSON.parse(storedUser as string);

        setUser(parsedUser); // UI updates instantly from cookie
        setToken(decryptedToken);

        // After UI is ready, sync with server in background
        refreshUserData();
      } catch (e) {
        logout(true);
      }
    }
    setIsLoading(false);
  }, [refreshUserData]);

  useEffect(() => {
    loadUserFromCookies();

    // Listen for storage changes (cross-tab login/logout)
    const syncAuth = (e: StorageEvent) => {
      if (e.key === "logout_event") {
        logout();
      } else if (e.key === "auth_change") {
        loadUserFromCookies();
      }
    };
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, [loadUserFromCookies, logout]);

  const signIn = async (email: string, password: string, rememberMe: boolean): Promise<any> => {

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      if (data.mfaRequired) {
        setIsLoading(true)
        return data
      }

      const { user: userData } = data;


      // Security Check: Verification
      if (!userData.isEmailVerified) {
        toast.warning("Please verify your email address.");

        await fetch("/api/auth/resend-verification-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        return;
      }



      handleLoginSuccess(data, rememberMe);

      return data;
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (data: any, rememberMe: boolean) => {

    const { user: userData, token: rawToken, refreshToken: refreshToken
    } = data;
    const options = getCookieOptions(rememberMe ? 30 : 1);

    setCookie(COOKIE_USER_KEY, JSON.stringify(userData), options);
    setCookie(COOKIE_TOKEN_KEY, encrypt(rawToken), options);
    if (refreshToken) setCookie(COOKIE_REFRESH_KEY, encrypt(refreshToken), options);

    setUser(userData);
    setToken(rawToken);

    // Notify other tabs
    window.localStorage.setItem("auth_change", Date.now().toString());

    if (!userData.isOnboarded) {
      router.push(`/`);
    } else {
      const redirectUrl = (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get("redirect") : null) || `/dashboard/${userData.role.toLowerCase()}`;
      router.push(decodeURIComponent(redirectUrl));
    }
  };

  const verify2FA = async (userId: string, code: string, rememberMe: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/2FA/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid Code");

      handleLoginSuccess(data, rememberMe);
    } catch (err: any) {
      throw err; // Let the Modal handle the error display
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({
    isRegisteringToSell,
    ...payload
  }: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber: string;
    address: string;
    location: string;
    isRegisteringToSell: boolean;
  }) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Registration failed",
        };
      }

      const { user, accessToken } = data;

      if (accessToken && user) {
        setCookie(COOKIE_USER_KEY, JSON.stringify(user), getCookieOptions(1));
        setCookie(COOKIE_TOKEN_KEY, encrypt(accessToken), getCookieOptions(1));
        setUser(user);
        setToken(accessToken);
      }

      if (!user.isVerified) {
        toast.info("Check your email to verify your account");
      }

       const redirectUrl = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get("redirect") : null;

      

      if (isRegisteringToSell) {
        router.push("/onboarding/become-a-seller");
      } else {
        if (redirectUrl) {
          router.push(redirectUrl); // 🔥 go back to intended page
        } else {
          if (user.role === "buyer") {
            router.push("/");
          } else {
            router.push(`/dashboard/${user.role.toLowerCase()}`);
          }
        }
      }

      return {
        success: true,
        data,
      };

    } catch (err: any) {

      return {
        success: false,
        message: err?.message || "Something went wrong",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (
    formData: OnboardingData
  ): Promise<boolean> => {
    if (!user?.id) {
      router.replace("/login");
      return false;
    }

    const userId = user.id;

    try {
      const response = await fetch(`/api/auth/onboard?id=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          code: data.code,
          message: data.message,
        };
      }

      const updatedUser = {
        ...user,
        ...data.user,
        isOnboarded: true,
      };

      setCookie(COOKIE_USER_KEY, JSON.stringify(updatedUser), getCookieOptions(7));
      setUser(updatedUser);

      toast.success("Profile completed successfully!");
      return true;

    } catch (err: any) {
      toast.error(err.message || "Onboarding failed");
      return false;
    }
  };



  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      isLoading,
      register,
      signIn,
      verify2FA,
      logout: (val) => logout(val),
      completeOnboarding,
      refreshUserData,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};