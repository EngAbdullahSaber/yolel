import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { DataTable } from "../../components/shared/DataTable";
import { TableFilters } from "../../components/shared/TableFilters";
import { GetPanigationMethod, GetPanigationMethodWithFilter } from "../../services/apis/ApiMethod";
import { useTranslation } from "react-i18next";

interface User {
  id: number;
  code: string | null;
  deviceToken: string;
  notificationToken: string;
  userPoints: number;
  isBlocked: boolean;
  email: string | null;
  activeStatus: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);



  const fetchUsers = async ({
    page,
    pageSize,
    status,
  }: {
    page: number;
    pageSize: number;
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
      if (status === "Blocked") additionalParams.isBlocked = false;
      if (status === "UnBlocked") additionalParams.isBlocked = true;

      const response = (await GetPanigationMethodWithFilter(
        "user",
        page,
        pageSize,
        lang,
        "",
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
    queryKey: ["users-list", currentPage, rowsPerPage, statusFilter],
    queryFn: () =>
      fetchUsers({
        page: currentPage,
        pageSize: rowsPerPage,
        status: statusFilter,
      }),
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
        key: "updatedAt",
        label: t("common.updatedAt"),
        width: "180px",
        render: (value: string) => (
          <div className="flex flex-col opacity-75">
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
              <RefreshCw size={12} className="text-slate-400" />
              {new Date(value).toLocaleDateString(lang)}
            </div>
            <span className="text-[10px] text-slate-500 ml-4.5">
              {new Date(value).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' })}
            </span>
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

        <TableFilters
          searchTerm=""
          onSearchChange={() => {}}
          statusFilter={statusFilter}
          onStatusFilter={(val) => {
            setStatusFilter(val);
            setCurrentPage(1);
          }}
          showFilters={showFilters}
          onShowFiltersChange={setShowFilters}
          onClearFilters={clearFilters}
          searchPlaceholder=""
          filterOptions={["all", "Blocked", "UnBlocked"]}
          filterLabel={t("common.status")}
          show={false}
          hideSearch={true}
          alwaysShowFilters={true}
        />

      

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

 
