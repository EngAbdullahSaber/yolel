import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  rowsPerPage: number;
  loading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  rowsPerPage,
  loading = false,
}: PaginationProps) {
  const { t } = useTranslation();

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

  const goToPage = (page: number) => {
    onPageChange(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="w-full flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between px-2">
      <div className="flex items-center gap-2">
        <div className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            {startIndex + 1}-{endIndex}
          </p>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t("common.of")}
          <span className="font-semibold text-slate-900 dark:text-white mx-1">
            {totalItems.toLocaleString()}
          </span>
          {t("common.results")}
        </p>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
        <button
          onClick={() => goToPage(1)}
          disabled={currentPage === 1 || loading}
          className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => {
              if (totalPages <= 5) return true;
              if (page === 1 || page === totalPages) return true;
              if (page >= currentPage - 1 && page <= currentPage + 1)
                return true;
              return false;
            })
            .map((page, index, array) => {
              const prevPage = array[index - 1];
              const showEllipsis = prevPage && page - prevPage > 1;

              return (
                <React.Fragment key={page}>
                  {showEllipsis && (
                    <span className="px-2 text-slate-400 dark:text-slate-500 text-sm font-medium">
                      ···
                    </span>
                  )}
                  <button
                    onClick={() => goToPage(page)}
                    disabled={loading}
                    className={`min-w-[40px] h-[40px] px-3 text-sm font-semibold rounded-xl transition-all duration-300 shadow-sm ${
                      currentPage === page
                        ? "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white shadow-lg scale-105"
                        : "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-blue-500/50"
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              );
            })}
        </div>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <ChevronRight size={16} />
        </button>

        <button
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages || loading}
          className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
