import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  Scale,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  Mail,
  Calendar,
  Eye,
  Trash2,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { GetPanigationMethod } from "../../services/apis/ApiMethod";
import { api } from "../../services/axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { ConfirmationDialog } from "../../components/shared/ConfirmationDialog";

interface AppealUser {
  id: number;
  email: string;
}

interface Appeal {
  id: number;
  url: string;
  age: string;
  gender: string;
  deletedAt: string;
  appealedAt: string;
  appealStatus: string;
  user: AppealUser;
  deletedByUser: AppealUser;
}

interface AppealsResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: Appeal[];
  totalItems: number;
  totalPages: number;
}

export default function AppealsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);

  // Status Dialog States
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"APPROVE" | "REJECT" | null>(null);
  const [appealToHandle, setAppealToHandle] = useState<Appeal | null>(null);

  const fetchAppeals = async ({
    page,
    pageSize,
  }: {
    page: number;
    pageSize: number;
  }): Promise<{
    data: Appeal[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const response = (await GetPanigationMethod(
        "/image/admin/appeals",
        page,
        pageSize,
        lang,
        ""
      )) as AppealsResponse;

      const items = response.data || [];
      const totalItems = response.totalItems || 0;
      const totalPages = response.totalPages || 0;

      return {
        data: items,
        total: totalItems,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
      };
    } catch (error) {
      console.error("Error fetching appeals:", error);
      return {
        data: [],
        total: 0,
        page: page,
        pageSize: pageSize,
        totalPages: 0,
      };
    }
  };

  const {
    data: appealsResponse = {
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    },
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["appeals", currentPage, rowsPerPage],
    queryFn: () =>
      fetchAppeals({
        page: currentPage,
        pageSize: rowsPerPage,
      }),
  });

  const handleActionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: "approve" | "reject" }) => {
      const response = await api.patch(`/image/admin/${id}/${action}-appeal`, {}, {
        headers: { lang }
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      toast.success(t(`appeals.actions.${variables.action}Success`));
      queryClient.invalidateQueries({ queryKey: ["appeals"] });
      setIsConfirmOpen(false);
      setAppealToHandle(null);
      setConfirmAction(null);
      if (selectedAppeal?.id === variables.id) {
        setSelectedAppeal(null);
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message?.[lang === "ar" ? "arabic" : "english"] || error.message || t("common.error"));
    }
  });

  const handleActionClick = (appeal: Appeal, action: "APPROVE" | "REJECT") => {
    setAppealToHandle(appeal);
    setConfirmAction(action);
    setIsConfirmOpen(true);
  };

  const confirmHandleAction = () => {
    if (!appealToHandle || !confirmAction) return;
    handleActionMutation.mutate({
      id: appealToHandle.id,
      action: confirmAction === "APPROVE" ? "approve" : "reject"
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-amber-500/10";
      case "APPROVED":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-emerald-500/10";
      case "REJECTED":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 shadow-rose-500/10";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 shadow-slate-500/10";
    }
  };

  const getStatusDot = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING": return "bg-amber-500";
      case "APPROVED": return "bg-emerald-500";
      case "REJECTED": return "bg-rose-500";
      default: return "bg-slate-500";
    }
  };

  const getAgeLabel = (age: string) => {
    return t(`adminImages.age.${age}`) || age;
  };

  const getGenderLabel = (gender: string) => {
    return t(`adminImages.gender.${gender}`) || gender;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/10 dark:to-purple-900/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-tr from-indigo-600 to-purple-700 rounded-3xl shadow-2xl shadow-indigo-500/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Scale size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("appeals.title") || "Appeals"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {t("appeals.subtitle") || "Manage and review user appeals"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-[2rem] shadow-xl p-24 text-center border border-white/20">
            <div className="relative inline-block">
              <div className="h-20 w-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
              <Scale className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500" size={32} />
            </div>
            <p className="mt-6 text-slate-600 dark:text-slate-400 font-bold text-lg animate-pulse">
              {t("appeals.fetchingData") || "Fetching appeals data..."}
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-rose-50 dark:bg-rose-900/10 rounded-[2rem] shadow-xl p-16 text-center border border-rose-100 dark:border-rose-900/30">
            <div className="inline-flex p-4 bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-full mb-4">
              <ShieldAlert size={48} />
            </div>
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

        {/* Appeals Cards Grid */}
        {!isLoading && !isError && (
          <>
            {appealsResponse.data.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl p-20 text-center border border-slate-100 dark:border-slate-700">
                <div className="inline-flex p-5 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
                  <Scale size={40} className="text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-semibold text-lg">
                  {t("appeals.noAppealsFound") || "No appeals found"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {appealsResponse.data.map((appeal) => (
                  <div
                    key={appeal.id}
                    className="group bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 overflow-hidden border border-slate-100 dark:border-slate-700"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={import.meta.env.VITE_IMAGE_BASE_URL + appeal.url}
                        alt={`Appeal #${appeal.id}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      
                      {/* ID and Status */}
                      <div className="absolute top-5 left-5 right-5 flex justify-between items-start">
                        <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-black tracking-widest uppercase">
                          ID: #{appeal.id}
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-xs  font-black shadow-lg border ${getStatusColor(appeal.appealStatus)}`}>
                          {t(`appeals.status.${appeal.appealStatus}`) || appeal.appealStatus}
                        </div>
                      </div>

                      {/* Bio Info Overlay */}
                      <div className="absolute bottom-5 left-5 flex gap-2">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded-lg capitalize border border-white/10">
                          {getAgeLabel(appeal.age)}
                        </span>
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold rounded-lg capitalize border border-white/10">
                          {getGenderLabel(appeal.gender)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                      {/* User Info */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                            <User size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {t("appeals.table.user") || "User"}
                            </p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                              {appeal.user.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl">
                            <ShieldAlert size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {t("appeals.table.deletedBy") || "Deleted By"}
                            </p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">
                              {appeal.deletedByUser.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="pt-6 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Calendar size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              {t("appeals.table.deletedAt") || "Deleted At"}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                            {formatDate(appeal.deletedAt)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-indigo-500">
                            <Clock size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              {t("appeals.table.appealedAt") || "Appealed At"}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                            {formatDate(appeal.appealedAt)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2.5">
                        <button 
                          onClick={() => setSelectedAppeal(appeal)}
                          className="w-full py-3.5 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all"
                        >
                          <Eye size={18} />
                          {t("common.view") || "View Details"}
                        </button>
                        
                        {appeal.appealStatus === "PENDING" && (
                          <div className="flex gap-2.5">
                             <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleActionClick(appeal, "APPROVE");
                                }}
                                className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20"
                             >
                                <Check size={18} />
                                {t("appeals.actions.approve") || "Approve"}
                             </button>
                             <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleActionClick(appeal, "REJECT");
                                }}
                                className="flex-1 py-3.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-rose-500/20"
                             >
                                <X size={18} />
                                {t("appeals.actions.reject") || "Reject"}
                             </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {appealsResponse.totalPages > 1 && (
              <div className="mt-12 flex flex-col md:flex-row items-center justify-between bg-white dark:bg-slate-800 rounded-[2rem] px-8 py-6 shadow-xl border border-slate-100 dark:border-slate-700 gap-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {t("common.page")} <span className="font-black text-slate-900 dark:text-white">{currentPage}</span>{" "}
                  {t("common.of")} <span className="font-black text-slate-900 dark:text-white">{appealsResponse.totalPages}</span>
                  {" · "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {appealsResponse.total} {t("appeals.totalItems") || "Appeals"}
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                       setCurrentPage((p: number) => Math.max(1, p - 1));
                       window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {Array.from({ length: appealsResponse.totalPages }, (_, i) => i + 1)
                    .filter(
                      (p: number) =>
                        p === 1 ||
                        p === appealsResponse.totalPages ||
                        Math.abs(p - currentPage) <= 1
                    )
                    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && (arr[idx - 1] as number) + 1 < (p as number)) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-slate-400 font-black">
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => {
                            setCurrentPage(item as number);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-11 h-11 rounded-2xl text-sm font-black transition-all ${
                            currentPage === item
                              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-110"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

                  <button
                    onClick={() => {
                        setCurrentPage((p: number) => Math.min(appealsResponse.totalPages, p + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === appealsResponse.totalPages}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAppeal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedAppeal(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative aspect-video">
               <img src={import.meta.env.VITE_IMAGE_BASE_URL + selectedAppeal.url} className="w-full h-full object-cover" alt="" />
               <button 
                  onClick={() => setSelectedAppeal(null)}
                  className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all"
               >
                  <XCircle size={24} />
               </button>
            </div>
            
            <div className="p-8 space-y-8 overflow-y-auto">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                           {t("appeals.details.title") || "Appeal Details"}
                        </h2>
                        <p className="text-slate-500 font-bold mt-1 tracking-wide">ID: #{selectedAppeal.id}</p>
                    </div>
                    <div className={`flex items-center gap-2.5 px-6 py-2 rounded-full text-xs font-black border backdrop-blur-md shadow-lg ${getStatusColor(selectedAppeal.appealStatus)}`}>
                        <span className={`w-2 h-2 rounded-full ${getStatusDot(selectedAppeal.appealStatus)} ${selectedAppeal.appealStatus.toUpperCase() === 'PENDING' ? 'animate-pulse' : ''}`} />
                        {t(`appeals.status.${selectedAppeal.appealStatus}`) || selectedAppeal.appealStatus}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700 space-y-4">
                        <div className="flex items-center gap-3">
                             <User className="text-indigo-500" size={20} />
                             <span className="font-bold text-slate-900 dark:text-white">{t("appeals.table.user") || "User"}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 break-all">{selectedAppeal.user.email}</p>
                        <p className="text-xs text-slate-400">ID: {selectedAppeal.user.id}</p>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700 space-y-4">
                        <div className="flex items-center gap-3">
                             <ShieldAlert className="text-rose-500" size={20} />
                             <span className="font-bold text-slate-900 dark:text-white">{t("appeals.table.deletedBy") || "Deleted By"}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 break-all">{selectedAppeal.deletedByUser.email}</p>
                        <p className="text-xs text-slate-400">ID: {selectedAppeal.deletedByUser.id}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[140px] p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20 text-center">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{t("adminImages.table.age") || "Age"}</p>
                        <p className="text-sm font-black text-blue-700 dark:text-blue-300 capitalize">{getAgeLabel(selectedAppeal.age)}</p>
                    </div>
                    <div className="flex-1 min-w-[140px] p-4 bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl border border-purple-100/50 dark:border-purple-900/20 text-center">
                        <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">{t("adminImages.table.gender") || "Gender"}</p>
                        <p className="text-sm font-black text-purple-700 dark:text-purple-300 capitalize">{getGenderLabel(selectedAppeal.gender)}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                    <button 
                        onClick={() => setSelectedAppeal(null)}
                        className="flex-1 min-w-[120px] py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white rounded-[1.5rem] font-bold hover:bg-slate-200 transition-all"
                    >
                        {t("common.close")}
                    </button>
                    
                    {selectedAppeal.appealStatus === "PENDING" && (
                      <>
                        <button 
                            onClick={() => handleActionClick(selectedAppeal, "APPROVE")}
                            className="flex-1 min-w-[120px] py-4 bg-emerald-500 text-white rounded-[1.5rem] font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                        >
                            <Check size={20} />
                            {t("appeals.actions.approve")}
                        </button>
                        <button 
                            onClick={() => handleActionClick(selectedAppeal, "REJECT")}
                            className="flex-1 min-w-[120px] py-4 bg-rose-500 text-white rounded-[1.5rem] font-bold hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
                        >
                            <X size={20} />
                            {t("appeals.actions.reject")}
                        </button>
                      </>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setAppealToHandle(null);
          setConfirmAction(null);
        }}
        onConfirm={confirmHandleAction}
        title={confirmAction === "APPROVE" ? t("appeals.confirm.approveTitle") : t("appeals.confirm.rejectTitle")}
        description={confirmAction === "APPROVE" ? t("appeals.confirm.approveDescription") : t("appeals.confirm.rejectDescription")}
        type={confirmAction === "APPROVE" ? "success" : "danger"}
        confirmText={confirmAction === "APPROVE" ? t("appeals.actions.approve") : t("appeals.actions.reject")}
        isLoading={handleActionMutation.isPending}
      />
    </div>
  );
}
