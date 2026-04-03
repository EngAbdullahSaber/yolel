import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  ShoppingBag,
  Store,
  Mail,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Plus,
  Search,
  Filter,
  Lock,
  Unlock,
} from "lucide-react";
import { DataTable } from "../../components/shared/DataTable";
import { GetPanigationMethod, GetPanigationMethod1, UpdateMethod } from "../../services/apis/ApiMethod";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { toast } from "react-hot-toast";

interface Merchant {
  id: number;
  code: string | null;
  deviceToken: string | null;
  notificationToken: string | null;
  userPoints: number;
  isBlocked: boolean;
  name: string;
  email: string;
  activeStatus: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface MerchantsResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: Merchant[];
  totalItems: number;
  totalPages: number;
}

export default function MerchantsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const blockMutation = useMutation({
    mutationFn: async ({ id, isBlocked }: { id: number; isBlocked: boolean }) => {
      return await UpdateMethod("user/merchant", { isBlocked }, `${id}/block`, lang);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["merchants-list"] });
      toast.success(
        variables.isBlocked
          ? t("merchants.messages.blockSuccess") || "Merchant blocked successfully"
          : t("merchants.messages.unblockSuccess") || "Merchant unblocked successfully"
      );
    },
    onError: (error: any) => {
      console.error("Error toggling merchant block status:", error);
      toast.error(t("common.error") || "An error occurred");
    },
  });

  const { data: response, isLoading, isError, refetch } = useQuery<MerchantsResponse>({
    queryKey: ["merchants-list", currentPage, rowsPerPage, lang, searchTerm, statusFilter],
    queryFn: () => {
      const additionalParams: any = {};
      if (statusFilter === "Blocked") additionalParams.isBlocked = true;
      if (statusFilter === "UnBlocked") additionalParams.isBlocked = false;
      
      return GetPanigationMethod1(
        "user/merchant/all",
        currentPage,
        rowsPerPage,
        lang,
        searchTerm,
        additionalParams
      );
    },
  });

  const merchants = response?.data || [];
  const totalItems = response?.totalItems || 0;

  const columns = [
    {
      key: "id",
      label: "ID",
      width: "80px",
      render: (value: number) => (
        <span className="font-bold text-slate-500">#{value}</span>
      ),
    },
    {
      key: "name",
      label: t("merchants.table.name") || "Store Name",
      render: (value: string, row: Merchant) => (
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Store size={18} />
          </div>
          <div>
            <p className="font-black text-slate-900 dark:text-white leading-tight">{value}</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">{row.role}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: t("merchants.table.email") || "Email",
      render: (value: string) => (
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Mail size={14} className="text-slate-400" />
          <span className="text-sm font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "activeStatus",
      label: t("merchants.table.status") || "Status",
      render: (value: boolean) => (
        <div className="flex justify-center">
          {value ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 text-[10px] font-black rounded-full uppercase border border-emerald-100 dark:border-emerald-800">
              <UserCheck size={12} />
              {t("common.active")}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-500 dark:bg-slate-900/20 dark:text-slate-400 text-[10px] font-black rounded-full uppercase border border-slate-100 dark:border-slate-800">
              <UserX size={12} />
              {t("common.inactive")}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "isBlocked",
      label: t("merchants.table.blocked") || "Blocked",
      render: (value: boolean) => (
        <div className="flex justify-center">
          {value ? (
            <div className="text-rose-500 bg-rose-50 dark:bg-rose-900/20 p-2 rounded-xl border border-rose-100 dark:border-rose-800">
              <ShieldAlert size={18} />
            </div>
          ) : (
            <div className="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-xl border border-emerald-100 dark:border-emerald-800">
              <ShieldCheck size={18} />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: t("common.createdAt"),
      render: (value: string) => (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Calendar size={14} />
          <span className="text-[11px] font-bold">{new Date(value).toLocaleDateString(lang)}</span>
        </div>
      ),
    },
    {
      key: "actions",
      label: t("common.actions"),
      width: "120px",
      render: (_: any, row: Merchant) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => blockMutation.mutate({ id: row.id, isBlocked: !row.isBlocked })}
            disabled={blockMutation.isPending}
            title={row.isBlocked ? t("common.unblock") : t("common.block")}
            className={`p-2.5 rounded-xl transition-all duration-300 transform active:scale-90 ${
              row.isBlocked
                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400"
            }`}
          >
            {row.isBlocked ? <Unlock size={18} /> : <Lock size={18} />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/10 p-8">
      <PageMeta 
        title="Merchant Management | YolelAdmin" 
        description="Monitor and manage system merchants and store accounts"
      />
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-tr from-indigo-600 to-indigo-800 rounded-3xl shadow-2xl shadow-indigo-500/20 transform rotate-3 hover:rotate-0 transition-all duration-300">
              <ShoppingBag size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("merchants.title")}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {t("merchants.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={22} className={isLoading ? "animate-spin" : ""} />
            </button>
            <Link 
              to="/merchants/create"
              className="flex items-center gap-2.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20 transition-all duration-300 active:scale-95"
            >
              <Plus size={20} />
              {t("merchants.page.addMerchant") || "Add Merchant"}
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-[2.5rem] p-3 shadow-2xl shadow-indigo-500/5 border border-slate-200/60 dark:border-slate-700/50 flex flex-col md:flex-row items-center gap-4 transition-all duration-500">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-all duration-300" size={20} />
            <input 
              type="text"
              placeholder={t("merchants.page.searchPlaceholder") || "Search merchants..."}
              className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2rem] text-sm font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400/70 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all duration-300 shadow-sm"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div className="flex items-center gap-2 p-1.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 rounded-[2rem] w-full md:w-auto">
            <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-r border-slate-200 dark:border-slate-700/50 mr-1">
              <Filter size={14} className="text-indigo-500" />
              {t("common.status")}
            </div>
            <div className="flex gap-1 pr-1">
              {["all", "Blocked", "UnBlocked"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`px-5 py-2.5 rounded-[1.25rem] text-[11px] font-black transition-all duration-300 uppercase tracking-wider ${
                    statusFilter === status
                      ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-md border border-slate-200 dark:border-slate-700 scale-100"
                      : "text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-white/50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {status === "all" ? t("common.all") : t(`common.${status.toLowerCase()}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Container */}
        {isLoading ? (
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-[2rem] shadow-xl p-24 text-center border border-white/20">
            <div className="relative inline-block">
                <div className="h-20 w-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                <ShoppingBag className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500" size={32} />
            </div>
            <p className="mt-6 text-slate-600 dark:text-slate-400 font-bold text-lg animate-pulse">
              {t("merchants.fetchingData")}
            </p>
          </div>
        ) : isError ? (
           <div className="bg-rose-50 dark:bg-rose-900/10 rounded-[2rem] shadow-xl p-16 text-center border border-rose-100 dark:border-rose-900/30">
            <ShieldAlert size={48} className="mx-auto text-rose-500 mb-4" />
            <h3 className="text-xl font-black text-rose-900 dark:text-rose-100 mb-2">{t("common.error")}</h3>
            <button onClick={() => refetch()} className="px-8 py-3 bg-rose-600 text-white rounded-xl font-bold mt-4 shadow-lg shadow-rose-600/20">
              {t("common.tryAgain")}
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-700 transition-all duration-500">
            <DataTable
              columns={columns}
              data={merchants}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={setRowsPerPage}
              loading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
