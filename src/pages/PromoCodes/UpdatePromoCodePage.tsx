import { useState, useEffect } from "react";
import { FormField } from "../../components/shared/GenericForm";
import { z } from "zod";
import { Tag, Calendar, Percent, Store, Type, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { UpdateMethod, GetSpecifiedMethod } from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CreateForm } from "../../components/shared/GenericForm/CreateForm";

export default function UpdatePromoCodePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const toast = useToast();
  const queryClient = useQueryClient();
  const lang = i18n.language || "en";

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    const fetchPromoCode = async () => {
      try {
        const result = await GetSpecifiedMethod(`promo-code/${id}`, lang);
        if (result && result.data) {
          // Format dates for the date input (YYYY-MM-DD or YYYY-MM-DDTHH:mm)
          const data = result.data;
          setInitialData({
            ...data,
            startDate: data.startDate ? new Date(data.startDate).toISOString().split('T')[0] : "",
            endDate: data.endDate ? new Date(data.endDate).toISOString().split('T')[0] : "",
            discountPercent: Number(data.discountPercent)
          });
        } else {
          toast.error(t("promoCodes.form.error"));
          navigate("/promo-codes");
        }
      } catch (error) {
        console.error("Failed to fetch promo code:", error);
        toast.error(t("promoCodes.form.error"));
        navigate("/promo-codes");
      } finally {
        setIsFetching(false);
      }
    };

    fetchPromoCode();
  }, [id, lang, navigate, t, toast]);

  const promoCodeFields: FormField[] = [
    {
      name: "code",
      label: t("promoCodes.form.code"),
      type: "text",
      placeholder: t("promoCodes.form.codePlaceholder"),
      required: true,
      icon: <Tag size={18} />,
      cols: 6,
      validation: z.string().min(1, t("common.isRequired")),
    },
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
    {
      name: "startDate",
      label: t("promoCodes.form.startDate"),
      type: "date",
      required: true,
      icon: <Calendar size={18} />,
      cols: 6,
      validation: z.string().min(1, t("common.isRequired")),
    },
    {
      name: "endDate",
      label: t("promoCodes.form.endDate"),
      type: "date",
      required: true,
      icon: <Calendar size={18} />,
      cols: 6,
      validation: z.string().min(1, t("common.isRequired")),
    },
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
    {
      name: "merchantName",
      label: t("promoCodes.form.merchantName"),
      type: "text",
      placeholder: t("promoCodes.form.merchantNamePlaceholder"),
      required: false,
      icon: <Store size={18} />,
      cols: 6,
    },
  ];

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    const loadingToast = toast.loading(t("promoCodes.form.updating"));

    try {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);

      if (end <= start) {
        throw new Error(t("promoCodes.form.dateValidation"));
      }

      const requestData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        discountPercent: Number(data.discountPercent)
      };

      const result = await UpdateMethod("promo-code", requestData, id, lang);

      if (!result) {
        throw new Error(t("promoCodes.form.updateError"));
      }

      toast.dismiss(loadingToast);
      toast.success(t("promoCodes.form.updateSuccess"), { duration: 2000 });

      queryClient.invalidateQueries({ queryKey: ["promoCodes"] });

      setTimeout(() => {
        navigate("/promo-codes");
      }, 1500);

      return result;
    } catch (error: any) {
      console.error("Failed to update promo code:", error);
      toast.dismiss(loadingToast);
      const errorMessage = error?.response?.data?.message || error?.message || t("promoCodes.form.updateError");
      toast.error(errorMessage, { duration: 3000 });
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen !pb-36 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/20 dark:from-slate-900 dark:via-emerald-900/5 dark:to-teal-900/5 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
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
                {t("promoCodes.updateTitle")}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {t("promoCodes.updateSubtitle")}
              </p>
            </div>
          </div>
        </div>

        <CreateForm
          title={t("promoCodes.form.title")}
          description={t("promoCodes.form.description")}
          fields={promoCodeFields}
          defaultValues={initialData}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/promo-codes")}
          submitLabel={t("promoCodes.form.submitUpdate")}
          cancelLabel={t("common.cancel")}
          isLoading={isLoading}
          mode="edit"
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
