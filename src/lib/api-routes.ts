// lib/api-routes.ts

export const BASE_API = "http://localhost:8000/"; // Or your actual backend base, e.g., "api"

export const ACTIVITY_API = `${BASE_API}/family/family-activities`;
export const FAMILY_API = `${BASE_API}/families`;
export const USERS_API = `${BASE_API}/users`;
export const LOGIN_API = `${BASE_API}/auth/login`;
export const REGISTER_API = `${BASE_API}/auth/register`;

// You can keep adding more endpoints here as your app grows.
