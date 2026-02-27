import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  RefreshCw,
  Mail,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  MessageSquare,
  Search,
  Trash2,
} from "lucide-react";
import { GetPanigationMethodWithFilter, DeleteMethod } from "../../services/apis/ApiMethod";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { DeleteDialog } from "../../components/shared/DeleteDialog";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface ContactUsResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: ContactMessage[];
  totalItems: number;
  totalPages: number;
}

export default function ContactUsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const queryClient = useQueryClient();

  const fetchMessages = async ({
    page,
    pageSize,
    search,
  }: {
    page: number;
    pageSize: number;
    search: string;
  }): Promise<{
    data: ContactMessage[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      // Using email=k@gmail.com as per the curl example if no search term, 
      // but usually we want to see all messages. The curl showed email=k@gmail.com.
      // If the API requires it, we'll keep it.
      const response = (await GetPanigationMethodWithFilter(
        "contact-us",
        page,
        pageSize,
        lang,
        search, // searchTerm
        {} // additionalParams
      )) as ContactUsResponse;

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
      console.error("Error fetching contact messages:", error);
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
    data: messagesResponse = {
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
    queryKey: ["contact-messages", currentPage, rowsPerPage, searchTerm],
    queryFn: () =>
      fetchMessages({
        page: currentPage,
        pageSize: rowsPerPage,
        search: searchTerm,
      }),
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = (msg: ContactMessage) => {
    setMessageToDelete(msg);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!messageToDelete) return;

    setIsDeleting(true);
    const loadingToast = toast.loading(t("common.Deleting") || "Deleting message...");
    try {
      const response = await DeleteMethod("/contact-us", messageToDelete.id, lang);
      if (response) {
        toast.dismiss(loadingToast);
        toast.success(t("contactUs.messages.deleteSuccess") || "Message deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
        if (selectedMessage?.id === messageToDelete.id) {
          setSelectedMessage(null);
        }
        setIsDeleteDialogOpen(false);
        setMessageToDelete(null);
      } else {
        throw new Error("Failed to delete message");
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(t("contactUs.messages.deleteError") || "Failed to delete message");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/10 dark:to-purple-900/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-3xl shadow-2xl shadow-blue-500/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Mail size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("contactUs.title")}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {t("contactUs.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                placeholder={t("common.searchByEmail") || "Search by email..."}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400 shadow-sm"
              />
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
        </div>

      {/* Loading State */}
        {isLoading && (
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-[2rem] shadow-xl p-24 text-center border border-white/20">
            <div className="relative inline-block">
              <div className="h-20 w-20 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
              <Mail className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={32} />
            </div>
            <p className="mt-6 text-slate-600 dark:text-slate-400 font-bold text-lg animate-pulse">
              {t("contactUs.fetchingData")}
            </p>
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

        {/* Messages Table */}
        {!isLoading && !isError && (
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-700/30">
                    <th className="px-6 py-5 text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t("contactUs.table.name")}
                    </th>
                    <th className="px-6 py-5 text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t("contactUs.table.email")}
                    </th>
                    <th className="px-6 py-5 text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t("contactUs.table.message")}
                    </th>
                    <th className="px-6 py-5 text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t("contactUs.table.createdAt")}
                    </th>
                    <th className="px-6 py-5 text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                      {t("contactUs.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {messagesResponse.data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <MessageSquare size={48} className="text-slate-300 dark:text-slate-600" />
                          <p className="text-slate-500 dark:text-slate-400 font-semibold text-lg">
                            {t("contactUs.noMessagesFound")}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    messagesResponse.data.map((msg) => (
                      <tr
                        key={msg.id}
                        className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold group-hover:scale-110 transition-transform">
                              <User size={18} />
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {msg.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-medium text-slate-600 dark:text-slate-300">
                          {msg.email}
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-slate-600 dark:text-slate-400 line-clamp-1 max-w-xs font-medium">
                            {msg.message}
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm">
                            <Calendar size={14} className="text-blue-500" />
                            {formatDate(msg.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedMessage(msg)}
                              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-sm"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(msg)}
                              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-600 hover:text-white transition-all transform active:scale-95 shadow-sm"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {messagesResponse.totalPages > 1 && (
              <div className="flex items-center justify-between px-8 py-5 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-800/30">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {t("common.page")} <span className="font-black text-slate-900 dark:text-white">{currentPage}</span>{" "}
                  {t("common.of")} <span className="font-black text-slate-900 dark:text-white">{messagesResponse.totalPages}</span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(messagesResponse.totalPages, p + 1))}
                    disabled={currentPage === messagesResponse.totalPages}
                    className="p-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message Detail Backdrop */}
      {selectedMessage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMessage(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" />
          
          {/* Modal */}
          <div 
            className="relative h-[80%] overflow-y-auto no-scrollbar z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 transform transition-all animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-8 pt-8 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <Mail size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    {t("contactUs.details.title")}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">
                    ID #{selectedMessage.id}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMessage(null)}
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

             
            {/* Modal Content */}
            <div className="p-8 z-[9999999] space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-400 font-black uppercase tracking-wider mb-1">
                    {t("contactUs.table.name")}
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {selectedMessage.name}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-400 font-black uppercase tracking-wider mb-1">
                    {t("contactUs.table.userId")}
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {selectedMessage.userId}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-400 font-black uppercase tracking-wider mb-1">
                  {t("contactUs.table.email")}
                </p>
                <p className="font-bold text-slate-900 dark:text-white">
                  {selectedMessage.email}
                </p>
              </div>

              <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/30">
                <p className="text-xs text-blue-500 dark:text-blue-400 font-black uppercase tracking-wider mb-3">
                  {t("contactUs.table.message")}
                </p>
                <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest justify-center">
                <Calendar size={14} />
                {formatDate(selectedMessage.createdAt)}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 pt-0">
              <button 
                onClick={() => setSelectedMessage(null)}
                className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white font-black rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-600 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/20"
              >
                {t("contactUs.details.close")}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setMessageToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t("contactUs.delete.title") || "Delete Message"}
        description={t("contactUs.delete.description") || "Are you sure you want to delete this message? This action cannot be undone."}
        itemName={messageToDelete ? `${messageToDelete.name}'s message` : ""}
        isLoading={isDeleting}
      />
    </div>
  );
}
