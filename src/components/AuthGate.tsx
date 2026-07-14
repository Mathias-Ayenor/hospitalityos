import React, { useState } from "react";

import App from "../App";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";

import { useAuth } from "../hooks/useAuth";

export default function AuthGate() {
  const {
    loading,
    user,
    hotel,
  } = useAuth();

  const [showRegister, setShowRegister] =
    useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            HospitalityOS
          </h2>

          <p className="text-slate-500 mt-2">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <Register
        onBackToLogin={() =>
          setShowRegister(false)
        }
      />
    ) : (
      <Login
        onCreateAccount={() =>
          setShowRegister(true)
        }
      />
    );
  }

  // Hotel onboarding will return here later
  if (!hotel) {
    return <App />;
  }

  return <App />;
}