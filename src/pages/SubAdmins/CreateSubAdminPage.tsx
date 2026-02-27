import { useState } from "react";
import { FormField } from "../../components/shared/GenericForm";
import { CreateForm } from "../../components/shared/GenericForm/CreateForm";
import { z } from "zod";
import { User, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreateMethod } from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export default function CreateSubAdminPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);

  const subAdminFields: FormField[] = [
    {
      name: "email",
      label: t("subAdmins.form.email"),
      type: "text",
      placeholder: "admin@example.com",
      required: true,
      icon: <Mail size={18} />,
      cols: 6,
      validation: z.string().email(t("common.validations.invalidEmail")).min(1, t("subAdmins.validations.emailRequired")),
    },
    {
      name: "password",
      label: t("subAdmins.form.password"),
      type: "password",
      placeholder: "••••••••",
      required: true,
      icon: <Lock size={18} />,
      cols: 6,
      validation: z.string().min(6, t("subAdmins.validations.passwordMin")),
    },
  ];

  const defaultValues = {
    email: "",
    password: "",
  };

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("subAdmins.form.creating"));

    try {
      const response = await CreateMethod("user/sub-admin", data, lang);

      if (response) {
        toast.dismiss(loadingToast);
        toast.success(t("subAdmins.form.createSuccess"));

        queryClient.invalidateQueries({ queryKey: ["subadmins-list"] });

        setTimeout(() => {
          navigate("/subadmins");
        }, 1500);
      } else {
        throw new Error(t("subAdmins.form.createError"));
      }
    } catch (error: any) {
      console.error("Failed to create subadmin:", error);
      toast.dismiss(loadingToast);
      toast.error(error.message || t("subAdmins.form.createError"));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/20 dark:from-slate-950 dark:via-purple-900/10 dark:to-blue-900/10 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-xl">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-purple-900 to-blue-900 dark:from-slate-100 dark:via-purple-100 dark:to-blue-100 bg-clip-text text-transparent">
                {t("subAdmins.createTitle")}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {t("subAdmins.createSubtitle")}
              </p>
            </div>
        </div>

        <CreateForm
          title={t("subAdmins.form.title")}
          description={t("subAdmins.form.description")}
          fields={subAdminFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/subadmins")}
          submitLabel={t("subAdmins.form.submitCreate")}
          cancelLabel={t("common.cancel")}
          isLoading={isLoading}
          mode="create"
        />
      </div>
    </div>
  );
}
