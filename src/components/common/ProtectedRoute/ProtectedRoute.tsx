import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getUserData } from "../../../services/utils";

interface RouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: RouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const user = getUserData();
  const role = user?.role?.toUpperCase();

  useEffect(() => {
    const checkAuth = () => {
      // Check for token in both storage locations
      const token =
        localStorage.getItem("yolel_auth_token") ||
        sessionStorage.getItem("yolel_auth_token");
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for logout events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "yolel_auth_token" && !e.newValue) {
        setIsAuthenticated(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Role-based access control for merchants
  if (role === "MERCHANT") {
    // Merchants can only access the list view, not create or edit
    const isAllowed = location.pathname === "/promo-codes" || 
                      location.pathname === "/profile" || 
                      location.pathname === "/logout";
    
    if (!isAllowed) {
      return <Navigate to="/promo-codes" replace />;
    }
  }

  // Role-based access control for sub admin
  if (role === "SUB_ADMIN") {
    const allowedPaths = ["/reports", "/admin-images"];
    const isAllowed =
      allowedPaths.some((path) => location.pathname === path) ||
      location.pathname.startsWith("/admin-images/");

    if (!isAllowed) {
      return <Navigate to="/reports" replace />;
    }
  }

  return children;
};

export const PublicRoute = ({ children }: RouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const user = getUserData();
  const role = user?.role?.toUpperCase();

  useEffect(() => {
    const checkAuth = () => {
      const token =
        localStorage.getItem("yolel_auth_token") ||
        sessionStorage.getItem("yolel_auth_token");
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    checkAuth();

    const handleStorageChange = () => checkAuth();
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    const targetPath = role === "MERCHANT" ? "/promo-codes" : role === "SUB_ADMIN" ? "/reports" : "/votes";
    return <Navigate to={targetPath} replace />;
  }

  return children;
};
