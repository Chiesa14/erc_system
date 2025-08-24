// Environment Configuration for ERC System
// This file uses a single .env file for easy environment switching

export type Environment = "development" | "staging" | "production";

// Environment detection from .env file
export const getCurrentEnvironment = (): Environment => {
  const env = import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE;

  if (env === "production") return "production";
  if (env === "staging") return "staging";
  return "development";
};

// Single environment configuration using .env variables
export const ENV_CONFIG = {
  name: import.meta.env.VITE_ENVIRONMENT || "Development",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000",
  debug: import.meta.env.VITE_DEBUG === "true" || true,
  logLevel: import.meta.env.VITE_LOG_LEVEL || "debug",
  features: {
    websockets: true,
    realTimeUpdates: true,
    debugMode: import.meta.env.VITE_DEBUG === "true" || true,
  },
} as const;

// Get current environment configuration
export const getCurrentEnvConfig = () => {
  return ENV_CONFIG;
};

// Environment variables that can be overridden
export const getConfigValue = (key: keyof typeof ENV_CONFIG) => {
  const envVar = import.meta.env[`VITE_${key.toUpperCase()}`];
  if (envVar !== undefined) {
    return envVar;
  }
  return ENV_CONFIG[key];
};

// Feature flags
export const isFeatureEnabled = (feature: keyof typeof ENV_CONFIG.features) => {
  return ENV_CONFIG.features[feature];
};

// Debug utilities
export const debugLog = (...args: unknown[]) => {
  if (ENV_CONFIG.debug) {
    console.log(`[${getCurrentEnvironment().toUpperCase()}]`, ...args);
  }
};

export const debugWarn = (...args: unknown[]) => {
  if (ENV_CONFIG.debug) {
    console.warn(`[${getCurrentEnvironment().toUpperCase()}]`, ...args);
  }
};

export const debugError = (...args: unknown[]) => {
  if (ENV_CONFIG.debug) {
    console.error(`[${getCurrentEnvironment().toUpperCase()}]`, ...args);
  }
};

// Environment info for debugging
export const getEnvironmentInfo = () => {
  const env = getCurrentEnvironment();

  return {
    environment: env,
    name: ENV_CONFIG.name,
    apiBaseUrl: ENV_CONFIG.apiBaseUrl,
    wsBaseUrl: ENV_CONFIG.wsBaseUrl,
    debug: ENV_CONFIG.debug,
    logLevel: ENV_CONFIG.logLevel,
    features: ENV_CONFIG.features,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    envVars: {
      VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT,
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      VITE_WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL,
      VITE_DEBUG: import.meta.env.VITE_DEBUG,
      VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL,
    },
  };
};

// Export current environment for easy access
export const CURRENT_ENVIRONMENT = getCurrentEnvironment();
export const CURRENT_CONFIG = ENV_CONFIG;
