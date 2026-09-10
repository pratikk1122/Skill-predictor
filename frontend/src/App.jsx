import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./routes/routes";

import VerifyOTP from "./pages/VerifyOTP";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ResumeScorer from "./pages/ResumeScorer";
import GroupDiscussion from "./pages/GroupDiscussion";

// 🔥 AI INTERVIEW
import AIInterview from "./pages/AIInterview";

// ⭐ NEW: STUDENT ANALYTICS
import StudentAnalytics from "./pages/StudentAnalytics";

// 🔥 ADMIN INTERVIEWS
import AdminInterviews from "./pages/AdminInterviews";
import AdminInterviewDetails from "./pages/AdminInterviewDetails";

import ActivityLogs from "./pages/ActivityLogs";
import Helpdesk from "./pages/Helpdesk";
import Students from "./pages/Students";
import AdminCompanies from "./pages/AdminCompanies";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Aptitude from "./pages/Aptitude";
import AptitudeTest from "./pages/AptitudeTest";

import SkillDashboard from "./pages/SkillDashboard";

// 🔥 NEW: COMPANY PREP
import CompanyPrep from "./pages/CompanyPrep";
import CompanyQuestionPage from "./pages/CompanyQuestionPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route path={ROUTES.HOME} element={<LandingPage />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.SIGNUP} element={<Signup />} />
        <Route path={ROUTES.VERIFY_OTP} element={<VerifyOTP />} />
        
        {/* ================= FORGOT PASSWORD ================= */}
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route path="/skill-radar" element={<SkillDashboard />} />

        {/* Dashboard alias for safety */}
        <Route path="/dashboard" element={<Navigate to={ROUTES.STUDENT_DASHBOARD} replace />} />

        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/activity-logs"
          element={
            <AdminRoute>
              <ActivityLogs />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/helpdesk"
          element={
            <AdminRoute>
              <Helpdesk />
            </AdminRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN_STUDENTS}
          element={
            <AdminRoute>
              <Students />
            </AdminRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN_COMPANIES}
          element={
            <AdminRoute>
              <AdminCompanies />
            </AdminRoute>
          }
        />

        {/* 🔥 ADMIN AI INTERVIEWS ROUTES */}
        <Route
          path="/admin/interviews"
          element={
            <AdminRoute>
              <AdminInterviews />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/interviews/:studentId"
          element={
            <AdminRoute>
              <AdminInterviewDetails />
            </AdminRoute>
          }
        />

        {/* ================= STUDENT ROUTES ================= */}
        <Route
          path={ROUTES.STUDENT_DASHBOARD}
          element={
            <PrivateRoute>
              <StudentDashboard />
            </PrivateRoute>
          }
        />

        {/* ⭐ STUDENT ANALYTICS ROUTE */}
        <Route
          path="/student/analytics"
          element={
            <PrivateRoute>
              <StudentAnalytics />
            </PrivateRoute>
          }
        />

        {/* RESUME ROUTE */}
        <Route
          path={ROUTES.RESUME_SCORER}
          element={
            <PrivateRoute>
              <ResumeScorer />
            </PrivateRoute>
          }
        />

        {/* LEGACY RESUME REDIRECT */}
        <Route
          path={ROUTES.RESUME_SCORER_LEGACY}
          element={<Navigate to={ROUTES.RESUME_SCORER} replace />}
        />

        {/* AI INTERVIEW */}
        <Route
          path="/student/ai-interview"
          element={
            <PrivateRoute>
              <AIInterview />
            </PrivateRoute>
          }
        />

        {/* APTITUDE */}
        <Route
          path="/student/aptitude"
          element={
            <PrivateRoute>
              <Aptitude />
            </PrivateRoute>
          }
        />

        <Route
          path="/student/group-discussion"
          element={
            <PrivateRoute>
              <GroupDiscussion />
            </PrivateRoute>
          }
        />

        <Route
          path="/student/aptitude/:category"
          element={
            <PrivateRoute>
              <AptitudeTest />
            </PrivateRoute>
          }
        />

        {/* 🔥 SECURED: COMPANY PREP ROUTE IS NOW PROTECTED */}
        <Route
          path="/company-prep"
          element={
            <PrivateRoute>
              <CompanyPrep />
            </PrivateRoute>
          }
        />

        {/* COMPANY QUESTIONS */}
        <Route
          path="/company-prep/:companyName"
          element={
            <PrivateRoute>
              <CompanyQuestionPage />
            </PrivateRoute>
          }
        />

        {/* ADMIN SAFETY REDIRECT */}
        <Route
          path="/admin/*"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        {/* 🔥 SAFETY CATCH-ALL: Prevents blank page for unknown routes */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;