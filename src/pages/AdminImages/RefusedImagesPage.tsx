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
  User,
  Calendar,
  AlertOctagon,
  Download,
  Clock,
  UserCheck,
  Trash2,
  Check,
} from "lucide-react";
import {
  fetchRefusedImagesApi,
  deleteRefusedImageApi,
  acceptRefusedImageApi,
  RefusedImage,
  RefusedImagesResponse,
} from "../../services/apis/RefusedImagesService";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useToast } from "../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { DeleteDialog } from "../../components/shared/DeleteDialog";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";

export default function RefusedImagesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [selectedImage, setSelectedImage] = useState<RefusedImage | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<RefusedImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
  const [imageToAccept, setImageToAccept] = useState<RefusedImage | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  const toast = useToast();
  const queryClient = useQueryClient();

  const formatImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return import.meta.env.VITE_IMAGE_BASE_URL + url;
  };

  const fetchRefusedImages = async ({
    page,
    pageSize,
  }: {
    page: number;
    pageSize: number;
  }): Promise<{
    data: RefusedImage[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const response = await fetchRefusedImagesApi(page, pageSize, lang);

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
      console.error("Error fetching refused images:", error);
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
    queryKey: ["refused-images", currentPage, rowsPerPage],
    queryFn: () =>
      fetchRefusedImages({
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
      link.download = `refused-image-${id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const handleDelete = (image: RefusedImage) => {
    setImageToDelete(image);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;

    setIsDeleting(true);
    const loadingToast = toast.loading(t("common.Deleting") || "Deleting image...");
    try {
      await deleteRefusedImageApi(imageToDelete.id, lang);
      toast.dismiss(loadingToast);
      toast.success(t("common.deleteSuccess") || "Image deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["refused-images"] });
      setIsDeleteDialogOpen(false);
      setImageToDelete(null);
      setSelectedImage(null);
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.dismiss(loadingToast);
      toast.error(
        error?.response?.data?.message?.[lang === 'ar' ? 'arabic' : 'english'] || 
        error.message || 
        t("common.error")
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAcceptClick = (image: RefusedImage) => {
    setImageToAccept(image);
    setIsAcceptDialogOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!imageToAccept) return;

    setIsAccepting(true);
    const loadingToast = toast.loading(t("common.Updating") || "Updating image status...");
    try {
      await acceptRefusedImageApi(imageToAccept.id, lang);
      toast.dismiss(loadingToast);
      toast.success(t("refusedImages.acceptSuccess") || "Image accepted successfully");
      queryClient.invalidateQueries({ queryKey: ["refused-images"] });
      setIsAcceptDialogOpen(false);
      setImageToAccept(null);
      setSelectedImage(null);
    } catch (error: any) {
      console.error("Accept error:", error);
      toast.dismiss(loadingToast);
      toast.error(
        error?.response?.data?.message?.[lang === 'ar' ? 'arabic' : 'english'] || 
        error.message || 
        t("common.error")
      );
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/30 to-slate-50/30 dark:from-slate-900 dark:via-gray-900/10 dark:to-slate-900/10 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-3xl shadow-2xl shadow-orange-500/20 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
              <AlertOctagon size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("refusedImages.title")}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {t("refusedImages.subtitle")}
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
              <div className="h-20 w-20 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
              <AlertOctagon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-500" size={32} />
            </div>
            <p className="mt-6 text-slate-600 dark:text-slate-400 font-bold text-lg animate-pulse">
              {t("refusedImages.fetchingData")}
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
                  {t("refusedImages.noImagesFound")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {imagesResponse.data.map((image) => (
                  <div
                    key={image.id}
                    className="group relative bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-slate-100 dark:border-slate-700"
                  >
                    {/* Image */}
                    <div
                      className="relative aspect-square bg-slate-100 dark:bg-slate-700 overflow-hidden cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    >
                      {image.imageUrl ? (
                        <img
                          src={formatImageUrl(image.imageUrl)}
                          alt={`Refused Image #${image.id}`}
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                      
                      {/* Zoom hint */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                          <ZoomIn size={24} className="text-white" />
                        </div>
                      </div>

                      {/* ID Badge */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white text-xs font-black rounded-full border border-white/10">
                        #{image.id}
                      </div>

                      {/* Action Buttons (Card Overlay) */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptClick(image);
                          }}
                          className="p-2.5 bg-emerald-500/90 hover:bg-emerald-600 backdrop-blur-sm text-white rounded-xl transition-all duration-300 shadow-xl opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0"
                          title={t("refusedImages.acceptTitle")}
                        >
                          <Check size={18} strokeWidth={3} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(image);
                          }}
                          className="p-2.5 bg-rose-500/80 hover:bg-rose-600 backdrop-blur-sm text-white rounded-xl transition-all duration-300 shadow-xl opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 delay-75"
                          title={t("common.delete")}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* Date Overlay */}
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold opacity-90">
                          <Clock size={10} />
                          <span>{formatDate(image.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                 

                      <div className="p-2.5 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-100 dark:border-rose-900/20">
                        <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 line-clamp-2 leading-relaxed">
                          {image.refusalReason}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-center px-1.5 py-1 bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                          {t(`adminImages.age.${image.ageType}`) || image.ageType}
                        </span>
                        <span className={`text-center px-1.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider ${
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
                    {imagesResponse.total} {t("refusedImages.totalItems")}
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          <div
            className="relative z-10 flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] animate-in zoom-in-95 duration-300 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 z-20 p-2.5 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white rounded-full transition-all border border-white/10"
            >
              <X size={20} />
            </button>

            {/* Image Preview */}
            <div className="relative w-full md:w-1/2 bg-slate-100 dark:bg-slate-800 flex-shrink-0 group/preview">
               <img
                  src={formatImageUrl(selectedImage.imageUrl)}
                  alt={`Refused Image #${selectedImage.id}`}
                  className="w-full h-full object-contain md:object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
            </div>

            {/* Content Preview */}
            <div className="flex flex-col p-10 gap-8 flex-1 overflow-y-auto">
              <div>
                <span className="px-4 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black rounded-full uppercase tracking-[0.2em] mb-3 inline-block border border-amber-200 dark:border-amber-900/50">
                  {t('refusedImages.badge')} #{selectedImage.id}
                </span>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {t("refusedImages.table.refusedAt")}
                </h2>
                <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-bold">
                    <Calendar className="text-amber-500" size={20} />
                    {formatDate(selectedImage.createdAt)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="p-5 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                    <div className="text-[10px] text-rose-500 font-black uppercase tracking-wider mb-2">{t('refusedImages.table.reason')}</div>
                    <div className="flex items-start gap-3 font-bold text-slate-900 dark:text-white">
                       <AlertOctagon size={20} className="text-rose-500 shrink-0 mt-0.5" />
                       <span className="text-sm leading-relaxed">{selectedImage.refusalReason}</span>
                    </div>
                 </div>

                 
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                      {t("refusedImages.table.ageType")}
                    </div>
                    <div className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock size={18} className="text-purple-500" />
                      {t(`adminImages.age.${selectedImage.ageType}`) || selectedImage.ageType}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                      {t("refusedImages.table.gender")}
                    </div>
                    <div className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <UserCheck size={18} className="text-emerald-500" />
                      {t(`adminImages.gender.${selectedImage.gender}`)}
                    </div>
                  </div>
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-4">                <button
                  onClick={() => handleDownload(formatImageUrl(selectedImage.imageUrl), selectedImage.id)}
                  className="py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 dark:shadow-white/5"
                >
                  <Download size={20} />
                  {t("common.download") || "Download Image"}
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleAcceptClick(selectedImage)}
                        className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        <Check size={20} strokeWidth={3} />
                        {t("refusedImages.acceptTitle")}
                    </button>
                    <button
                        onClick={() => handleDelete(selectedImage)}
                        className="flex-1 py-4 bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-black rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 size={20} />
                        {t("common.delete")}
                    </button>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}

                  className="py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl transition-all text-sm"
                >
                  {t("common.close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setImageToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t("refusedImages.deleteTitle") || "Delete Refused Image"}
        description={t("refusedImages.deleteDescription") || "Are you sure you want to delete this refused image? This action cannot be undone."}
        itemName={imageToDelete ? `#${imageToDelete.id}` : ""}
        isLoading={isDeleting}
      />

      {/* Accept Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isAcceptDialogOpen}
        onClose={() => {
          setIsAcceptDialogOpen(false);
          setImageToAccept(null);
        }}
        onConfirm={handleConfirmAccept}
        title={t("refusedImages.acceptTitle") || "Accept Refused Image"}
        description={t("refusedImages.acceptDescription") || "Are you sure you want to accept this image? It will be moved to the active admin images."}
        itemName={imageToAccept ? `#${imageToAccept.id}` : ""}
        isLoading={isAccepting}
        type="success"
      />
    </div>
  );
}
