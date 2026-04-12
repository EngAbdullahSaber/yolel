import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  RefreshCw, 
  Tag, 
  Calendar, 
  CalendarOff,
  Store,
  Percent,
  Copy,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  Pencil
} from "lucide-react";
import { Link } from "react-router-dom";
import { GetPanigationMethod, DeleteMethod } from "../../services/apis/ApiMethod";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { DeleteDialog } from "../../components/shared/DeleteDialog";
import { Pagination } from "../../components/shared/Pagination";
import { getUserData } from "../../services/utils";

interface PromoCode {
  id: number;
  code: string;
  startDate: string;
  endDate: string;
  discountPrice: string | number;
  discountPercentage?: number;
  offerId?: string | null;
  maxUsageLimit: number;
  type: string;
  merchant?: {
    id: number;
    name: string;
    email: string;
  };
  subscription?: {
    id: number;
    type: string;
    payType: string;
    price: string | null;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    usages: number;
  };
}

interface PromoCodesResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: PromoCode[];
  totalItems: number;
  totalPages: number;
}

export default function PromoCodesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(9); // Changed to 9 to match 3x3 grid nicely
  
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(null);

  const user = getUserData();
  const isMerchant = user?.role?.toUpperCase() === "MERCHANT";
  const merchantId = user?.id; // Standardized to use user.id

  const {
    data: promoCodesData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["promoCodes", currentPage, rowsPerPage, lang, isMerchant, merchantId],
    queryFn: async () => {
      try {
        const additionalParams: any = {};
        if (isMerchant && merchantId) {
          additionalParams.merchantId = merchantId;
        }

        const response = (await GetPanigationMethod(
          "promo-code",
          currentPage,
          rowsPerPage,
          lang,
          "",
          additionalParams
        )) as PromoCodesResponse;
        
        return response;
      } catch (error) {
        console.error("Error fetching promo codes:", error);
        throw error;
      }
    },
  });

  const promoCodes = promoCodesData?.data || [];
  const totalPages = promoCodesData?.totalPages || 0;
  const totalItems = promoCodesData?.totalItems || 0;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(t("promoCodes.copySuccess"));
  };

  const handleDeleteClick = (promo: PromoCode) => {
    setSelectedPromoCode(promo);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPromoCode) return;
    
    setIsDeleting(true);
    try {
      const result = await DeleteMethod("promo-code", selectedPromoCode.id, lang);
      if (result) {
        toast.success(t("promoCodes.deleteSuccess"));
        queryClient.invalidateQueries({ queryKey: ["promoCodes"] });
        setIsDeleteDialogOpen(false);
      } else {
        toast.error(t("promoCodes.deleteError"));
      }
    } catch (error) {
      console.error("Error deleting promo code:", error);
      toast.error(t("promoCodes.deleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return "upcoming";
    if (now > end) return "expired";
    return "active";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/20 dark:from-slate-900 dark:via-emerald-900/5 dark:to-teal-900/5 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-tr from-emerald-600 to-teal-700 rounded-3xl shadow-2xl shadow-emerald-500/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Tag size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("promoCodes.title")}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {t("promoCodes.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isMerchant && (
              <Link
                to="/promo-codes/create"
                className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all duration-300 active:scale-95"
              >
                <Plus size={20} />
                {t("common.create")}
              </Link>
            )}

            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-2.5 px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
              {t("common.refresh")}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white/20 animate-pulse h-[350px]">
                <div className="flex justify-between mb-8">
                  <div className="h-12 w-32 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                  <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-3/4 mb-4"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/2 mb-8"></div>
                <div className="h-16 bg-slate-100 dark:bg-slate-700/50 rounded-2xl w-full"></div>
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

        {/* Promo Codes Grid */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
            {promoCodes.length === 0 ? (
              <div className="col-span-full bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl p-20 text-center border border-slate-100 dark:border-slate-700">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-6 bg-slate-100 dark:bg-slate-700/50 rounded-full">
                    <AlertCircle size={48} className="text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-semibold text-xl">
                    {t("promoCodes.noPromoCodesFound")}
                  </p>
                </div>
              </div>
            ) : (
              promoCodes.map((promo: PromoCode) => {
                const status = getStatus(promo.startDate, promo.endDate);
                return (
                  <div
                    key={promo.id}
                    className="group relative bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col hover:-translate-y-2"
                  >
                    {/* Status Badge */}
                    <div className={`absolute top-6 ${lang=="en"?"right-6":"left-6"} z-10`}>
                       <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                         status === 'active' 
                         ? 'bg-emerald-500 text-white' 
                         : status === 'upcoming'
                         ? 'bg-blue-500 text-white'
                         : 'bg-slate-400 text-white'
                       }`}>
                         {status === 'active' ? <CheckCircle2 size={12} /> : status === 'upcoming' ? <Clock size={12} /> : <CalendarOff size={12} />}
                         {t(`promoCodes.${status}`)}
                       </span>
                    </div>

                    <div className="p-8 relative z-10 flex-1 flex flex-col">
                      {/* Merchant & Discount */}
                      <div className="flex items-start gap-4 mb-8">
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform">
                          <Store size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                            {promo.merchant?.name || t("common.system")}
                          </h3>
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black">
                            <Tag size={18} />
                            <span className="text-2xl">
                              {promo.discountPercentage 
                                ? `${promo.discountPercentage}% OFF` 
                                : `$${promo.discountPrice} OFF`}
                            </span>
                          </div>
                          {promo.subscription && (
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
                              {t(`subscriptions.types.${promo.subscription.type}`)} - {t(`subscriptions.payTypes.${promo.subscription.payType}`)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* The Code */}
                      <div className="relative mb-8 group/code">
                        <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-2xl border-2 border-dashed border-emerald-500/30 group-hover/code:border-emerald-500 transition-colors"></div>
                        <div className="relative p-6 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-2xl font-mono font-black tracking-widest text-slate-900 dark:text-white">{promo.code}</span>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleCopyCode(promo.code)}
                              className="p-2.5 bg-white dark:bg-slate-700 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-90"
                            >
                              <Copy size={20} />
                            </button>
                            {!isMerchant && (
                              <>
                                <Link 
                                  to={`/promo-codes/edit/${promo.id}`}
                                  className="p-2.5 bg-white dark:bg-slate-700 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-90"
                                >
                                  <Pencil size={20} />
                                </Link>
                                <button 
                                  onClick={() => handleDeleteClick(promo)}
                                  className="p-2.5 bg-white dark:bg-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-90"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Validity Period */}
                      <div className="mt-auto space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">{t("promoCodes.table.startDate")}</p>
                            <div className="flex items-center gap-2 font-bold text-sm text-slate-700 dark:text-slate-300">
                              <Calendar size={14} className="text-emerald-500" />
                              {formatDate(promo.startDate)}
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">{t("promoCodes.table.endDate")}</p>
                            <div className="flex items-center gap-2 font-bold text-sm text-slate-700 dark:text-slate-300">
                              <Calendar size={14} className="text-rose-500" />
                              {formatDate(promo.endDate)}
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
                           <div className="flex items-center justify-between gap-4">
                               <div className="flex items-center gap-3">
                                   <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800/50">
                                       <Clock size={12} className="text-blue-500" />
                                       {t(`promoCodes.types.${promo.type}`)}
                                   </div>
                                   <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-black uppercase bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800/50">
                                       <Tag size={12} className="text-emerald-500" />
                                       <span>{t("promoCodes.table.usages")}: {promo._count?.usages || 0}</span>
                                   </div>
                               </div>
                               {!isMerchant && (
                                 <Link 
                                   to={`/promo-codes/edit/${promo.id}`}
                                   className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-black uppercase hover:underline"
                                 >
                                   {t("common.edit")}
                                   <ExternalLink size={12} />
                                 </Link>
                               )}
                           </div>

                           {promo.offerId && (
                             <div className="flex items-center gap-2.5 p-2.5 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100/50 dark:border-blue-900/30 rounded-xl overflow-hidden group/id">
                               <Tag size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                               <span className="text-[10px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest truncate" title={promo.offerId}>
                                 ID: {promo.offerId}
                               </span>
                             </div>
                           )}
                        </div>
                      </div>
                    </div>

                    {/* Decorative Bottom Bar */}
                    <div className={`h-1.5 w-full transition-all duration-700 ${
                       status === 'active' ? 'bg-emerald-500' : status === 'upcoming' ? 'bg-blue-500' : 'bg-slate-300'
                    }`}></div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && promoCodes.length > 0 && (
          <div className="mt-8 pb-10">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              rowsPerPage={rowsPerPage}
              loading={isLoading}
            />
          </div>
        )}
      </div>

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("promoCodes.deleteTitle")}
        description={t("promoCodes.deleteDescription")}
        itemName={selectedPromoCode?.code}
        isLoading={isDeleting}
      />
    </div>
  );
}
