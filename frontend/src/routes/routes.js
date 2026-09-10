// src/routes/routes.js

/**
 * Centralized route constants
 * 👉 Single source of truth for all routes
 * 👉 Avoids hardcoded strings
 */

export const ROUTES = {
  // PUBLIC ROUTES
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  VERIFY_OTP: "/verify-otp",

  // PASSWORD
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // DASHBOARDS
  ADMIN_DASHBOARD: "/admin/dashboard",
  STUDENT_DASHBOARD: "/student",

  // ADMIN
  ADMIN_STUDENTS: "/admin/students",
  ADMIN_COMPANIES: "/admin/companies",
  ADMIN_ADD_COMPANY: "/admin/companies/add",
  ADMIN_EDIT_COMPANY: "/admin/companies/edit",

  // FEATURES
  RESUME_SCORER: "/resume",

  // 🔥 COMPATIBILITY FIX (DO NOT REMOVE)
  RESUME_SCORER_LEGACY: "/resume-scorer",

  // 🔥 APTITUDE ROUTES
  STUDENT_APTITUDE: "/student/aptitude",
  STUDENT_APTITUDE_CATEGORY: "/student/aptitude/:category"
};
