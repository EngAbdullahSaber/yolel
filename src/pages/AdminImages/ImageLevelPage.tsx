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
  Download,
  AlertCircle,
  ArrowRight,
  Filter,
  Activity
} from "lucide-react";
import { GetPanigationMethod } from "../../services/apis/ApiMethod";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";

interface AdminImage {
  id: number;
  url: string;
  age: string;
  gender: string;
  interactionCount: number;
  winCount: number;
  levelPercentage: string;
  isAllowForVote: boolean;
  isAdminCreated: boolean;
  createdAt: string;
  user: {
    id: number;
    email: string | null;
  };
}

interface ImageLevelResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: {
    range: {
      from: number;
      to: number;
    };
    items: AdminImage[];
  };
  totalItems: number;
  totalPages: number;
}

export default function ImageLevelPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(12);
  const [selectedImage, setSelectedImage] = useState<AdminImage | null>(null);
  const [fromPercent, setFromPercent] = useState(30);
  const [toPercent, setToPercent] = useState(70);

  const formatImageUrl = (url?: string) => {
    if (!url) return "";
    return import.meta.env.VITE_IMAGE_BASE_URL + url;
  };

  const { data: response, isLoading, isError, refetch } = useQuery<ImageLevelResponse>({
    queryKey: ["image-levels", currentPage, rowsPerPage, fromPercent, toPercent, lang],
    queryFn: () =>
      GetPanigationMethod(
        "/image/admin/by-percentage",
        currentPage,
        rowsPerPage,
        lang,
        "",
        { fromPercentage: fromPercent, toPercentage: toPercent }
      ),
  });

  const images = response?.data?.items || [];
  const totalPages = response?.totalPages || 0;
  const totalItems = response?.totalItems || 0;

  const handleDownload = async (imageUrl: string, id: number) => {
    try {
      const resp = await fetch(imageUrl);
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `image-level-${id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/20 dark:from-slate-900 dark:via-blue-900/5 dark:to-indigo-900/5 p-8">
      <PageMeta 
        title="Image Levels | YolelAdmin" 
        description="Analyze image performance and success rates"
      />
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-tr from-indigo-600 to-blue-700 rounded-3xl shadow-2xl shadow-indigo-500/20 transform rotate-3 hover:rotate-0 transition-all duration-500">
              <Trophy size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("adminImages.level.title")}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {t("adminImages.level.subtitle")}
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

        {/* Range Selectors */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <Filter size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {t("adminImages.level.range")}
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 flex-1 max-w-2xl">
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                  <span>{t("adminImages.level.from")}</span>
                  <span className="text-indigo-600">{fromPercent}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={fromPercent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFromPercent(Math.min(val, toPercent));
                    setCurrentPage(1);
                  }}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                />
              </div>

              <div className="hidden sm:block text-slate-300">
                <ArrowRight size={20} />
              </div>

              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                  <span>{t("adminImages.level.to")}</span>
                  <span className="text-blue-600">{toPercent}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={toPercent}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setToPercent(Math.max(val, fromPercent));
                    setCurrentPage(1);
                  }}
                  className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-[2rem] shadow-xl p-24 text-center border border-white/20">
            <div className="relative inline-block">
              <div className="h-20 w-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
              <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500" size={32} />
            </div>
            <p className="mt-6 text-slate-600 dark:text-slate-400 font-bold text-lg animate-pulse">
              {t("adminImages.fetchingData")}
            </p>
          </div>
        ) : isError ? (
          <div className="bg-rose-50 dark:bg-rose-900/10 rounded-[2rem] shadow-xl p-16 text-center border border-rose-100 dark:border-rose-900/30">
            <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
            <h3 className="text-xl font-black text-rose-900 dark:text-rose-100 mb-2">{t("common.error")}</h3>
            <button onClick={() => refetch()} className="px-8 py-3 bg-rose-600 text-white rounded-xl font-bold mt-4 shadow-lg shadow-rose-600/20">
              {t("common.tryAgain")}
            </button>
          </div>
        ) : images.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl p-20 text-center border border-slate-100 dark:border-slate-700">
            <ImageIcon size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">{t("common.noData")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-slate-100 dark:border-slate-700"
                >
                  <div 
                    className="relative aspect-[4/5] overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={formatImageUrl(image.url)}
                      alt={`Level ${image.levelPercentage}%`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                       <button className="w-full py-3 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-2xl font-black text-sm hover:bg-white/40 transition-all flex items-center justify-center gap-2">
                         <ZoomIn size={18} />
                         View Stats
                       </button>
                    </div>

                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md text-white text-[10px] font-black rounded-full border border-white/10 uppercase tracking-widest">
                       #{image.id}
                    </div>

                    <div className="absolute top-4 right-4 h-12 w-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center">
                       <div className="text-center">
                         <p className="text-[10px] text-white/60 font-black uppercase leading-none">Win</p>
                         <p className="text-lg text-white font-black leading-none mt-0.5">{Math.round(Number(image.levelPercentage))}%</p>
                       </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-black rounded-lg uppercase tracking-wider">
                          {t(`adminImages.age.${image.age}`)}
                        </span>
                        <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${
                          image.gender === 'female' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {t(`adminImages.gender.${image.gender}`)}
                        </span>
                      </div>
                      {image.isAdminCreated && <Crown size={16} className="text-amber-500" />}
                    </div>

                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-1000"
                        style={{ width: `${image.levelPercentage}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                         <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{t("adminImages.table.interactionCount")}</p>
                         <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white">
                           <Zap size={14} className="text-indigo-500" />
                           {image.interactionCount}
                         </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                         <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">{t("adminImages.table.winCount")}</p>
                         <div className="flex items-center gap-2 font-black text-emerald-600 dark:text-emerald-400">
                           <Trophy size={14} />
                           {image.winCount}
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-[2rem] px-8 py-5 shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">
                  {t("common.page")} <span className="text-slate-900 dark:text-white font-black">{currentPage}</span> {t("common.of")} <span className="text-slate-900 dark:text-white font-black">{totalPages}</span>
                  <span className="mx-3 opacity-20">|</span>
                  {totalItems} {t("adminImages.totalItems")}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-40 transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={() => setSelectedImage(null)}>
           <div className="relative max-w-4xl w-full bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 z-10 p-3 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md">
                <X size={20} />
              </button>

              <div className="w-full md:w-1/2 aspect-square md:aspect-auto">
                <img src={formatImageUrl(selectedImage.url)} alt="" className="w-full h-full object-cover" />
              </div>

              <div className="p-10 flex-1 flex flex-col gap-8">
                 <div>
                   <span className="px-4 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-full uppercase tracking-widest">
                     Performance Report
                   </span>
                   <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-4">
                     Image Analysis #{selectedImage.id}
                   </h2>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                       <p className="text-[10px] text-slate-400 font-extrabold uppercase mb-2">Success Rate</p>
                       <p className="text-4xl font-black text-indigo-600 leading-none">{selectedImage.levelPercentage}%</p>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                       <p className="text-[10px] text-slate-400 font-extrabold uppercase mb-2">Win Count</p>
                       <p className="text-4xl font-black text-emerald-500 leading-none">{selectedImage.winCount}</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-500">
                       <span>Demographics</span>
                    </div>
                    <div className="flex gap-3">
                       <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center gap-3">
                          <Users size={18} className="text-slate-400" />
                          <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase">{t("adminImages.table.gender")}</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white capitalize">{selectedImage.gender}</p>
                          </div>
                       </div>
                       <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center gap-3">
                          <Activity size={18} className="text-slate-400" />
                          <div>
                            <p className="text-[10px] text-slate-400 font-black uppercase">{t("adminImages.table.age")}</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white capitalize">{selectedImage.age}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="mt-auto flex gap-4">
                   <button 
                    onClick={() => handleDownload(formatImageUrl(selectedImage.url), selectedImage.id)}
                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20"
                   >
                     <Download size={18} />
                     Download Image
                   </button>
                   <button 
                    onClick={() => setSelectedImage(null)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-[1.5rem] font-black text-sm transition-all"
                   >
                     Close
                   </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
