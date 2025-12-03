import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import MarketplacePage from "./pages/MarketplacePage";
import LostFoundPage from "./pages/LostFoundPage";
import HackathonPage from "./pages/HackathonPage";
import Navbar from "./components/Navbar";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: "1rem", color: "white" }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Wrapper that shows Navbar around protected pages
function LayoutWithNavbar({ children }) {
  return (
    <>
      <Navbar />
      <div style={{ padding: "1rem" }}>{children}</div>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public pages - NO NAVBAR */}
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected pages - WITH NAVBAR */}
      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <LayoutWithNavbar>
              <MarketplacePage />
            </LayoutWithNavbar>
          </ProtectedRoute>
        }
      />

      <Route
        path="/lost-found"
        element={
          <ProtectedRoute>
            <LayoutWithNavbar>
              <LostFoundPage />
            </LayoutWithNavbar>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hackathon"
        element={
          <ProtectedRoute>
            <LayoutWithNavbar>
              <HackathonPage />
            </LayoutWithNavbar>
          </ProtectedRoute>
        }
      />

      {/* Default page → Signup */}
      <Route path="*" element={<Navigate to="/signup" replace />} />
    </Routes>
  );
}
