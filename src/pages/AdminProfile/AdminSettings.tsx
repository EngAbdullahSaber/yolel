import { useState, useEffect } from "react";
import { FormField } from "../../components/shared/GenericForm";
import { CreateForm } from "../../components/shared/GenericForm/CreateForm";
import { z } from "zod";
import { Mail, Lock, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { useTranslation } from "react-i18next";
import { api } from "../../services/axios";
import PageMeta from "../../components/common/PageMeta";

export default function AdminSettings() {
  const navigate = useNavigate();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [initialData, setInitialData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsFetching(true);
        const response = await api.get("/user/admin/account", {
          headers: { lang },
        });
        
        if (response.data?.data) {
          setInitialData({
            email: response.data.data.email || "",
            password: "", 
          });
        }
      } catch (error: any) {
        console.error("Failed to fetch admin data:", error);
        toast.error(t("common.error"));
      } finally {
        setIsFetching(false);
      }
    };

    fetchAdminData();
  }, [lang]); // Removed t and toast to prevent infinite loops

  const adminFields: FormField[] = [
    {
      name: "email",
      label: t("common.email"),
      type: "text",
      placeholder: "admin@example.com",
      required: true,
      icon: <Mail size={18} />,
      cols: 6,
      validation: z.string().email(t("auth.invalidCredentials")).min(1, t("common.required")),
    },
    {
      name: "password",
      label: t("common.password"),
      type: "password",
      placeholder: "••••••••",
      required: false, // Optional for update
      icon: <Lock size={18} />,
      cols: 6,
      validation: z.string().min(6, t("subAdmins.validations.passwordMin")).optional().or(z.literal("")),
    },
  ];

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("common.loading"));

    try {
      // Create request body
      const body: any = { email: data.email };
      if (data.password && data.password.trim() !== "") {
        body.password = data.password;
      }

      const response = await api.patch("/user/admin/upsert", body, {
        headers: { lang },
      });

      if (response.data) {
        toast.dismiss(loadingToast);
        toast.success(t("common.saveChanges"));
        
        // Update user data in storage if necessary
        const userDataString = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
          
          // Ensure we preserve the role and other important properties
          // by explicitly carrying over all fields from the original user object
          const originalUser = userData.user || userData.data?.user || userData;
          
          const updatedUser = {
            ...userData,
            email: data.email,
            user: {
              ...originalUser,
              email: data.email,
            }
          };
          storage.setItem("user", JSON.stringify(updatedUser));
          
          // Dispatch a custom event because 'storage' event only fires for other tabs
          window.dispatchEvent(new CustomEvent("user-updated"));
        }

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        throw new Error(t("common.error"));
      }
    } catch (error: any) {
      console.error("Failed to update admin settings:", error);
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || error.message || t("common.error"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${t("header.settings")} | Yolel`}
        description="Update your administrator profile settings"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/20 dark:from-slate-950 dark:via-purple-900/10 dark:to-blue-900/10 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-xl">
                <Settings size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-purple-900 to-blue-900 dark:from-slate-100 dark:via-purple-100 dark:to-blue-100 bg-clip-text text-transparent">
                  {t("header.settings")}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {t("common.update")} {t("common.profile")}
                </p>
              </div>
          </div>

          <CreateForm
            title={t("header.profile")}
            description={t("common.update")}
            fields={adminFields}
            defaultValues={initialData}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/dashboard")}
            submitLabel={t("common.saveChanges")}
            cancelLabel={t("common.cancel")}
            isLoading={isLoading}
            mode="edit"
          />
        </div>
      </div>
    </>
  );
}
