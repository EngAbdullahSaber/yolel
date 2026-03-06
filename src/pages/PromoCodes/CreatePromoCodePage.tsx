import { useState } from "react";
import { FormField } from "../../components/shared/GenericForm";
import { z } from "zod";
import { Tag, Calendar, Percent, Store, Type, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CreateMethod, GetPanigationMethod } from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CreateForm } from "../../components/shared/GenericForm/CreateForm";

interface Merchant {
  id: number;
  name: string;
}

interface MerchantsResponse {
  data: Merchant[];
}
 
export default function CreatePromoCodePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);

  // Fetch merchants for the dropdown
  const { data: merchantsData } = useQuery<MerchantsResponse>({
    queryKey: ["merchants-all"],
    queryFn: () => GetPanigationMethod("user/merchant/all", 1, 1000, lang, ""),
  });

  const merchants = merchantsData?.data || [];

  // Define form fields for creating a promo code
  const promoCodeFields: FormField[] = [
    // Code
    {
      name: "code",
      label: t("promoCodes.form.code"),
      type: "text",
      placeholder: t("promoCodes.form.codePlaceholder"),
      required: true,
      icon: <Tag size={18} />,
      cols: 6,
      validation: z
        .string()
        .min(1, t("common.isRequired")),
    },
    // Type
    {
      name: "type",
      label: t("promoCodes.form.type"),
      type: "select",
      required: true,
      icon: <Type size={18} />,
      cols: 6,
      options: [
        { label: t("promoCodes.types.ONLINE_DISCOUNT"), value: "ONLINE_DISCOUNT" },
        { label: t("promoCodes.types.SYSTEM"), value: "SYSTEM" },
      ],
      validation: z.enum(["ONLINE_DISCOUNT", "SYSTEM"]),
    },
    // Start Date
    {
      name: "startDate",
      label: t("promoCodes.form.startDate"),
      type: "date",
      required: true,
      icon: <Calendar size={18} />,
      cols: 6,
      validation: z.string().min(1, t("common.isRequired")),
    },
    // End Date
    {
      name: "endDate",
      label: t("promoCodes.form.endDate"),
      type: "date",
      required: true,
      icon: <Calendar size={18} />,
      cols: 6,
      validation: z.string().min(1, t("common.isRequired")),
    },
    // Discount Percentage
    {
      name: "discountPercent",
      label: t("promoCodes.form.discountPercent"),
      type: "number",
      placeholder: t("promoCodes.form.discountPercentPlaceholder"),
      required: true,
      icon: <Percent size={18} />,
      cols: 6,
      validation: z.coerce.number().min(0).max(100),
    },
    // Merchant ID
    {
      name: "merchantId",
      label: t("promoCodes.form.merchantName"),
      type: "select",
      placeholder: t("promoCodes.form.merchantNamePlaceholder"),
      required: false,
      icon: <Store size={18} />,
      cols: 6,
      options: [
        { label: t("common.all") || "Select Merchant", value: "" },
        ...merchants.map((m) => ({ label: m.name, value: m.id.toString() }))
      ],
    },
  ];

  const defaultValues = {
    code: "",
    type: "ONLINE_DISCOUNT",
    startDate: "",
    endDate: "",
    discountPercent: 0,
    merchantId: "",
  };

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("promoCodes.form.creating"));

    try {
      // Form date objects from strings
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);

      if (end <= start) {
        throw new Error(t("promoCodes.form.dateValidation"));
      }

      // Format dates to ISO string as expected by API
      const requestData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        merchantId: data.merchantId ? Number(data.merchantId) : null,
      };
      
      // Remove merchantId if it's null to avoid sending it as null if API doesn't like it
      if (requestData.merchantId === null) {
        delete requestData.merchantId;
      }
      
      // The user wants to replace merchantName with merchantId, so we delete merchantName just in case
      delete requestData.merchantName;

      const result = await CreateMethod("promo-code", requestData, lang);

      if (!result) {
        throw new Error(t("promoCodes.form.error"));
      }

      toast.dismiss(loadingToast);
      toast.success(t("promoCodes.form.success"), { duration: 2000 });

      queryClient.invalidateQueries({ queryKey: ["promoCodes"] });

      setTimeout(() => {
        navigate("/promo-codes");
      }, 1500);

      return result;
    } catch (error: any) {
      console.error("Failed to create promo code:", error);
      toast.dismiss(loadingToast);
      const errorMessage = error?.response?.data?.message || error?.message || t("promoCodes.form.error");
      toast.error(errorMessage, { duration: 3000 });
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen !pb-36 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/20 dark:from-slate-900 dark:via-emerald-900/5 dark:to-teal-900/5 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/promo-codes")}
              className="p-2.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("promoCodes.createTitle")}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {t("promoCodes.createSubtitle")}
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="p-4 bg-gradient-to-tr from-emerald-600 to-teal-700 rounded-2xl shadow-lg shadow-emerald-500/20 transform rotate-3">
              <Tag size={24} className="text-white" />
            </div>
          </div>
        </div>

        {/* Form */}
        <CreateForm
          title={t("promoCodes.form.title")}
          description={t("promoCodes.form.description")}
          fields={promoCodeFields}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/promo-codes")}
          submitLabel={t("promoCodes.form.submit")}
          cancelLabel={t("common.cancel")}
          isLoading={isLoading}
          mode="create"
          customValidation={(data) => {
            const errors: any = {};
            if (data.type === "ONLINE_DISCOUNT" && Number(data.discountPercent) >= 100) {
              errors.discountPercent = t("promoCodes.form.discountValidation");
            }
            return errors;
          }}
          className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/20 dark:border-slate-700/50 shadow-2xl rounded-[2.5rem]"
        />
      </div>
    </div>
  );
}
