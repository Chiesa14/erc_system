// lib/api-routes.ts - Updated to use centralized configuration
// This file now imports from the centralized api.ts configuration

import { API_ENDPOINTS, buildApiUrl } from "./api";

// Legacy exports for backward compatibility - these now use the centralized config
export const BASE_API = buildApiUrl(""); // Base URL without endpoint

// Family-related APIs
export const ACTIVITY_API = buildApiUrl(API_ENDPOINTS.families.activities);
export const FAMILY_API = buildApiUrl(API_ENDPOINTS.families.base);
export const USERS_API = buildApiUrl(API_ENDPOINTS.users.me);
export const LOGIN_API = buildApiUrl(API_ENDPOINTS.auth.login);
export const REGISTER_API = buildApiUrl(API_ENDPOINTS.auth.register);

// Additional family endpoints
export const FAMILY_MEMBERS_API = buildApiUrl(API_ENDPOINTS.families.members);
export const FAMILY_DOCUMENTS_API = buildApiUrl(
  API_ENDPOINTS.families.documents
);
export const FAMILY_STATS_API = buildApiUrl(API_ENDPOINTS.families.stats);

// Chat endpoints
export const CHAT_ROOMS_API = buildApiUrl(API_ENDPOINTS.chat.rooms);
export const CHAT_MESSAGES_API = buildApiUrl(API_ENDPOINTS.chat.messages);
export const CHAT_REACTIONS_API = buildApiUrl(API_ENDPOINTS.chat.reactions);

// Announcement endpoints
export const ANNOUNCEMENTS_API = buildApiUrl(API_ENDPOINTS.announcements.base);
export const ANNOUNCEMENT_FLYER_API = buildApiUrl(
  API_ENDPOINTS.announcements.flyer
);

// Feedback and recommendations
export const FEEDBACK_API = buildApiUrl(API_ENDPOINTS.feedback.base);
export const RECOMMENDATIONS_API = buildApiUrl(
  API_ENDPOINTS.recommendations.base
);

// Prayer chains
export const PRAYER_CHAINS_API = buildApiUrl(API_ENDPOINTS.prayerChains.base);

// Documents
export const SHARED_DOCUMENTS_API = buildApiUrl(API_ENDPOINTS.documents.shared);

// Admin endpoints
export const ADMIN_ACCESS_CODES_API = buildApiUrl(
  API_ENDPOINTS.admin.accessCodes
);
export const ADMIN_DOCUMENTS_API = buildApiUrl(API_ENDPOINTS.admin.documents);
export const ADMIN_USERS_API = buildApiUrl(API_ENDPOINTS.admin.users);

// You can keep adding more endpoints here as your app grows.
// All endpoints now automatically use the correct base URL based on environment.
