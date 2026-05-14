// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn          from "./pages/SignIn";
import SignUp          from "./pages/SignUp";
import ForgotPassword  from "./pages/ForgotPassword";
import ResetPassword   from "./pages/ResetPassword";
import Terms           from "./pages/Terms";
import Privacy         from "./pages/Privacy";
import Dashboard       from "./pages/Dashboard";
import Admin           from "./pages/Admin";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/signin"          element={<SignIn />}         />
        <Route path="/signup"          element={<SignUp />}         />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />}  />
        <Route path="/terms"           element={<Terms />}          />
        <Route path="/privacy"         element={<Privacy />}        />

        {/* Main app */}
        <Route path="/dashboard"       element={<Dashboard />}      />

        {/* Admin panel — separate page, admin only */}
        <Route path="/admin"           element={<Admin />}          />

        {/* Default redirect */}
        <Route path="/"                element={<Navigate to="/signin" replace />} />
        <Route path="*"                element={<Navigate to="/signin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
