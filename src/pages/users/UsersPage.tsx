import { useState, useEffect } from "react";
import {
  RefreshCw,
  User as UserIcon,
  ShieldAlert,
  ShieldCheck,
  Award,
  Calendar,
  Smartphone,
  UserCheck,
  UserX,
  Search,
  Filter,
  Image as FiImage,
  Lock,
  Unlock,
} from "lucide-react";
import { DataTable } from "../../components/shared/DataTable";
import { TableFilters } from "../../components/shared/TableFilters";
import { GetPanigationMethod, GetPanigationMethodWithFilter, UpdateMethod } from "../../services/apis/ApiMethod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../hooks/useToast";
import { useTranslation } from "react-i18next";

interface User {
  id: number;
  code: string | null;
  deviceToken: string;
  notificationToken: string;
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

export default function UsersPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const toast = useToast();
  const queryClient = useQueryClient();

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



  const fetchUsers = async ({
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
      const additionalParams: any = {};
       additionalParams.role = "USER";
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

      const users = response.data || [];
      const totalItems = response.totalItems || 0;
      const totalPages = response.totalPages || 0;

      return {
        data: users,
        total: totalItems,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
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
    data: usersResponse = {
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
    queryKey: ["users-list", currentPage, rowsPerPage, debouncedSearchTerm, statusFilter],
    queryFn: () =>
      fetchUsers({
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
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
      toast.success(
        variables.isBlocked
          ? t("users.messages.blockSuccess")
          : t("users.messages.unblockSuccess")
      );
    },
    onError: () => {
      toast.error(t("common.error"));
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
        <div className="font-medium text-slate-500 text-xs">
          {value || t("common.na")}
        </div>
      ),
    },
    {
      key: "role",
      label: t("users.table.role"),
      width: "120px",
      render: (value: string) => (
        <div className="flex justify-center">
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                value === 'ADMIN' 
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' 
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
                {value}
            </span>
        </div>
      )
    },
    {
      key: "userPoints",
      label: t("users.table.userPoints"),
      width: "120px",
      render: (value: number) => (
        <div className="flex items-center justify-center gap-1.5 font-black text-amber-600 dark:text-amber-400">
           <Award size={16} />
           {value.toLocaleString()}
        </div>
      ),
    },
    {
      key: "activeStatus",
      label: t("users.table.activeStatus"),
      width: "100px",
      render: (value: boolean) => (
        <div className="flex justify-center">
           {value ? (
             <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase">
               <UserCheck size={16} />
               {t("common.active")}
             </div>
           ) : (
             <div className="flex items-center gap-1 text-slate-400 font-bold text-xs uppercase">
               <UserX size={16} />
               {t("common.inactive")}
             </div>
           )}
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
            <div className="flex items-center gap-1 text-rose-600 animate-pulse">
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
      key: "deviceToken",
      label: t("users.table.deviceToken"),
      render: (value: string) => (
        <div className="flex items-center gap-2 group cursor-help">
          <Smartphone size={14} className="text-slate-400" />
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate max-w-[150px]" title={value}>
            {value ? `${value.substring(0, 12)}...` : t("common.na")}
          </span>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: t("common.createdAt"),
      width: "180px",
      render: (value: string) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-white">
            <Calendar size={14} className="text-blue-500" />
            {new Date(value).toLocaleDateString(lang)}
          </div>
          <span className="text-[10px] text-slate-500 ml-5">
            {new Date(value).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
          </span>
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
                  {t("dashboard.periods.lastDay").split(' ')[0]}
                </span>
                <span className={`text-xs font-bold ${value?.lastDay > 0 ? "text-blue-600 dark:text-blue-400" : "text-slate-300"}`}>
                  {value?.lastDay || 0}
                </span>
             </div>
             
             {/* Week */}
             <div className="flex flex-col items-center border-x border-slate-100 dark:border-slate-700 px-3">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                  {t("dashboard.periods.lastWeek").split(' ')[0]}
                </span>
                <span className={`text-xs font-bold ${value?.lastWeek > 0 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-300"}`}>
                  {value?.lastWeek || 0}
                </span>
             </div>

             {/* Month */}
             <div className="flex flex-col items-center">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">
                  {t("dashboard.periods.lastMonth").split(' ')[0]}
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
      key: "actions",
      label: t("common.actions"),
      width: "100px",
      render: (_: any, row: User) => (
        <div className="flex justify-center">
            <button
                onClick={() => blockMutation.mutate({ id: row.id, isBlocked: !row.isBlocked })}
                className={`p-2 rounded-xl transition-all ${
                    row.isBlocked 
                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                    : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                }`}
            >
                {row.isBlocked ?  <Lock size={16} /> : <Unlock size={16} />}
            </button>
        </div>
      )
    }
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
    setStatusFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/10 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-3xl shadow-2xl shadow-blue-500/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <UserIcon size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("users.title")}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {t("users.subtitle")}
              </p>
            </div>
          </div>

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
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-3 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder={t("common.searchPlaceholder") || "Search users..."}
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
                <div className="h-20 w-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                <UserIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={32} />
            </div>
            <p className="mt-6 text-slate-600 dark:text-slate-400 font-bold text-lg animate-pulse">
              {t("users.fetchingData")}
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
              data={usersResponse.data}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              totalItems={usersResponse.total}
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

 
