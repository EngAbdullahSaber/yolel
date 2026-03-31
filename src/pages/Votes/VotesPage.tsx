import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  RefreshCw,
  ThumbsUp,
  Search,
  Users,
  Image as ImageIcon,
  Trophy,
  User,
  Calendar,
  Percent,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { DataTable } from "../../components/shared/DataTable";
import { Pagination } from "../../components/shared/Pagination";
import { GetPanigationMethod } from "../../services/apis/ApiMethod";
import { useTranslation } from "react-i18next";

interface VoteImage {
  id: number;
  url: string;
  userId: number;
  gender: string;
  age: string;
}

interface Vote {
  id: number;
  createdAt: string;
  totalVotes: number;
  imageOneVotes: number;
  imageTwoVotes: number;
  imageOne: VoteImage;
  imageTwo: VoteImage;
}

interface VotesResponse {
  code: number;
  message: {
    arabic: string;
    english: string;
  };
  data: Vote[];
  totalPages: number;
  totalItems: number;
}

export default function VotesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  // Pagination & Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sort, setSort] = useState("newest");

  const formatImageUrl = (url: string) => {
    return import.meta.env.VITE_IMAGE_BASE_URL + url;
  };

  const fetchVotes = async ({
    page,
    pageSize,
    sortValue,
  }: {
    page: number;
    pageSize: number;
    sortValue: string;
  }): Promise<{
    data: Vote[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> => {
    try {
      const response = (await GetPanigationMethod(
        "/vote/admin/vote-list",
        page,
        pageSize,
        lang,
        "",
        { sort: sortValue }
      )) as VotesResponse;

      const votes = response.data || [];
      const totalItems = response.totalItems || 0;
      const totalPages = response.totalPages || 0;

      return {
        data: votes,
        total: totalItems,
        page: page,
        pageSize: pageSize,
        totalPages: totalPages,
      };
    } catch (error) {
      console.error("Error fetching votes:", error);
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
    data: votesResponse = {
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
    queryKey: ["votes", currentPage, rowsPerPage, sort],
    queryFn: () =>
      fetchVotes({
        page: currentPage,
        pageSize: rowsPerPage,
        sortValue: sort,
      }),
  });

  const handleRefresh = () => {
    refetch();
  };

  const calculatePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-xl">
              <ThumbsUp size={32} className="text-white" />
            </div>
            <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 dark:from-slate-100 dark:via-indigo-100 dark:to-violet-100 bg-clip-text text-transparent">
                  {t("votes.title")}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {t("votes.subtitle")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Filter */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={handleSortChange}
                  className="appearance-none pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm cursor-pointer"
                >
                  <option value="newest">{t("votes.sort.newest")}</option>
                  <option value="oldest">{t("votes.sort.oldest")}</option>
                  <option value="mostInteractions">{t("votes.sort.mostInteractions")}</option>
                  <option value="leastInteractions">{t("votes.sort.leastInteractions")}</option>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Filter size={16} />
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ArrowUpDown size={14} />
                </div>
              </div>

              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <RefreshCw
                  size={18}
                  className={isLoading ? "animate-spin" : ""}
                />
                {t("common.refresh")}
              </button>
            </div>
          </div>
 

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium">
                {t("votes.fetchingData")}
              </p>
            </div>
          )}

          {/* Error State */}
          {isError && !isLoading && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-12 text-center">
              <div className="text-red-500 mb-4 flex justify-center">
                <ThumbsUp size={48} className="rotate-180" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {t("votes.connectionLost")}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                {t("votes.connectionErrorInfo")}
              </p>
              <button
                onClick={handleRefresh}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30"
              >
                {t("votes.retryConnection")}
              </button>
            </div>
          )}

        {/* Votes Grid Section */}
        {!isLoading && !isError && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {votesResponse.data.map((vote) => {
                const percentOne = calculatePercentage(vote.imageOneVotes, vote.totalVotes);
                const percentTwo = calculatePercentage(vote.imageTwoVotes, vote.totalVotes);
                const isOneWinner = vote.imageOneVotes > vote.imageTwoVotes;
                const isTwoWinner = vote.imageTwoVotes > vote.imageOneVotes;

                return (
                  <div key={vote.id} className="group bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col">
                    {/* Card Header */}
                    <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold tracking-wider uppercase">
                          {t("votes.idBadge")} {vote.id}
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
                          <Calendar size={14} />
                          {new Date(vote.createdAt).toLocaleDateString(lang, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-slate-400" />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {vote.totalVotes} {t("votes.votesCount")}
                        </span>
                      </div>
                    </div>

                    {/* Comparison Body */}
                    <div className="p-6 flex-grow">
                      <div className="relative flex gap-4 md:gap-6 items-center">
                        {/* Image One Card */}
                        <div className={`flex-1 flex flex-col items-center gap-3 transition-transform duration-300 ${isOneWinner ? "scale-105" : "grayscale-[0.4] opacity-80"}`}>
                          <div className={`relative w-full aspect-square rounded-3xl overflow-hidden shadow-lg border-4 ${isOneWinner ? "border-amber-400 shadow-amber-400/20" : "border-slate-200 dark:border-slate-700"}`}>
                            <img
                              src={formatImageUrl(vote.imageOne.url)}
                              alt={t("votes.optionOne")}
                              className="w-full h-full object-cover"
                            />
                            {isOneWinner && (
                              <div className="absolute top-3 left-3 bg-amber-400 text-white p-1.5 rounded-xl shadow-lg ring-4 ring-amber-400/20">
                                <Trophy size={16} fill="white" />
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                              <div className="flex items-center justify-between text-white">
                                <div className="flex items-center gap-1 text-xs font-bold">
                                  <User size={12} />
                                  {t(`adminImages.gender.${vote.imageOne.gender}`)}, {t(`adminImages.age.${vote.imageOne.age}`)}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                              {percentOne}%
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                              {vote.imageOneVotes} {t("votes.votesCount")}
                            </span>
                          </div>
                        </div>

                        {/* VS Divider */}
                        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
                          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center border-4 border-slate-50 dark:border-slate-900 rotate-45 group-hover:rotate-[225deg] transition-transform duration-700">
                            <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 -rotate-45 group-hover:-rotate-[225deg] transition-transform duration-700">VS</span>
                          </div>
                        </div>

                        <div className="md:hidden flex items-center justify-center font-black text-slate-300 dark:text-slate-600 italic">VS</div>

                        {/* Image Two Card */}
                        <div className={`flex-1 flex flex-col items-center gap-3 transition-transform duration-300 ${isTwoWinner ? "scale-105" : "grayscale-[0.4] opacity-80"}`}>
                          <div className={`relative w-full aspect-square rounded-3xl overflow-hidden shadow-lg border-4 ${isTwoWinner ? "border-amber-400 shadow-amber-400/20" : "border-slate-200 dark:border-slate-700"}`}>
                            <img
                              src={formatImageUrl(vote.imageTwo.url)}
                              alt={t("votes.optionTwo")}
                              className="w-full h-full object-cover"
                            />
                            {isTwoWinner && (
                              <div className="absolute top-3 right-3 bg-amber-400 text-white p-1.5 rounded-xl shadow-lg ring-4 ring-amber-400/20">
                                <Trophy size={16} fill="white" />
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-right">
                              <div className="flex items-center justify-end text-white">
                                <div className="flex items-center gap-1 text-xs font-bold">
                                  {t(`adminImages.gender.${vote.imageTwo.gender}`)}, {t(`adminImages.age.${vote.imageTwo.age}`)}
                                  <User size={12} />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                              {percentTwo}%
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                              {vote.imageTwoVotes} {t("votes.votesCount")}
                            </span>
                          </div>
                        </div>
                      </div>

                 
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex justify-center bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
              <Pagination
                currentPage={currentPage}
                totalPages={votesResponse.totalPages}
                onPageChange={handlePageChange}
                totalItems={votesResponse.total}
                rowsPerPage={rowsPerPage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
