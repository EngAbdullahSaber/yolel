import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  User as UserIcon,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Search,
  Plus,
  Lock,
  Unlock,
  Filter,
  Image as FiImage,
} from "lucide-react";
import { DataTable } from "../../components/shared/DataTable";
import { TableFilters } from "../../components/shared/TableFilters";
import { GetPanigationMethodWithFilter, UpdateMethod } from "../../services/apis/ApiMethod";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks/useToast";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  code: string | null;
  deviceToken: string | null;
  notificationToken: string | null;
  userPoints: number;
  isBlocked: boolean;
  name: string | null;
  email: string | null;
  activeStatus: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  deletedImages?: {
    total: number;
    lastMonth: number;
    lastWeek: number;
    lastDay: number;
  };
}

interface UsersResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: User[];
  totalItems: number;
  totalPages: number;
}

export default function SubAdminsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchSubAdmins = async ({
    page,
    pageSize,
    search,
    status,
  }: {
    page: number;
    pageSize: number;
    search: string;
    status: string;
  }): Promise<{
    data: User[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const additionalParams: any = { role: "SUB_ADMIN" };
      if (status === "Blocked") additionalParams.isBlocked = true;
      if (status === "UnBlocked") additionalParams.isBlocked = false;

      const response = (await GetPanigationMethodWithFilter(
        "user",
        page,
        pageSize,
        lang,
        search,
        additionalParams
      )) as UsersResponse;

      const subadmins = response.data || [];
      const totalItems = response.totalItems || 0;
      const totalPages = response.totalPages || 0;

      return {
        data: subadmins,
        total: totalItems,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
      };
    } catch (error) {
      console.error("Error fetching subadmins:", error);
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
    data: subadminsResponse = {
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
    queryKey: ["subadmins-list", currentPage, rowsPerPage, debouncedSearchTerm, statusFilter],
    queryFn: () =>
      fetchSubAdmins({
        page: currentPage,
        pageSize: rowsPerPage,
        search: debouncedSearchTerm,
        status: statusFilter,
      }),
  });

  const blockMutation = useMutation({
    mutationFn: async ({ id, isBlocked }: { id: number; isBlocked: boolean }) => {
      return await UpdateMethod("user/admin", { isBlocked }, `${id}/block`, lang);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subadmins-list"] });
      toast.success(
        variables.isBlocked
          ? t("subAdmins.messages.blockSuccess")
          : t("subAdmins.messages.unblockSuccess")
      );
    },
    onError: (_, variables) => {
      toast.error(
        variables.isBlocked
          ? t("subAdmins.messages.blockError")
          : t("subAdmins.messages.unblockError")
      );
    },
  });

  const columns = [
    {
      key: "id",
      label: t("common.id"),
      width: "80px",
      render: (value: number) => (
        <div className="font-bold text-slate-700 dark:text-slate-300">
          #{value}
        </div>
      ),
    },
    {
      key: "name",
      label: t("common.name"),
      render: (value: string) => (
        <div className="font-bold text-slate-900 dark:text-white">
          {value || t("common.na")}
        </div>
      ),
    },
    {
      key: "email",
      label: t("common.email"),
      render: (value: string) => (
        <div className="font-medium text-slate-600 dark:text-slate-400">
          {value || t("common.na")}
        </div>
      ),
    },
    {
      key: "activeStatus",
      label: t("users.table.activeStatus"),
      width: "120px",
      render: (value: boolean) => (
        <div className="flex justify-center">
           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                value 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
                {value ? t("common.active") : t("common.inactive")}
            </span>
        </div>
      ),
    },
    {
      key: "isBlocked",
      label: t("users.table.isBlocked"),
      width: "100px",
      render: (value: boolean) => (
        <div className="flex justify-center">
          {value ? (
            <div className="flex items-center gap-1 text-rose-600">
                <ShieldAlert size={18} />
                <span className="text-[10px] font-black uppercase">{t("common.yes")}</span>
            </div>
          ) : (
            <div className="text-emerald-500">
                <ShieldCheck size={18} />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "deletedImages",
      label: t("sidebar.deletedImages"),
      width: "220px",
      render: (value: any) => (
        <div className="flex flex-col gap-2">
          {/* Total Counter */}
          <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-900/20 rounded-lg w-fit mx-auto border border-rose-100 dark:border-rose-800/50">
            <FiImage size={14} className="text-rose-600 dark:text-rose-400" />
            <span className="text-sm font-black text-rose-700 dark:text-rose-300">
              {value?.total || 0}
            </span>
          </div>

          {/* Periods Grid */}
          <div className="flex items-center justify-center gap-3">
             {/* Day */}
             <div className="flex flex-col items-center">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                  {t("dashboard.periods.lastDay")}
                </span>
                <span className={`text-xs font-bold ${value?.lastDay > 0 ? "text-blue-600 dark:text-blue-400" : "text-slate-300"}`}>
                  {value?.lastDay || 0}
                </span>
             </div>
             
             {/* Week */}
             <div className="flex flex-col items-center border-x border-slate-100 dark:border-slate-700 px-3">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                  {t("dashboard.periods.lastWeek")}
                </span>
                <span className={`text-xs font-bold ${value?.lastWeek > 0 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-300"}`}>
                  {value?.lastWeek || 0}
                </span>
             </div>

             {/* Month */}
             <div className="flex flex-col items-center">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                  {t("dashboard.periods.lastMonth")}
                </span>
                <span className={`text-xs font-bold ${value?.lastMonth > 0 ? "text-purple-600 dark:text-purple-400" : "text-slate-300"}`}>
                  {value?.lastMonth || 0}
                </span>
             </div>
          </div>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: t("common.createdAt"),
      width: "150px",
      render: (value: string) => (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
            <Calendar size={14} className="text-blue-500" />
            {new Date(value).toLocaleDateString(lang)}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      label: t("common.actions"),
      width: "160px",
      render: (_: any, row: User) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => blockMutation.mutate({ id: row.id, isBlocked: !row.isBlocked })}
            title={row.isBlocked ? t("common.unblock") : t("common.block")}
            className={`p-2 rounded-xl transition-all duration-300 ${
              row.isBlocked
                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400"
            }`}
          >
            {row.isBlocked ?  <Lock size={18} /> : <Unlock size={18} />}
          </button>
        </div>
      ),
    },
  ];

  const handleRefresh = () => {
    refetch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/10 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-tr from-purple-600 to-blue-700 rounded-3xl shadow-2xl shadow-purple-500/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <UserIcon size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("subAdmins.title")}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {t("subAdmins.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2.5 px-6 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw
                size={20}
                className={isLoading ? "animate-spin" : ""}
              />
              {t("common.refresh")}
            </button>

            <button
              onClick={() => navigate("/subadmins/create")}
              className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/25 transition-all duration-300 active:scale-95"
            >
              <Plus size={20} />
              {t("subAdmins.addSubAdmin")}
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-3 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder={t("common.searchPlaceholder") || "Search..."}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl w-full md:w-auto">
            <div className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Filter size={14} />
              {t("common.status")}
            </div>
            <div className="flex gap-1">
              {["all", "Blocked", "UnBlocked"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 ${
                    statusFilter === status
                      ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm border border-slate-100 dark:border-slate-700"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {status === "all" ? t("common.all") : t(`common.${status.toLowerCase()}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-[2rem] shadow-xl p-24 text-center border border-white/20">
            <div className="relative inline-block">
                <div className="h-20 w-20 rounded-full border-4 border-blue-500/20 border-t-purple-500 animate-spin"></div>
                <UserIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-500" size={32} />
            </div>
            <p className="mt-6 text-slate-600 dark:text-slate-400 font-bold text-lg animate-pulse">
              {t("subAdmins.fetchingData")}
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
                onClick={handleRefresh}
                className="px-8 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
            >
                {t("common.tryAgain")}
            </button>
          </div>
        )}

        {/* Table Container */}
        {!isLoading && !isError && (
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-700 transition-all duration-500">
            <DataTable
              columns={columns}
              data={subadminsResponse.data}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={subadminsResponse.total}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              loading={isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
