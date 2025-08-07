// src/App.jsx
import React, { Suspense, lazy, useContext } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import FloatingListButton from "./components/FloatingListButton"; // ← NEW
import { AuthContext } from "./context/AuthContext";
import "./i18n";
  import { ToastContainer } from 'react-toastify';

import SearchResults from "./Pages/SearchResults";
import Terms from "./Pages/Terms";
import Privacy from "./Pages/Privacy";

/* ────── Lazy-loaded Pages ─────────────────────────────────── */
const Home = lazy(() => import("./Pages/Home"));
const AboutUs = lazy(() => import("./Pages/AboutUs"));
const BusinessDetail = lazy(() => import("./Pages/BusinessDetail"));
const CategoryBusinesses = lazy(() => import("./Pages/CategoryBusinesses"));
const SignIn = lazy(() => import("./Pages/SignIn"));
const Register = lazy(() => import("./Pages/Register"));
const TestSmsOtp = lazy(() => import("./Pages/testSmsOtp"));
const Profile = lazy(() => import("./Pages/Profile"));
const AddBusiness = lazy(() => import("./Pages/AddBusiness"));
const EditBusiness = lazy(() => import("./Pages/EditBusinessPage"));
const Dashboard = lazy(() => import("./Dashboard/Dashboard"));
const NotFound = lazy(() => import("./Pages/NotFound"));
const ForgotPassword = lazy(() => import("./Pages/ForgotPassword"));
const VerifyResetOtp = lazy(() => import("./Pages/VerifyResetOtp"));
const ResetPassword = lazy(() => import("./Pages/ResetPassword"));

/* ────── Helpers ──────────────────────────────────────────── */
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

/** Guest-only wrapper (blocks signed-in users) */
function GuestOnlyRoute({ children }) {
  const { token } = useContext(AuthContext);
  return token ? <Navigate to="/" replace /> : children;
}

/* ────── Main app ─────────────────────────────────────────── */
export default function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <ScrollToTop />

      <Navbar />

      {/* Main content area */}
      <div className="pt-16 relative">
        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-screen">
              <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/business/:slug" element={<BusinessDetail />} />
            <Route path="/categories/:slug" element={<CategoryBusinesses />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms-conditions" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Guest-only routes */}
            <Route
              path="/signin"
              element={
                <GuestOnlyRoute>
                  <SignIn />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <GuestOnlyRoute>
                  <Register />
                </GuestOnlyRoute>
              }
            />
            <Route
              path="/testSmsOtp"
              element={
                <GuestOnlyRoute>
                  <TestSmsOtp />
                </GuestOnlyRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-business"
              element={
                <ProtectedRoute>
                  <EditBusiness />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-business"
              element={
                <ProtectedRoute>
                  <AddBusiness />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>

        {/* Site-wide floating “List Business” button */}
      </div>
    </>
  );
}
