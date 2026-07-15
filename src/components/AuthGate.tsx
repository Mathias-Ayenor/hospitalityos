import React, { useState } from "react";

import App from "../App";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import HotelWizard from "../features/onboarding/HotelWizard";

import { useAuth } from "../hooks/useAuth";

export default function AuthGate() {
  const {
    loading,
    user,
    hotel,
  } = useAuth();

  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            HospitalityOS
          </h2>

          <p className="text-slate-500 mt-2">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return showRegister ? (
      <Register
        onBackToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onCreateAccount={() => setShowRegister(true)}
      />
    );
  }

  // Logged in but hotel not configured
  if (!hotel) {
    return <HotelWizard />;
  }

  // Logged in and onboarded
  return <App />;
}