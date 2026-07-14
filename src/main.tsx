import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import { AuthProvider } from "./contexts/AuthContext";
import AuthGate from "./components/AuthGate";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  </StrictMode>
);