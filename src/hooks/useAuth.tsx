import { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  API_ENDPOINTS,
  AuthTokenManager,
  apiGet,
  apiPost,
  apiPostForm,
  buildApiUrl,
} from "@/lib/api";

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  family_category?: string;
  family_name?: string;
  family_id?: number;
  profile_pic?: string;
  biography?: string;
  created_at?: string;
  updated_at?: string;
  other?: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signInWithPassword: (
    username: string,
    password: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const roleRoutes: Record<string, string> = {
    admin: "/admin",
    Père: "/parent",
    Mère: "/parent",
    Other: "/youth",
    Pastor: "/church",
  };

  // Fetch user data from backend using the token
  const fetchUserData = async (authToken: string) => {
    try {
      const response = await apiGet<AuthUser>(API_ENDPOINTS.users.me);

      const userData = response as AuthUser;
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  };

  // On mount, check localStorage for token and fetch user
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const storedToken = localStorage.getItem("auth_token");
      const publicPaths = [
        "/",
        "/login",
        "/change-password",
        "/activation-success",
      ];
      const currentPath = window.location.pathname;

      if (storedToken) {
        setToken(storedToken);
        try {
          await fetchUserData(storedToken);
        } catch (error) {
          localStorage.removeItem("auth_token");
          setToken(null);
          if (!publicPaths.includes(currentPath)) {
            navigate("/login");
          }
        }
      } else {
        if (!publicPaths.includes(currentPath)) {
          navigate("/login");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  // Presence heartbeat while authenticated
  useEffect(() => {
    if (!token) return;

    const interval = window.setInterval(() => {
      apiPost(API_ENDPOINTS.auth.heartbeat, {}).catch(() => {
        // Intentionally ignore heartbeat errors (token expiry is handled elsewhere)
      });
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [token]);

  // Sign in method using username and password sent as form-url-encoded
  const signInWithPassword = async (
    username: string,
    password: string
  ): Promise<{ error?: string }> => {
    try {
      setLoading(true);

      const formData = {
        username,
        password,
      };

      const response = await apiPostForm<TokenResponse>(
        API_ENDPOINTS.auth.login,
        formData
      );

      const { access_token } = response;

      AuthTokenManager.setToken(access_token);
      setToken(access_token);

      const userData = await fetchUserData(access_token);

      toast({
        title: "Signed In",
        description: "You have been successfully signed in.",
      });

      const redirectPath = roleRoutes[userData.role] || "/youth";
      navigate(redirectPath);

      return {};
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: "Invalid username or password" };
    } finally {
      setLoading(false);
    }
  };

  // Sign out clears token and user and redirects
  const signOut = async () => {
    // Best-effort: tell backend we are offline
    try {
      await apiPost(API_ENDPOINTS.auth.logout, {});
    } catch {
      // Ignore network errors; still clear local session
    }
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);

    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });

    navigate("/login");
  };

  // Update user profile via POST request to /users/me
  const updateProfile = async (
    updates: Partial<AuthUser>
  ): Promise<{ error?: string }> => {
    if (!user || !token) return { error: "Not authenticated" };

    try {
      const response = await axios.put(
        buildApiUrl(API_ENDPOINTS.users.me),
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedUser = response.data;
      setUser(updatedUser);

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      return {};
    } catch (error) {
      console.error("Update profile error:", error);
      return { error: "Failed to update profile" };
    }
  };

  const value = {
    user,
    token,
    loading,
    signInWithPassword,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
