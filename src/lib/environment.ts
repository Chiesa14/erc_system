// Environment Configuration for ERC System
// This file allows easy switching between different deployment environments

export type Environment = 'development' | 'staging' | 'production';

// Environment detection
export const getCurrentEnvironment = (): Environment => {
  const env = import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE;
  
  if (env === 'production') return 'production';
  if (env === 'staging') return 'staging';
  return 'development';
};

// Environment-specific configurations
export const ENV_CONFIG = {
  development: {
    name: 'Development',
    apiBaseUrl: 'http://localhost:8000',
    wsBaseUrl: 'ws://localhost:8000',
    debug: true,
    logLevel: 'debug',
    features: {
      websockets: true,
      realTimeUpdates: true,
      debugMode: true,
    },
  },
  staging: {
    name: 'Staging',
    apiBaseUrl: 'https://staging.erc-system.com', // Update with your staging URL
    wsBaseUrl: 'wss://staging.erc-system.com', // Update with your staging WebSocket URL
    debug: true,
    logLevel: 'info',
    features: {
      websockets: true,
      realTimeUpdates: true,
      debugMode: false,
    },
  },
  production: {
    name: 'Production',
    apiBaseUrl: 'https://api.erc-system.com', // Update with your production URL
    wsBaseUrl: 'wss://api.erc-system.com', // Update with your production WebSocket URL
    debug: false,
    logLevel: 'warn',
    features: {
      websockets: true,
      realTimeUpdates: true,
      debugMode: false,
    },
  },
} as const;

// Get current environment configuration
export const getCurrentEnvConfig = () => {
  const env = getCurrentEnvironment();
  return ENV_CONFIG[env];
};

// Environment variables that can be overridden
export const getConfigValue = (key: keyof typeof ENV_CONFIG.development) => {
  const envVar = import.meta.env[`VITE_${key.toUpperCase()}`];
  if (envVar !== undefined) {
    return envVar;
  }
  return getCurrentEnvConfig()[key];
};

// Feature flags
export const isFeatureEnabled = (feature: keyof typeof ENV_CONFIG.development.features) => {
  return getCurrentEnvConfig().features[feature];
};

// Debug utilities
export const debugLog = (...args: unknown[]) => {
  if (getCurrentEnvConfig().debug) {
    console.log(`[${getCurrentEnvironment().toUpperCase()}]`, ...args);
  }
};

export const debugWarn = (...args: unknown[]) => {
  if (getCurrentEnvConfig().debug) {
    console.warn(`[${getCurrentEnvironment().toUpperCase()}]`, ...args);
  }
};

export const debugError = (...args: unknown[]) => {
  if (getCurrentEnvConfig().debug) {
    console.error(`[${getCurrentEnvironment().toUpperCase()}]`, ...args);
  }
};

// Environment info for debugging
export const getEnvironmentInfo = () => {
  const env = getCurrentEnvironment();
  const config = getCurrentEnvConfig();
  
  return {
    environment: env,
    name: config.name,
    apiBaseUrl: config.apiBaseUrl,
    wsBaseUrl: config.wsBaseUrl,
    debug: config.debug,
    logLevel: config.logLevel,
    features: config.features,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  };
};

// Export current environment for easy access
export const CURRENT_ENVIRONMENT = getCurrentEnvironment();
export const CURRENT_CONFIG = getCurrentEnvConfig();
