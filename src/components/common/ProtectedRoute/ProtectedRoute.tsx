import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getUserData } from "../../../services/utils";

export const ProtectedRoute = ({ children }) => {
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
    const handleStorageChange = (e) => {
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
    const allowedPaths = ["/promo-codes", "/promo-codes/create"];
    const isAllowed = allowedPaths.some(path => location.pathname === path) || 
                      location.pathname.startsWith("/promo-codes/edit/");
    
    if (!isAllowed) {
      return <Navigate to="/promo-codes" replace />;
    }
  }

  return children;
};

export const PublicRoute = ({ children }) => {
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
    const targetPath = role === "MERCHANT" ? "/promo-codes" : "/votes";
    return <Navigate to={targetPath} replace />;
  }

  return children;
};
