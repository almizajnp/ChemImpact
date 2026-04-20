import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import GuruDashboard from "./pages/GuruDashboard";
import ClassDetail from "./pages/ClassDetail";

export default function App() {
  const { user, role, loading, userProfile } = useAuth();

  console.log(
    "App render - user:",
    user?.email,
    "role:",
    role,
    "userProfile:",
    userProfile,
    "loading:",
    loading,
  );

  // Wait for both auth and profile to be loaded
  if (loading || (user && !userProfile)) {
    console.log("Still loading or waiting for profile...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/" />}
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {(() => {
              console.log(
                "Routing decision - role:",
                role,
                "userProfile:",
                userProfile,
              );
              const component =
                role === "guru" ? <GuruDashboard /> : <StudentDashboard />;
              console.log(
                "Selected component:",
                role === "guru" ? "GuruDashboard" : "StudentDashboard",
              );
              return component;
            })()}
          </ProtectedRoute>
        }
      />

      <Route
        path="/student"
        element={
          <ProtectedRoute requiredRole="siswa">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/guru"
        element={
          <ProtectedRoute requiredRole="guru">
            <GuruDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/class/:classId"
        element={
          <ProtectedRoute>
            <ClassDetail />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
