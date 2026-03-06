import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  RefreshCw,
  Image as ImageIcon,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  History as HistoryIcon,
  User,
  Calendar,
  Zap,
  Trophy,
  Download,
} from "lucide-react";
import { GetPanigationMethod } from "../../services/apis/ApiMethod";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

interface UserInfo {
  id: number;
  email: string | null;
}

interface DeletedImage {
  id: number;
  url: string;
  age: string;
  gender: string;
  isAdminCreated: boolean;
  interactionCount: number;
  winCount: number;
  deletedAt: string;
  createdAt: string;
  user: UserInfo;
  deletedByUser: UserInfo;
  isSimilarImageSubscription: boolean;
  isVoteSubscription: boolean;
}

interface DeletedImagesResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: DeletedImage[];
  totalItems: number;
  totalPages: number;
}

export default function DeletedImagesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(12);
  const [selectedImage, setSelectedImage] = useState<DeletedImage | null>(null);

  const formatImageUrl = (url?: string) => {
    if (!url) return "";
    return import.meta.env.VITE_IMAGE_BASE_URL + url;
  };

  const fetchDeletedImages = async ({
    page,
    pageSize,
  }: {
    page: number;
    pageSize: number;
  }): Promise<{
    data: DeletedImage[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const response = (await GetPanigationMethod(
        "/image/admin/deleted",
        page,
        pageSize,
        lang,
        ""
      )) as DeletedImagesResponse;

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
      console.error("Error fetching deleted images:", error);
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
    data: imagesResponse = {
      data: [],
      total: 0,
      page: 1,
      pageSize: 12,
      totalPages: 0,
    },
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["deleted-images", currentPage, rowsPerPage],
    queryFn: () =>
      fetchDeletedImages({
        page: currentPage,
        pageSize: rowsPerPage,
      }),
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch (e) {
      return dateString;
    }
  };

  const handleDownload = async (imageUrl: string, id: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `image-${id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      // We don't have toast imported here yet, let's check
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/30 to-slate-50/30 dark:from-slate-900 dark:via-gray-900/10 dark:to-slate-900/10 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-tr from-rose-600 to-orange-700 rounded-3xl shadow-2xl shadow-rose-500/20 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              <HistoryIcon size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("deletedImages.title")}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {t("deletedImages.subtitle")}
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
              <div className="h-20 w-20 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin"></div>
              <HistoryIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-500" size={32} />
            </div>
            <p className="mt-6 text-slate-600 dark:text-slate-400 font-bold text-lg animate-pulse">
              {t("deletedImages.fetchingData")}
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

        {/* Image Cards Grid */}
        {!isLoading && !isError && (
          <>
            {imagesResponse.data.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl p-20 text-center border border-slate-100 dark:border-slate-700">
                <div className="inline-flex p-5 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
                  <ImageIcon size={40} className="text-slate-400" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-semibold text-lg">
                  {t("deletedImages.noImagesFound")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {imagesResponse.data.map((image) => (
                  <div
                    key={image.id}
                    className="group relative bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700 opacity-90 hover:opacity-100"
                  >
                    {/* Image */}
                    <div
                      className="relative aspect-square bg-slate-100 dark:bg-slate-700 overflow-hidden cursor-pointer grayscale hover:grayscale-0 transition-all duration-500"
                      onClick={() => setSelectedImage(image)}
                    >
                      {image.url ? (
                        <img
                          src={formatImageUrl(image.url)}
                          alt={`Image #${image.id}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={48} className="text-slate-300" />
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* Zoom hint */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                          <ZoomIn size={24} className="text-white" />
                        </div>
                      </div>

                      {/* ID Badge */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white text-xs font-black rounded-full">
                        #{image.id}
                      </div>

                      {/* Deleted Date Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-90">
                          <HistoryIcon size={10} />
                          <span>{formatDate(image.deletedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                         
                         <div className="flex items-center gap-1.5">
                            <ShieldAlert size={14} className="text-rose-500" />
                            <span className="truncate  ">{image.deletedByUser.email || 'Image Owner'}</span>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-center px-1.5 py-1 bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg uppercase">
                          {t(`adminImages.age.${image.age}`)}
                        </span>
                        <span className={`text-center px-1.5 py-1 text-[10px] font-bold rounded-lg uppercase ${
                          image.gender === 'female' 
                            ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600' 
                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                        }`}>
                          {t(`adminImages.gender.${image.gender}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {imagesResponse.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl px-6 py-4 shadow-md border border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {t("common.page")} <span className="font-black text-slate-900 dark:text-white">{currentPage}</span>{" "}
                  {t("common.of")} <span className="font-black text-slate-900 dark:text-white">{imagesResponse.totalPages}</span>
                  {" · "}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {imagesResponse.total} {t("deletedImages.totalItems")}
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(imagesResponse.totalPages, p + 1))}
                    disabled={currentPage === imagesResponse.totalPages}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Dialog */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          <div
            className="relative z-10 flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white rounded-full transition-all"
            >
              <X size={20} />
            </button>

            {/* Image Preview */}
            <div className="relative w-full md:w-1/2 bg-slate-100 dark:bg-slate-800 flex-shrink-0">
               <img
                  src={formatImageUrl(selectedImage.url)}
                  alt={`Image #${selectedImage.id}`}
                  className="w-full h-full object-contain md:object-cover"
                />
            </div>

            {/* Content Preview */}
            <div className="flex flex-col p-8 gap-6 flex-1 overflow-y-auto">
              <div>
                <span className="px-3 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-black rounded-full uppercase tracking-wider mb-2 inline-block">
                  DELETED IMAGE #{selectedImage.id}
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  {t("deletedImages.table.deletedAt")}
                </h2>
                <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-bold">
                    <Calendar className="text-rose-500" size={20} />
                    {formatDate(selectedImage.deletedAt)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <div className="text-[10px] text-blue-500 font-black uppercase tracking-wider mb-1">{t('deletedImages.table.user')}</div>
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                       <User size={18} className="text-blue-500" />
                       {selectedImage.user.email || 'System User'}
                       <span className="text-[10px] text-slate-400">(ID: {selectedImage.user.id})</span>
                    </div>
                 </div>

                 <div className="p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                    <div className="text-[10px] text-rose-500 font-black uppercase tracking-wider mb-1">{t('deletedImages.table.deletedBy')}</div>
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                       <ShieldAlert size={18} className="text-rose-500" />
                       {selectedImage.deletedByUser.email || 'Administrator'}
                       <span className="text-[10px] text-slate-400">(ID: {selectedImage.deletedByUser.id})</span>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
                    <div className="flex justify-center mb-1 text-purple-500">
                      <Zap size={20} />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {selectedImage.interactionCount}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">
                      {t("deletedImages.table.interactionCount")}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
                    <div className="flex justify-center mb-1 text-emerald-500">
                      <Trophy size={20} />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {selectedImage.winCount}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold mt-1">
                      {t("deletedImages.table.winCount")}
                    </div>
                  </div>
              </div>

              <div className="mt-auto flex flex-col gap-2">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                >
                  {t("common.close")}
                </button>
                <button
                  onClick={() => handleDownload(formatImageUrl(selectedImage.url), selectedImage.id)}
                  className="py-4 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-black rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  {t("common.download") || "Download"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
