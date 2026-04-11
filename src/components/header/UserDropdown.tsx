import { useState, useEffect } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link, useNavigate } from "react-router-dom";
import { clearAuthInfo } from "../../services/utils";
import { useToast } from "../../hooks/useToast";

interface UserData {
  name?: string;
  email?: string;
  avatar?: string;
  [key: string]: any;
}

// Default user data as fallback
const DEFAULT_USER_DATA: UserData = {
  name: "Guest User",
  email: "guest@example.com",
  avatar: "/images/user/admin.png",
};

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState<UserData>(DEFAULT_USER_DATA);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const toast = useToast();

  // Load user data from storage
  useEffect(() => {
    const loadUserData = () => {
      try {
        setIsLoading(true);

        // Check both localStorage and sessionStorage for user data
        const localStorageUser = localStorage.getItem("user");
        const sessionStorageUser = sessionStorage.getItem("user");

        let user: UserData | null = null;

        if (localStorageUser) {
          try {
            user = JSON.parse(localStorageUser);
          } catch (e) {
            console.error("Error parsing localStorage user data:", e);
          }
        }

        if (!user && sessionStorageUser) {
          try {
            user = JSON.parse(sessionStorageUser);
          } catch (e) {
            console.error("Error parsing sessionStorage user data:", e);
          }
        }

        // Get user data from API response structure
        if (user) {
          // Handle different possible API response structures
          const userInfo = user.user || user.data?.user || user;

          setUserData({
            name:
              userInfo.name || userInfo.username || userInfo.fullName || "User",
            email:
              userInfo.email || userInfo.emailAddress || "user@example.com",
            avatar:
              userInfo.avatar ||
              userInfo.profilePicture ||
              userInfo.image ||
              DEFAULT_USER_DATA.avatar,
            ...userInfo, // Include any additional user properties
          });
        } else {
          // Use default data if no user found
          setUserData(DEFAULT_USER_DATA);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setUserData(DEFAULT_USER_DATA);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();

    // Listen for storage changes (for updates from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        loadUserData();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleLogout = () => {
    // Clear auth data
    clearAuthInfo();

    // Show success message
    toast.success("Logged out successfully!");

    // Close dropdown
    closeDropdown();

    // Navigate to login page after a brief delay
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  const handleNavigation = (path: string, message: string) => {
    toast.success(message);
    closeDropdown();
    navigate(path);
  };

  // Function to get user initials for avatar fallback
  const getUserInitials = (name: string): string => {
    if (!name) return "U";

    const names = name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();

    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Function to get first name for display
  const getFirstName = (name: string): string => {
    if (!name) return "User";
    return name.split(" ")[0];
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-3 text-gray-700 dropdown-toggle dark:text-gray-400"
        aria-label="User menu"
        aria-expanded={isOpen}
        disabled={isLoading}
      >
        <span className="overflow-hidden rounded-full h-11 w-11 bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : userData.avatar ? (
            <img
              src={userData.avatar}
              alt={`${userData.name}'s profile`}
              className="object-cover w-full h-full"
              onError={(e) => {
                // Fallback to initials if image fails to load
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement?.classList.add(
                  "flex",
                  "items-center",
                  "justify-center",
                  "bg-brand-500",
                  "text-white",
                  "font-bold"
                );
                e.currentTarget.parentElement!.innerHTML = `<span>${getUserInitials(
                  userData.name || ""
                )}</span>`;
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold text-lg">
              {getUserInitials(userData.name || "")}
            </div>
          )}
        </span>

        <span className="block font-medium text-theme-sm">
          {isLoading ? "Loading..." : getFirstName(userData.name || "User")}
        </span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } ${isLoading ? "opacity-50" : ""}`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 rtl:left-0 rtl:right-auto mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark z-50"
      >
        {isLoading ? (
          <div className="p-4 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="p-3">
              <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                {userData.name || "User"}
              </span>
              <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
                {userData.email || "No email provided"}
              </span>

              {/* Additional user info if available */}
              {(userData.role || userData.position) && (
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                    {userData.role || userData.position}
                  </span>
                </div>
              )}
            </div>

            <div className="h-px my-1 bg-gray-100 dark:bg-gray-800"></div>

            {userData.role?.toUpperCase() === "ADMIN" && (
              <Link
                to="/settings"
                onClick={closeDropdown}
                className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 w-full text-left"
              >
                <svg
                  className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Settings
              </Link>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 w-full text-left"
            >
              <svg
                className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
                  fill=""
                />
              </svg>
              Sign out
            </button>
          </>
        )}
      </Dropdown>
    </div>
  );
}
