import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Phone, Save, Loader2, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { GetSpecifiedMethod, CreateMethod } from "../../services/apis/ApiMethod";
import { useToast } from "../../hooks/useToast";
import PageMeta from "../../components/common/PageMeta";

interface ContactNumberResponse {
  code: number;
  data: {
    phone: string | null;
  } | string | null;
}

export default function ContactNumberPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const toast = useToast();
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState("");

  const { data: response, isLoading, isError, refetch } = useQuery<ContactNumberResponse>({
    queryKey: ["contact-number", lang],
    queryFn: () => GetSpecifiedMethod("/contact-number", lang),
  });

  useEffect(() => {
    if (response?.data) {
      if (typeof response.data === 'string') {
        setPhone(response.data);
      } else if (typeof response.data === 'object' && response.data.phone) {
        setPhone(response.data.phone);
      }
    }
  }, [response]);

  const mutation = useMutation({
    mutationFn: (data: { phone: string }) => CreateMethod("/contact-number", data, lang),
    onSuccess: () => {
      toast.success(t("contactNumber.updateSuccess") || "Contact number updated successfully");
      queryClient.invalidateQueries({ queryKey: ["contact-number"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message?.[lang === 'ar' ? 'arabic' : 'english'] || t("contactNumber.updateError") || "Failed to update contact number");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error(t("contactNumber.phoneRequired") || "Phone number is required");
      return;
    }
    mutation.mutate({ phone: phone.trim() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 dark:from-slate-900 dark:via-blue-900/5 dark:to-indigo-900/5 p-8">
      <PageMeta 
        title={`${t("sidebar.contactNumber") || "Contact Number"} | YolelAdmin`}
        description="Manage the official contact phone number"
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-3xl shadow-2xl shadow-blue-500/20 transform rotate-3 hover:rotate-0 transition-all duration-500">
              <Phone size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("contactNumber.title") || "Contact Number"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {t("contactNumber.subtitle") || "Update the official support phone number for the platform"}
              </p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2.5 px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
            {t("common.refresh")}
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 shadow-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-400/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="relative inline-block">
                <div className="h-16 w-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                <Phone className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={24} />
              </div>
              <p className="mt-6 text-slate-600 dark:text-slate-400 font-bold text-lg">
                {t("common.loading") || "Loading..."}
              </p>
            </div>
          ) : isError ? (
            <div className="py-16 text-center">
              <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
              <h3 className="text-xl font-black text-rose-900 dark:text-rose-100 mb-2">{t("common.error")}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">{t("common.failedToFetch")}</p>
              <button onClick={() => refetch()} className="px-8 py-3 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all">
                {t("common.tryAgain")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
              <div className="space-y-4">
                <label className="block text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
                  {t("contactNumber.label") || "Phone Number"}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Phone size={20} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 966500969247"
                    className="block w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-slate-900 dark:text-white font-bold text-lg placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                  {phone && phone === (typeof response?.data === 'string' ? response.data : response?.data?.phone) && (
                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black uppercase tracking-tighter">
                        <CheckCircle2 size={12} />
                        Current
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-slate-500 text-sm font-medium pl-2">
                  {t("contactNumber.hint") || "Please enter the phone number with country code, e.g. 966..."}
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={mutation.isPending || !phone.trim() || phone === (typeof response?.data === 'string' ? response.data : response?.data?.phone)}
                  className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {t("common.saving") || "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {t("contactNumber.submit") || "Save Changes"}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl p-6 border border-indigo-100/50 dark:border-indigo-900/20 flex gap-4">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl h-fit">
            <AlertCircle size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">Note</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              This contact number will be displayed in the mobile app's "Contact Us" or "Support" sections. Make sure to provide a valid, active number including the international prefix for Saudi Arabia (966).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
