// Centralized API Configuration for ERC System
// This file manages all API integration settings, base URLs, endpoints,
// authentication tokens, and request/response interceptors

import {
  getCurrentEnvConfig,
  getCurrentEnvironment,
  debugLog,
  debugError,
} from "./environment";

// Environment-based configuration
const currentEnv = getCurrentEnvironment();
const envConfig = getCurrentEnvConfig();

// Log configuration on module load
debugLog("🔧 API Module Loaded:", {
  environment: currentEnv,
  apiBaseUrl: envConfig.apiBaseUrl,
  wsBaseUrl: envConfig.wsBaseUrl,
});

// Base URL configuration
export const API_CONFIG = {
  // Development environment
  development: {
    baseUrl: envConfig.apiBaseUrl,
    timeout: 10000,
    retryAttempts: 3,
  },
  // Production environment
  production: {
    baseUrl: envConfig.apiBaseUrl,
    timeout: 30000,
    retryAttempts: 5,
  },
  // Staging environment (optional)
  staging: {
    baseUrl: envConfig.apiBaseUrl,
    timeout: 15000,
    retryAttempts: 3,
  },
} as const;

// Get current environment configuration
export const getCurrentConfig = () => {
  return API_CONFIG[currentEnv];
};

// Current API configuration
export const API_BASE_URL = getCurrentConfig().baseUrl;
export const API_TIMEOUT = getCurrentConfig().timeout;
export const API_RETRY_ATTEMPTS = getCurrentConfig().retryAttempts;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: "/auth/token",
    register: "/auth/register",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    heartbeat: "/auth/heartbeat",
  },

  // Users
  users: {
    base: "/users",
    me: "/users/me",
    all: "/users/all",
    activate: "/users/activate",
    resetPassword: "/users/reset-password",
    profile: "/users/profile",
    update: "/users/update",
    updateUser: "/users/update-user", // For updating specific user by ID
    delete: "/users", // For deleting specific user by ID
  },

  // Families
  families: {
    base: "/families",
    members: "/family/family-members",
    activities: "/family/family-activities",
    documents: "/family/family-documents",
    stats: "/family/family-members",
    activate: "/family/family-members/activate", // For member activation
  },

  // Family Roles (catalog)
  familyRoles: {
    base: "/family-roles",
  },

  // Chat & Communication
  chat: {
    rooms: "/chat/rooms",
    messages: "/chat/messages",
    reactions: "/chat/reactions",
  },

  // Announcements
  announcements: {
    base: "/announcements",
    flyer: "/announcements/flyer",
  },

  // Feedback
  feedback: {
    base: "/feedback",
  },

  // Recommendations
  recommendations: {
    base: "/recommendations",
  },

  // Prayer Chains
  prayerChains: {
    base: "/prayer-chains",
  },

  // Documents
  documents: {
    shared: "/shared-documents",
  },

  // Admin
  admin: {
    documents: "/admin/documents",
    users: "/admin/users",
  },

  // Analytics
  analytics: {
    performance: "/analytics/performance",
    insights: "/analytics/insights",
    export: "/analytics/export",
  },

  //dashbaords
  dashboard: {
    churchOverview: "/dashboard/church-overview",
    churchOverviewSummary: "/dashboard/church-stats-summary",
    adminOverview: "/dashboard/admin-overview",
    youthOverview: "/dashboard/youth-overview",
    parentOVerview: "/dashboard/parent-overview",
    familyStats: "/dashboard/family",
  },
} as const;

// Helper function to build full API URLs
export const buildApiUrl = (
  endpoint: string,
  params?: Record<string, string | number>
): string => {
  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return url;
};

// Authentication token management
export class AuthTokenManager {
  private static readonly TOKEN_KEY = "auth_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  static removeRefreshToken(): void {
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static clearAllTokens(): void {
    this.removeToken();
    this.removeRefreshToken();
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}

// Request interceptor for adding authentication headers
export const createAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    const storedToken = AuthTokenManager.getToken();
    if (storedToken) {
      headers.Authorization = `Bearer ${storedToken}`;
    }
  }

  return headers;
};

// Response interceptor for handling common HTTP errors
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const errorData = await response.json();

      const detail = (errorData as { detail?: unknown; message?: unknown })
        .detail;
      const message = (errorData as { detail?: unknown; message?: unknown })
        .message;

      if (typeof detail === "string") {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        // Common FastAPI/Pydantic validation format.
        errorMessage = detail
          .map((d: any) => {
            const loc = Array.isArray(d?.loc) ? d.loc.join(".") : "";
            const msg = d?.msg || d?.message || JSON.stringify(d);
            return loc ? `${loc}: ${msg}` : String(msg);
          })
          .join("\n");
      } else if (detail != null) {
        errorMessage =
          typeof detail === "object" ? JSON.stringify(detail) : String(detail);
      } else if (typeof message === "string") {
        errorMessage = message;
      }
    } catch {
      // If we can't parse the error response, use the default message
    }

    const error = new Error(errorMessage);
    (error as { status?: number; response?: Response }).status =
      response.status;
    (error as { status?: number; response?: Response }).response = response;

    debugError("❌ API Response Error:", {
      url: response.url,
      status: response.status,
      message: errorMessage,
    });

    throw error;
  }

  return response;
};

// Retry mechanism for failed requests
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = API_RETRY_ATTEMPTS,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      debugLog(`🔄 Retrying request (attempt ${attempt + 1}/${maxRetries})`);

      // Exponential backoff
      const backoffDelay = delay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }

  throw lastError!;
};

// Enhanced fetch wrapper with authentication and error handling
export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {},
  params?: Record<string, string | number>
): Promise<T> => {
  const url = buildApiUrl(endpoint, params);
  const token = AuthTokenManager.getToken();

  debugLog("🌐 API Request:", {
    method: options.method || "GET",
    url: url,
    hasAuth: !!token,
  });

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...createAuthHeaders(token),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, fetchOptions);
    const processedResponse = await handleApiResponse(response);

    // Handle empty responses
    const text = await processedResponse.text();
    if (!text) {
      debugLog("✅ API Response: Empty (204 No Content)");
      return {} as T;
    }

    try {
      const data = JSON.parse(text) as T;
      debugLog("✅ API Response:", { url, status: response.status });
      return data;
    } catch {
      throw new Error("Invalid JSON response from server");
    }
  } catch (error) {
    debugError("❌ API Fetch Failed:", { url, error });
    throw error;
  }
};

// Enhanced POST request helper
export const apiPost = async <T>(
  endpoint: string,
  data: Record<string, unknown>,
  params?: Record<string, string | number>
): Promise<T> => {
  return apiFetch<T>(
    endpoint,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    params
  );
};

// Enhanced GET request helper
export const apiGet = async <T>(
  endpoint: string,
  params?: Record<string, string | number>
): Promise<T> => {
  return apiFetch<T>(
    endpoint,
    {
      method: "GET",
    },
    params
  );
};

// Enhanced PUT request helper
export const apiPut = async <T>(
  endpoint: string,
  data: Record<string, unknown>,
  params?: Record<string, string | number>
): Promise<T> => {
  return apiFetch<T>(
    endpoint,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    params
  );
};

// Enhanced DELETE request helper
export const apiDelete = async <T>(
  endpoint: string,
  params?: Record<string, string | number>
): Promise<T> => {
  return apiFetch<T>(
    endpoint,
    {
      method: "DELETE",
    },
    params
  );
};

// Form data POST helper for endpoints that expect form-url-encoded data
export const apiPostForm = async <T>(
  endpoint: string,
  formData: Record<string, string>,
  params?: Record<string, string | number>
): Promise<T> => {
  const url = buildApiUrl(endpoint, params);
  const token = AuthTokenManager.getToken();

  debugLog("🌐 API Form Request:", { method: "POST", url, hasAuth: !!token });

  const formBody = new URLSearchParams(formData).toString();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...createAuthHeaders(token),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    });

    const processedResponse = await handleApiResponse(response);
    const text = await processedResponse.text();

    if (!text) {
      debugLog("✅ API Response: Empty (204 No Content)");
      return {} as T;
    }

    try {
      const data = JSON.parse(text) as T;
      debugLog("✅ API Response:", { url, status: response.status });
      return data;
    } catch {
      throw new Error("Invalid JSON response from server");
    }
  } catch (error) {
    debugError("❌ API Form Fetch Failed:", { url, error });
    throw error;
  }
};

// WebSocket configuration
export const WS_CONFIG = {
  development: {
    baseUrl: envConfig.wsBaseUrl,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
  },
  production: {
    baseUrl: envConfig.wsBaseUrl,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
  },
} as const;

export const getWebSocketConfig = () => {
  return currentEnv === "production"
    ? WS_CONFIG.production
    : WS_CONFIG.development;
};

// Export all configurations for easy access
export default {
  API_CONFIG,
  API_BASE_URL,
  API_ENDPOINTS,
  AuthTokenManager,
  apiFetch,
  apiPost,
  apiGet,
  apiPut,
  apiDelete,
  apiPostForm,
  buildApiUrl,
  createAuthHeaders,
  handleApiResponse,
  retryRequest,
  getCurrentConfig,
  getWebSocketConfig,
};
