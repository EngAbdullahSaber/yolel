import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  Flag,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  AlertCircle,
  Trash2,
  Download,
  Clock,
  Hash,
  FileText,
  Image as ImageIcon,
  UserX,
} from "lucide-react";
import { GetPanigationMethod, DeleteMethod, UpdateMethod } from "../../services/apis/ApiMethod";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { DeleteDialog } from "../../components/shared/DeleteDialog";
import { BASE_URL } from "../../services/utils";

interface Report {
  id: number;
  imageId: number;
  userId: number;
  reason: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  image: {
    id: number;
    url: string;
    userId: number;
    deletedAt: string | null;
  };
}

interface ReportsResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: Report[];
  totalItems: number;
  totalPages: number;
}

export default function ReportsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isImageDeleteDialogOpen, setIsImageDeleteDialogOpen] = useState(false);
  const [imageToDeleteId, setImageToDeleteId] = useState<number | null>(null);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  const fetchReports = async ({
    page,
    pageSize,
  }: {
    page: number;
    pageSize: number;
  }): Promise<{
    data: Report[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const response = (await GetPanigationMethod(
        "report",
        page,
        pageSize,
        lang,
        ""
      )) as ReportsResponse;

      return {
        data: response.data || [],
        total: response.totalItems || 0,
        page: page,
        pageSize: pageSize,
        totalPages: response.totalPages || 0,
      };
    } catch (error) {
      console.error("Error fetching reports:", error);
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
    data: reportsResponse = {
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
    queryKey: ["reports", currentPage, rowsPerPage],
    queryFn: () =>
      fetchReports({
        page: currentPage,
        pageSize: rowsPerPage,
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

  const getImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `${BASE_URL}${url}`;
  };

  const handleDelete = (report: Report) => {
    setReportToDelete(report);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;

    setIsDeleting(true);
    const loadingToast = toast.loading(t("common.Deleting") || "Deleting report...");
    try {
      const response = await DeleteMethod("report", reportToDelete.id, lang);
      if (response) {
        toast.dismiss(loadingToast);
        toast.success(t("common.deleteSuccess") || "Report deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["reports"] });
        if (selectedReport?.id === reportToDelete.id) {
          setSelectedReport(null);
        }
        setIsDeleteDialogOpen(false);
        setReportToDelete(null);
      } else {
        throw new Error("Failed to delete report");
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(t("common.deleteError") || "Failed to delete report");
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleBlockUser = async (userId: number) => {
    setIsBlocking(true);
    const loadingToast = toast.loading(t("reports.blockingUser") || "Blocking user...");
    try {
      const response = await UpdateMethod("/user/admin", { isBlocked: true }, `${userId}/block`, lang);
      if (response) {
        toast.dismiss(loadingToast);
        toast.success(t("reports.blockSuccess") || "User blocked successfully");
        queryClient.invalidateQueries({ queryKey: ["reports"] });
      } else {
        throw new Error("Failed to block user");
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(t("reports.blockError") || "Failed to block user");
    } finally {
      setIsBlocking(false);
    }
  };

  const handleDeleteImage = (imageId: number) => {
    setImageToDeleteId(imageId);
    setIsImageDeleteDialogOpen(true);
  };

  const handleConfirmDeleteImage = async () => {
    if (!imageToDeleteId) return;

    setIsDeletingImage(true);
    const loadingToast = toast.loading(t("common.Deleting") || "Deleting image...");
    try {
      const response = await DeleteMethod("image", imageToDeleteId, lang);
      if (response) {
        toast.dismiss(loadingToast);
        toast.success(t("reports.messages.deleteImageSuccess") || "Image deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["reports"] });
        setIsImageDeleteDialogOpen(false);
        setImageToDeleteId(null);
        if (selectedReport?.image.id === imageToDeleteId) {
          setSelectedReport(null);
        }
      } else {
        throw new Error("Failed to delete image");
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(t("reports.messages.deleteImageError") || "Failed to delete image");
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleDownloadImage = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'report-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(t("common.downloadSuccess") || "Image downloaded successfully");
    } catch (error) {
      toast.error(t("common.downloadError") || "Failed to download image");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/10 dark:to-purple-900/10 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-tr from-rose-600 to-orange-700 rounded-3xl shadow-2xl shadow-rose-500/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <Flag size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("reports.title")}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {t("reports.subtitle")}
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
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-[2rem] shadow-xl p-24 text-center border border-white/20">
            <div className="relative inline-block">
              <div className="h-20 w-20 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin"></div>
              <Flag className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-500" size={32} />
            </div>
            <p className="mt-6 text-slate-600 dark:text-slate-400 font-bold text-lg animate-pulse">
              {t("reports.fetchingData")}
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

        {/* Reports Table */}
        {!isLoading && !isError && (
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-700/30">
                    <th className="px-6 py-5 text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t("reports.table.image")}
                    </th>
                    <th className="px-6 py-5 text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t("reports.table.reason")}
                    </th>
                    <th className="px-6 py-5 text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t("reports.table.userId")}
                    </th>
                    <th className="px-6 py-5 text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t("reports.table.createdAt")}
                    </th>
                    <th className="px-6 py-5 text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                      {t("reports.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {reportsResponse.data.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <AlertCircle size={48} className="text-slate-300 dark:text-slate-600" />
                          <p className="text-slate-500 dark:text-slate-400 font-semibold text-lg">
                            {t("reports.noReportsFound")}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    reportsResponse.data.map((report) => (
                      <tr
                        key={report.id}
                        className="group hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-colors"
                      >
                        <td className="px-6 py-5">
                          <div 
                            className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform cursor-pointer"
                            onClick={() => setSelectedReport(report)}
                          >
                            <img
                      src={report.image?.deletedAt ? "default/placeholder-brand.png" : getImageUrl(report.image.url)}
                              alt="Reported content"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye size={20} className="text-white" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-bold text-slate-900 dark:text-white capitalize">
                          {report.reason}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-bold">
                            <User size={16} className="text-rose-500" />
                            {report.userId}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm">
                            <Calendar size={14} className="text-rose-500" />
                            {formatDate(report.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-600 hover:text-white transition-all transform active:scale-95 shadow-sm"
                              title={t("common.view")}
                            >
                              <Eye size={18} />
                            </button>
                           {!report.image?.deletedAt && (<button
                              onClick={() => handleDeleteImage(report.image.id)}
                              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-600 hover:text-white transition-all transform active:scale-95 shadow-sm"
                              title={t("reports.deleteImage.title") || "Delete Image"}
                            >
                              <ImageIcon size={18} />
                            </button>)}
                            <button
                              onClick={() => handleDelete(report)}
                              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-600 hover:text-white transition-all transform active:scale-95 shadow-sm"
                              title={t("common.delete")}
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
            {reportsResponse.totalPages > 1 && (
              <div className="flex items-center justify-between px-8 py-5 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-800/30">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {t("common.page")} <span className="font-black text-slate-900 dark:text-white">{currentPage}</span>{" "}
                  {t("common.of")} <span className="font-black text-slate-900 dark:text-white">{reportsResponse.totalPages}</span>
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
                    onClick={() => setCurrentPage((p) => Math.min(reportsResponse.totalPages, p + 1))}
                    disabled={currentPage === reportsResponse.totalPages}
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

      {/* Report Detail Modal - Improved Design */}
      {selectedReport && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all duration-300 animate-in fade-in"
          onClick={() => setSelectedReport(null)}
        >
          <div 
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl h-[80%] shadow-2xl overflow-auto no-scrollbar border border-white/20 transform transition-all animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Gradient */}
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-rose-600 via-orange-500 to-amber-500 opacity-90" />
              <div className="absolute top-0 left-0 right-0 h-32 bg-black/20 mix-blend-overlay" />
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedReport(null)}
                className={`absolute top-4 ${lang=="en"?"right-4":"left-4"} z-10 p-2.5 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all transform hover:scale-110 border border-white/30`}
                title={t("common.close")}
              >
                <X size={20} />
              </button>

              {/* Header Content */}
              <div className="relative pt-8 px-8 pb-16">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                    <Flag size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">
                      {t("reports.details.title")}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <Hash size={12} className="text-white/80" />
                        <span className="text-sm font-bold text-white">#{selectedReport.id}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <Clock size={12} className="text-white/80" />
                        <span className="text-sm font-bold text-white">{formatDate(selectedReport.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 -mt-8">
              {/* Image Preview Card */}
              <div className="mb-8 group">
                <div className="relative rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-800">
                  <div className="aspect-video w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                    <img
                      src={selectedReport.deletedAt ? "default/placeholder-brand.png" : getImageUrl(selectedReport.image.url)}
                      alt="Reported content"
                      className="max-w-full max-h-[300px] object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  
                  {/* Image Actions Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => window.open(getImageUrl(selectedReport.image.url), '_blank')}
                        className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all border border-white/30"
                        title={t("common.view")}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDownloadImage(
                          getImageUrl(selectedReport.image.url), 
                          `report-${selectedReport.id}-image.jpg`
                        )}
                        className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl text-white hover:bg-white/30 transition-all border border-white/30"
                        title={t("common.download")}
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                      <User size={16} className="text-rose-600 dark:text-rose-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {t("reports.table.userId")}
                    </p>
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {selectedReport.userId}
                  </p>
                </div>

                <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                      <ImageIcon size={16} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {t("reports.table.imageId")}
                    </p>
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {selectedReport.imageId}
                  </p>
                </div>
              </div>

              {/* Reason Section */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <AlertCircle size={16} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm font-black text-slate-400 uppercase tracking-wider">
                    {t("reports.table.reason")}
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-100 dark:border-purple-800/30 shadow-sm">
                  <div className="flex items-start gap-3">
                    <FileText size={20} className="text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                    <p className="text-slate-800 dark:text-slate-200 font-bold text-lg leading-relaxed capitalize">
                      {selectedReport.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={() => handleBlockUser(selectedReport.image.userId)}
                  disabled={isBlocking}
                  className="py-4 bg-slate-900 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white font-black rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserX size={20} />
                  {t("reports.blockUser")}
                </button>
              {!selectedReport.image?.deletedAt && <button
                  onClick={() => handleDeleteImage(selectedReport.image.id)}
                  className="py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
                >
                  <ImageIcon size={20} />
                  {t("reports.deleteImage.title")}
                </button>}
                <button
                  onClick={() => handleDelete(selectedReport)}
                  className="py-4 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2"
                >
                  <Trash2 size={20} />
                  {t("common.delete")}
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-black rounded-2xl transition-all active:scale-[0.98] border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  {t("common.close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setReportToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t("reports.delete.title") || "Delete Report"}
        description={t("reports.delete.description") || "Are you sure you want to delete this report? This action cannot be undone."}
        itemName={reportToDelete ? `Report #${reportToDelete.id}` : ""}
        isLoading={isDeleting}
      />

      <DeleteDialog
        isOpen={isImageDeleteDialogOpen}
        onClose={() => {
          setIsImageDeleteDialogOpen(false);
          setImageToDeleteId(null);
        }}
        onConfirm={handleConfirmDeleteImage}
        title={t("reports.deleteImage.title") || "Delete Image"}
        description={t("reports.deleteImage.description") || "Are you sure you want to delete this image? This action cannot be undone."}
        itemName={imageToDeleteId ? `Image #${imageToDeleteId}` : ""}
        isLoading={isDeletingImage}
      />
    </div>
  );
}