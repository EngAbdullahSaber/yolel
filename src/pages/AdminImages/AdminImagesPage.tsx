import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  BarChart3,
  Users,
  Trophy,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Zap,
  Crown,
  X,
  ZoomIn,
  Plus,
  Trash2,
  AlertCircle,
  Copy,
  Star,
  Eye,
  Heart,
  Activity,
  Download,
} from "lucide-react";
import { GetPanigationMethod, DeleteMethod } from "../../services/apis/ApiMethod";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { useQueryClient } from "@tanstack/react-query";
import { DeleteDialog } from "../../components/shared/DeleteDialog";

interface AdminImage {
  id: number;
  url: string;
  age: string;
  gender: string;
  isAllowForVote: boolean;
  isAdminCreated: boolean;
  voteCount: number;
  interactionCount: number;
  winCount: number;
  isSimilarImageSubscription: boolean;
  isVoteSubscription: boolean;
}

interface AdminImagesResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: {
    items: AdminImage[];
  };
  totalItems: number;
  totalPages: number;
}

export default function AdminImagesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(12);
  const [selectedImage, setSelectedImage] = useState<AdminImage | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<AdminImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [genderFilter, setGenderFilter] = useState<string>("");
  const [ageFilter, setAgeFilter] = useState<string>("");

  const formatImageUrl = (url?: string) => {
    if (!url) return "";
    return import.meta.env.VITE_IMAGE_BASE_URL + url;
  };

  const fetchImages = async ({
    page,
    pageSize,
    gender,
    age,
  }: {
    page: number;
    pageSize: number;
    gender?: string;
    age?: string;
  }): Promise<{
    data: AdminImage[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const params: any = {};
      if (gender) params.gender = gender;
      if (age) params.age = age;

      const response = (await GetPanigationMethod(
        "/image/admin",
        page,
        pageSize,
        lang,
        "",
        params
      )) as AdminImagesResponse;

      const items = response.data?.items || [];
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
      console.error("Error fetching admin images:", error);
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
    queryKey: ["admin-images", currentPage, rowsPerPage, genderFilter, ageFilter],
    queryFn: () =>
      fetchImages({
        page: currentPage,
        pageSize: rowsPerPage,
        gender: genderFilter,
        age: ageFilter,
      }),
  });
  
  const handleDelete = (image: AdminImage) => {
    setImageToDelete(image);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!imageToDelete) return;

    setIsDeleting(true);
    const loadingToast = toast.loading(t("common.Deleting") || "Deleting image...");
    try {
      const response = await DeleteMethod("/image", imageToDelete.id, lang);
      if (response) {
        toast.dismiss(loadingToast);
        toast.success(t("common.deleteSuccess") || "Image deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["admin-images"] });
        setSelectedImage(null);
        setIsDeleteDialogOpen(false);
        setImageToDelete(null);
      } else {
        throw new Error("Failed to delete image");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.dismiss(loadingToast);
      toast.error(error?.response?.data?.message?.english || error.message || t("common.error"));
    } finally {
      setIsDeleting(false);
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
      toast.error(t("common.error") || "Failed to download image");
    }
  };

  const totalVotes = imagesResponse.data.reduce((acc, curr) => acc + curr.voteCount, 0);
  const totalInteractions = imagesResponse.data.reduce((acc, curr) => acc + curr.interactionCount, 0);
  const totalWins = imagesResponse.data.reduce((acc, curr) => acc + curr.winCount, 0);

  // Helper function to get age label
  const getAgeLabel = (age: string) => {
    return t(`adminImages.age.${age}`) || age;
  };

  // Helper function to get gender label
  const getGenderLabel = (gender: string) => {
    return t(`adminImages.gender.${gender}`) || gender;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/10 dark:to-purple-900/10 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-3xl shadow-2xl shadow-blue-500/20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <ImageIcon size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("adminImages.title")}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {t("adminImages.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin-images/create")}
              className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all duration-300 active:scale-95"
            >
              <Plus size={20} />
              {t("adminImages.create.addButton")}
            </button>
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

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-6 bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
          {/* Gender Filter */}
          <div className="flex flex-col gap-2 ring-1 ring-slate-200 dark:ring-slate-700 p-4 rounded-2xl flex-1 min-w-[300px]">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <Users size={16} />
              <span className="text-xs font-black uppercase tracking-wider">{t("adminImages.table.gender")}</span>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-xl gap-1">
              {(["", "male", "female"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGenderFilter(g);
                    setCurrentPage(1);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                    genderFilter === g
                      ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-md ring-1 ring-slate-200 dark:ring-slate-700/50"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  {g === "" ? t("common.all") : t(`adminImages.gender.${g}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Age Filter */}
          <div className="flex flex-col gap-2 ring-1 ring-slate-200 dark:ring-slate-700 p-4 rounded-2xl flex-[1.5] min-w-[400px]">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <Activity size={16} />
              <span className="text-xs font-black uppercase tracking-wider">{t("adminImages.table.age")}</span>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1.5 rounded-xl gap-1 overflow-x-auto no-scrollbar">
              {(["", "child", "youth", "old"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => {
                    setAgeFilter(a);
                    setCurrentPage(1);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 min-w-fit ${
                    ageFilter === a
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-md ring-1 ring-slate-200 dark:ring-slate-700/50"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  {a === "" ? t("common.all") : t(`adminImages.age.${a}`)}
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
              <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={32} />
            </div>
            <p className="mt-6 text-slate-600 dark:text-slate-400 font-bold text-lg animate-pulse">
              {t("adminImages.fetchingData")}
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
                  {t("common.noData")}
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
                      className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden cursor-pointer"
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
                          <ImageIcon size={48} className="text-slate-300 dark:text-slate-600" />
                        </div>
                      )}

                      {/* Overlay gradient + zoom hint */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                          <ZoomIn size={24} className="text-white" />
                        </div>
                      </div>

                      {/* ID Badge */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white text-xs font-black rounded-full">
                        #{image.id}
                      </div>

                      {/* Delete Button (Card) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(image);
                        }}
                        className="absolute top-3 left-14 p-2 bg-rose-500/80 hover:bg-rose-600 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                        title={t("common.delete")}
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Allow For Vote Badge */}
                      <div className="absolute top-3 right-3">
                        {image.isAllowForVote ? (
                          <div className="p-1.5 bg-emerald-500/90 backdrop-blur-sm rounded-full shadow-lg">
                            <CheckCircle2 size={14} className="text-white" />
                          </div>
                        ) : (
                          <div className="p-1.5 bg-rose-500/90 backdrop-blur-sm rounded-full shadow-lg">
                            <XCircle size={14} className="text-white" />
                          </div>
                        )}
                      </div>

                      {/* Admin Created Badge */}
                      {image.isAdminCreated && (
                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-amber-400/90 backdrop-blur-sm text-amber-900 text-[10px] font-black rounded-full flex items-center gap-1">
                          <Crown size={10} />
                          {t("adminImages.details.adminBadge")}
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      {/* Age & Gender Badges */}
                      <div className="flex items-center gap-2">
                        <span className="flex-1 text-center px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg capitalize">
                          {getAgeLabel(image.age)}
                        </span>
                        <span
                          className={`flex-1 text-center px-2 py-1 text-xs font-bold rounded-lg capitalize ${
                            image.gender === "female"
                              ? "bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300"
                              : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                          }`}
                        >
                          {getGenderLabel(image.gender)}
                        </span>
                      </div>

                      {/* Subscription Badges */}
                      <div className="flex items-center gap-2">
                        {image.isSimilarImageSubscription && (
                          <span className="flex-1 text-center px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1">
                            <Copy size={10} />
                            {t("adminImages.subscriptions.similar.badge")}
                          </span>
                        )}
                        {image.isVoteSubscription && (
                          <span className="flex-1 text-center px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1">
                            <Star size={10} />
                            {t("adminImages.subscriptions.vote.badge")}
                          </span>
                        )}
                      </div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                        {/* Votes */}
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex items-center gap-1 text-blue-500 dark:text-blue-400">
                            <BarChart3 size={12} />
                          </div>
                          <span className="text-lg font-black text-slate-800 dark:text-white leading-none">
                            {image.voteCount}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wide font-semibold">
                            {t("adminImages.table.voteCount")}
                          </span>
                        </div>

                        {/* Interactions */}
                        <div className="flex flex-col items-center gap-0.5 border-x border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-1 text-purple-500 dark:text-purple-400">
                            <Zap size={12} />
                          </div>
                          <span className="text-lg font-black text-slate-800 dark:text-white leading-none">
                            {image.interactionCount}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wide font-semibold">
                            {t("adminImages.table.interactionCount")}
                          </span>
                        </div>

                        {/* Wins */}
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400">
                            <Trophy size={12} />
                          </div>
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none">
                            {image.winCount}
                          </span>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wide font-semibold">
                            {t("adminImages.table.winCount")}
                          </span>
                        </div>
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
                    {imagesResponse.total} {t("adminImages.totalItems")}
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

                  {Array.from({ length: imagesResponse.totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === imagesResponse.totalPages ||
                        Math.abs(p - currentPage) <= 1
                    )
                    .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                      if (idx > 0 && (arr[idx - 1] as number) + 1 < p) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setCurrentPage(item as number)}
                          className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                            currentPage === item
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}

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

      {/* Lightbox Dialog */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          {/* Modal */}
          <div
            className="relative z-10 flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white rounded-full transition-all"
            >
              <X size={20} />
            </button>

            {/* Full Image */}
            <div className="relative w-full md:w-1/2 bg-slate-100 dark:bg-slate-800 flex-shrink-0">
              <div className="aspect-square md:h-full md:aspect-auto">
                {selectedImage.url ? (
                  <img
                    src={formatImageUrl(selectedImage.url)}
                    alt={`Image #${selectedImage.id}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={64} className="text-slate-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Details Panel */}
            <div className="flex flex-col p-8 gap-6 flex-1 overflow-y-auto">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-black rounded-full uppercase tracking-wider">
                    #{selectedImage.id}
                  </span>
                  {selectedImage.isAdminCreated && (
                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-black rounded-full flex items-center gap-1">
                      <Crown size={11} /> Admin
                    </span>
                  )}
                  {selectedImage.isAllowForVote ? (
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-black rounded-full flex items-center gap-1">
                      <CheckCircle2 size={11} /> {t("adminImages.details.allowedForVote")}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-black rounded-full flex items-center gap-1">
                      <XCircle size={11} /> {t("adminImages.details.notAllowedForVote")}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                  {t("adminImages.details.title")}
                </h2>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold rounded-xl capitalize">
                  {getAgeLabel(selectedImage.age)}
                </span>
                <span
                  className={`px-4 py-1.5 text-sm font-bold rounded-xl capitalize ${
                    selectedImage.gender === "female"
                      ? "bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300"
                      : "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                  }`}
                >
                  {getGenderLabel(selectedImage.gender)}
                </span>
              </div>

              {/* Subscription Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-2xl border ${
                  selectedImage.isSimilarImageSubscription
                    ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-50"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Copy size={18} className="text-purple-600 dark:text-purple-400" />
                    <span className="font-bold text-sm">{t("adminImages.subscriptions.similar.label")}</span>
                  </div>
                  <span className={`text-sm font-medium ${
                    selectedImage.isSimilarImageSubscription
                      ? "text-purple-700 dark:text-purple-300"
                      : "text-slate-500 dark:text-slate-400"
                  }`}>
                    {selectedImage.isSimilarImageSubscription 
                      ? t("adminImages.subscriptions.enabled") 
                      : t("adminImages.subscriptions.disabled")}
                  </span>
                </div>

                <div className={`p-4 rounded-2xl border ${
                  selectedImage.isVoteSubscription
                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-50"
                }`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Star size={18} className="text-amber-600 dark:text-amber-400" />
                    <span className="font-bold text-sm">{t("adminImages.subscriptions.vote.label")}</span>
                  </div>
                  <span className={`text-sm font-medium ${
                    selectedImage.isVoteSubscription
                      ? "text-amber-700 dark:text-amber-300"
                      : "text-slate-500 dark:text-slate-400"
                  }`}>
                    {selectedImage.isVoteSubscription 
                      ? t("adminImages.subscriptions.enabled") 
                      : t("adminImages.subscriptions.disabled")}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center">
                  <div className="flex justify-center mb-1 text-blue-500">
                    <BarChart3 size={20} />
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {selectedImage.voteCount}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">
                    {t("adminImages.table.voteCount")}
                  </div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 text-center">
                  <div className="flex justify-center mb-1 text-purple-500">
                    <Zap size={20} />
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white">
                    {selectedImage.interactionCount}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">
                    {t("adminImages.table.interactionCount")}
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 text-center">
                  <div className="flex justify-center mb-1 text-emerald-500">
                    <Trophy size={20} />
                  </div>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {selectedImage.winCount}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">
                    {t("adminImages.table.winCount")}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-auto flex gap-3">
                <button
                  onClick={() => setSelectedImage(null)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all"
                >
                  {t("common.close")}
                </button>
                <button
                  onClick={() => handleDownload(formatImageUrl(selectedImage.url), selectedImage.id)}
                  className="flex-1 py-3 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  {t("common.download") || "Download"}
                </button>
                <button
                  onClick={() => handleDelete(selectedImage)}
                  className="flex-1 py-3 bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  {t("common.delete")}
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
        title={t("adminImages.delete.title") || "Delete Image"}
        description={t("adminImages.delete.description") || "Are you sure you want to delete this image? This action cannot be undone."}
        itemName={imageToDelete ? `Image #${imageToDelete.id}` : ""}
        isLoading={isDeleting}
      />
    </div>
  );
}