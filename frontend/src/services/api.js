import axios from "axios";

/* =========================================
   AXIOS INSTANCE
========================================= */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

/* =========================================
   REQUEST INTERCEPTOR (Auth Injection)
========================================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================================
   RESPONSE INTERCEPTOR (Error Handling)
========================================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Session expired. Logging out...");
      // Optional: window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/* =========================================
   AUTHENTICATION & PROFILE
========================================= */
export const logoutApi = () => {
  return api.post("/auth/logout");
};

/* =========================================
   ADMIN ANALYTICS & DASHBOARD (NEW)
========================================= */
// 🔥 REQUIREMENT FIX: Updated endpoint to match analytics.routes.js
export const getAdminAnalyticsSummaryApi = () => {
  return api.get("/analytics/admin/summary");
};

// Fetch general dashboard stats (Students count, Trends, etc.)
export const getAdminDashboardStatsApi = () => {
  return api.get("/admin/dashboard");
};

/* =========================================
   STUDENT ANALYTICS APIs (REAL-TIME SYNC)
========================================= */
// 🔥 REQUIREMENT: Dynamic endpoints for personalized analytics
export const getStudentPerformanceApi = (id) => api.get(`/analytics/performance/${id}`);
export const getStudentActivityApi = (id) => api.get(`/analytics/activity/${id}`);
export const getStudentWeaknessApi = (id) => api.get(`/analytics/weakness/${id}`);
export const getStudentSuggestionsApi = (id) => api.get(`/analytics/improvement-suggestions/${id}`);
export const getStudentSkillsApi = (id) => api.get(`/analytics/skills/${id}`);
export const getStudentInsightsApi = (id) => api.get(`/analytics/insights/${id}`);

/* =========================================
   AI PREP & APTITUDE APIs
========================================= */
export const generateQuestionApi = (data) => {
  return api.post("/ai/generate-question", data);
};

export const verifyAnswerApi = (data) => {
  return api.post("/ai/evaluate-solution", data);
};

/* =========================================
   COMPANY MANAGEMENT (Admin Only)
========================================= */
export const getCompaniesApi = () => api.get("/admin/companies");
export const addCompanyApi = (data) => api.post("/admin/companies", data);
export const updateCompanyApi = (id, data) => api.put(`/admin/companies/${id}`, data);
export const deleteCompanyApi = (id) => api.delete(`/admin/companies/${id}`);

/* =========================================
   STUDENT MANAGEMENT (Admin Only)
========================================= */
export const getAdminStudentsApi = () => api.get("/admin/students");
export const toggleBlockStudentApi = (id, action) => api.patch(`/admin/students/${id}/${action}`);

export default api;