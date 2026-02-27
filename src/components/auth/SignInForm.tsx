import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CreateMethod } from "../../services/apis/ApiMethod";
import { storeAuthInfo } from "../../services/utils";
import { useToast } from "../../hooks/useToast";

interface FormData {
  email: string;
  password: string;
}

interface LoginResponse {
  data: {
    token: string;
    user: any;
  };
}

// Constants
const DEMO_CREDENTIALS = {
  email: "picBattleadmin@admin.com",
  password: "123456!!",
} as const;

const INITIAL_FORM_STATE: FormData = {
  email: "",
  password: "",
};

export default function SignInForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // State management
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>(INITIAL_FORM_STATE);

  // Load remembered email on mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem("remembered_email");
    if (rememberedEmail) {
      setFormData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      toast.error(t("messages.required"));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error(t("messages.invalidEmail"));
      return false;
    }

    return true;
  };

  const handleRememberMe = () => {
    if (rememberMe) {
      localStorage.setItem("remembered_email", formData.email);
    } else {
      localStorage.removeItem("remembered_email");
    }
  };

  const handleSuccessfulLogin = (response: LoginResponse) => {
    const { token, user } = response.data;

    // Store authentication info
    storeAuthInfo({ token, user, rememberMe });
    handleRememberMe();

    // Show success message
    const message = rememberMe
      ? t("auth.signInSuccess")
      : t("auth.signInSuccess");

    toast.success(message, { duration: 2000 });

    // Navigate to dashboard
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  const handleLoginError = (error: any) => {
    console.error("Login error:", error);

    if (error.response) {
      const { status, data } = error.response;
      const errorMessages: Record<number, string> = {
        404: t("messages.loadingError"),
        401: t("messages.invalidEmail"),
        400: data.message || t("messages.error"),
        500: t("messages.error"),
      };

      toast.error(
        errorMessages[status] ||
          data.message ||
          `${t("messages.error")} ${status}`,
      );
    } else if (error.request) {
      toast.error(t("messages.loadingError"));
    } else {
      toast.error(`${t("messages.error")}: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    const loadingToast = toast.loading("Signing in...");

    try {
      const response = await CreateMethod(
        "/user/admin/login",
        formData,
        currentLang,
      );

      if (response?.data) {
        toast.dismiss(loadingToast);
        handleSuccessfulLogin(response);
      } else {
        toast.dismiss(loadingToast);
        toast.error(t("messages.error"));
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      handleLoginError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    toast.custom(
      `${t("common.password")} ${showPassword ? "hidden" : "visible"}`,
    );
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);

    if (isChecked && formData.email) {
      toast.success(t("messages.success"));
    } else if (!isChecked) {
      toast.info(t("messages.info"));
    }
  };

  return (
    <div className="flex items-center justify-center w-full max-w-md py-8">
      <div className="w-full">
        {/* Header */}
        <div className="mb-10 text-center lg:text-left">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-xl shadow-brand-500/20 transform hover:scale-110 transition-transform duration-300">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h18m-5 1a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
            {t("common.welcome")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {t("auth.signIn")} to continue to <span className="text-brand-600 dark:text-brand-400 font-semibold">Yolel System</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
              {t("auth.email")}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                </svg>
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@yolel.com"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
              {t("auth.password")}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-gray-900 dark:text-white placeholder-gray-400"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-500 transition-colors p-2 rounded-xl"
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.024 10.024 0 014.132-5.403m5.414.072A10.05 10.05 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.403m-4.114-1.223A3 3 0 1110.88 10.88" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-lg checked:bg-brand-500 checked:border-brand-500 transition-all cursor-pointer"
                  disabled={isLoading}
                />
                <svg
                  className="absolute w-3.5 h-3.5 text-white left-0.5 top-0.5 pointer-events-none hidden peer-checked:block transition-all"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                {t("auth.rememberMe")}
              </span>
            </label>
            <Link
              to="/reset-password"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold rounded-2xl shadow-xl shadow-brand-500/20 hover:shadow-brand-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t("common.loading")}</span>
              </>
            ) : (
              <>
                <span>{t("auth.signIn")}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-10 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {t("auth.dontHaveAccount")}{" "}
            <Link
              to="/signup"
              className="text-brand-600 dark:text-brand-400 font-bold hover:underline transition-all"
            >
              {t("auth.signUpHere")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
