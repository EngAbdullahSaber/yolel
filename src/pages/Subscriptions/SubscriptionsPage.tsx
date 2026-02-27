import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  RefreshCw, 
  CreditCard, 
  Share2, 
  Vote, 
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit3,
  X,
  DollarSign
} from "lucide-react";
import { GetPanigationMethod, UpdateMethod } from "../../services/apis/ApiMethod";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useLanguage } from "../../hooks/useLanguage";

interface Subscription {
  id: number;
  type: "VOTES" | "SIMILAR_IMAGE";
  payType: "SHARE_APP" | "ONLINE_PAYMENT";
  price: string | null;
  shareCount: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionsResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: Subscription[];
  totalItems: number;
  totalPages: number;
}

export default function SubscriptionsPage() {
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const lang = i18n.language || "en";
  const queryClient = useQueryClient();

  const [currentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Edit State
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    price: "",
    shareCount: "",
    isActive: true,
  });

  const {
    data: subscriptions = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["subscriptions", currentPage, rowsPerPage, lang],
    queryFn: async () => {
      try {
        const response = (await GetPanigationMethod(
          "app-subscription",
          currentPage,
          rowsPerPage,
          lang,
          ""
        )) as SubscriptionsResponse;
        
        return response.data || [];
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        throw error;
      }
    },
  });

  const handleEditClick = (sub: Subscription) => {
    setEditingSub(sub);
    setFormData({
      price: sub.price || "",
      shareCount: sub.shareCount?.toString() || "",
      isActive: sub.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;

    setIsUpdating(true);
    const loadingToast = toast.loading(t("subscriptions.updating"));

    try {
      const payload: any = {
        isActive: formData.isActive,
      };

      if (editingSub.payType === "ONLINE_PAYMENT") {
        payload.price = parseFloat(formData.price);
      } else {
        payload.shareCount = parseInt(formData.shareCount);
      }

      await UpdateMethod("app-subscription", payload, editingSub.id, lang);
      
      toast.dismiss(loadingToast);
      toast.success(t("subscriptions.updateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      setIsEditModalOpen(false);
      setEditingSub(null);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(t("subscriptions.updateError"));
      console.error("Error updating subscription:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "VOTES":
        return <Vote size={24} className="text-blue-500 group-hover:text-white transition-colors" />;
      case "SIMILAR_IMAGE":
        return <ImageIcon size={24} className="text-purple-500 group-hover:text-white transition-colors" />;
      default:
        return <CreditCard size={24} className="text-slate-500 group-hover:text-white transition-colors" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/10 dark:to-purple-900/10 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-3xl shadow-2xl shadow-blue-500/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <CreditCard size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("subscriptions.title")}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {t("subscriptions.subtitle")}
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

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white/20 animate-pulse h-[400px]">
                <div className="h-16 w-16 bg-slate-200 dark:bg-slate-700 rounded-2xl mb-8"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-3/4 mb-4"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/2 mb-8"></div>
                <div className="h-20 bg-slate-100 dark:bg-slate-700/50 rounded-2xl w-full"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-rose-50 dark:bg-rose-900/10 rounded-[2rem] shadow-xl p-16 text-center border border-rose-100 dark:border-rose-900/30">
            <h3 className="text-xl font-black text-rose-900 dark:text-rose-100 mb-2">{t("common.error")}</h3>
            <p className="text-rose-600 dark:text-rose-400 mb-8">{t("common.messages.noResponse")}</p>
            <button
              onClick={() => refetch()}
              className="px-8 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        )}

        {/* Subscriptions Grid */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
            {subscriptions.length === 0 ? (
              <div className="col-span-full bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl p-20 text-center border border-slate-100 dark:border-slate-700">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-6 bg-slate-100 dark:bg-slate-700/50 rounded-full">
                    <AlertCircle size={48} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-semibold text-xl">
                    {t("subscriptions.noSubscriptionsFound")}
                  </p>
                </div>
              </div>
            ) : (
              subscriptions.map((sub: Subscription) => (
                <div
                  key={sub.id}
                  className="group relative bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col hover:-translate-y-2 ring-0 hover:ring-2 hover:ring-blue-500/20"
                >
                  {/* Decorative Gradient Background */}
                  <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 ${
                    sub.type === 'VOTES' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}></div>
                  
                  <div className="p-8 relative z-10 flex-1 flex flex-col">
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-10">
                      <div className={`p-4 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ${
                        sub.type === 'VOTES' 
                        ? 'bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-600 group-hover:text-white' 
                        : 'bg-purple-50 dark:bg-purple-900/30 group-hover:bg-purple-600 group-hover:text-white'
                      }`}>
                        {getIcon(sub.type)}
                      </div>
                      <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        sub.isActive 
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                      }`}>
                        {sub.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {sub.isActive ? t("subscriptions.active") : t("subscriptions.inactive")}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="space-y-4 mb-10">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {t(`subscriptions.types.${sub.type}`)}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400 font-bold text-sm">
                          {sub.payType === "SHARE_APP" ? <Share2 size={16} className="text-indigo-500" /> : <CreditCard size={16} className="text-emerald-500" />}
                          {t(`subscriptions.payTypes.${sub.payType}`)}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-50 dark:border-slate-700/50">
                        {sub.price ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">${sub.price}</span>
                            <span className="text-slate-400 font-bold text-sm">/ {t("subscriptions.price.currency")}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3">
                             <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500 uppercase tracking-tighter">
                               {t("subscriptions.price.free")}
                             </span>
                             {sub.shareCount && (
                               <div className="flex items-center gap-2 self-start px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-black border border-indigo-100/50 dark:border-indigo-900/30">
                                 <Share2 size={16} />
                                 {sub.shareCount} {t("subscriptions.shares")}
                               </div>
                             )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="mt-auto space-y-6">
                       <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">
                         <span className="bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-md">ID: #{sub.id}</span>
                         <span>{new Date(sub.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}</span>
                       </div>
                       
                       <button 
                        onClick={() => handleEditClick(sub)}
                        className={`w-full py-4 rounded-[1.25rem] font-black transition-all duration-300 shadow-xl transform active:scale-[0.98] relative overflow-hidden group/btn flex items-center justify-center gap-2 ${
                         sub.type === 'VOTES'
                         ? 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700'
                         : 'bg-purple-600 text-white shadow-purple-600/20 hover:bg-purple-700'
                       }`}>
                         <Edit3 size={18} className="relative z-10" />
                         <span className="relative z-10">{t("common.edit")}</span>
                         <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                       </button>
                    </div>
                  </div>

                  {/* Hover Accent Bar */}
                  <div className={`absolute bottom-0 left-0 h-2 w-0 group-hover:w-full transition-all duration-700 ease-out ${
                    sub.type === 'VOTES' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}></div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && editingSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
             <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${
                        editingSub.type === 'VOTES' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {getIcon(editingSub.type)}
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">{t("subscriptions.editTitle")}</h2>
                        <p className="text-sm text-slate-500 font-bold">{t(`subscriptions.types.${editingSub.type}`)} - #{editingSub.id}</p>
                      </div>
                    </div>
                    <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-slate-700 transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleUpdate} className="space-y-6">
                    {editingSub.payType === "ONLINE_PAYMENT" ? (
                      <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t("subscriptions.form.price")}</label>
                        <div className="relative group">
                          <DollarSign className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors`} size={20} />
                          <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className={`w-full ${isRTL ? 'pr-12 pl-6' : 'pl-12 pr-6'} py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl font-bold transition-all outline-none`}
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t("subscriptions.form.shareCount")}</label>
                        <div className="relative group">
                          <Share2 className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors`} size={20} />
                          <input
                            type="number"
                            value={formData.shareCount}
                            onChange={(e) => setFormData({ ...formData, shareCount: e.target.value })}
                            className={`w-full ${isRTL ? 'pr-12 pl-6' : 'pl-12 pr-6'} py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl font-bold transition-all outline-none`}
                            placeholder="0"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        {formData.isActive ? <CheckCircle2 className="text-emerald-500" size={24} /> : <XCircle className="text-rose-500" size={24} />}
                        <span className="font-bold text-slate-700 dark:text-slate-200">{t("subscriptions.form.isActive")}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500 ${
                          formData.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          formData.isActive 
                          ? (isRTL ? '-translate-x-7' : 'translate-x-7') 
                          : (isRTL ? '-translate-x-1' : 'translate-x-1')
                        }`} />
                      </button>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 ${
                          editingSub.type === 'VOTES' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
                        }`}
                      >
                        {isUpdating ? (
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw size={20} className="animate-spin" />
                            {t("common.loading")}
                          </div>
                        ) : t("subscriptions.form.submit")}
                      </button>
                    </div>
                  </form>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
