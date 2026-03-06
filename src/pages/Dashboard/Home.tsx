import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Users,
  Image as ImageIcon,
  Vote,
  Trash2,
  Flag,
  CreditCard,
  Ticket,
  Activity,
  Layers,
} from "lucide-react";
import { GetSpecifiedMethod } from "../../services/apis/ApiMethod";
import PageMeta from "../../components/common/PageMeta";
import Chart from "react-apexcharts";

interface ImageStats {
  male: number;
  female: number;
  old: number;
  youth: number;
  child: number;
}

interface DashboardStats {
  users: number;
  images: ImageStats;
  votes: number;
  deletedImages: number;
  reports: number;
  userSubscriptions: number;
  promoCodes: number;
}

interface DashboardResponse {
  code: number;
  data: {
    all: DashboardStats;
    lastMonth: DashboardStats;
    lastWeek: DashboardStats;
  };
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const [period, setPeriod] = useState<"all" | "lastMonth" | "lastWeek">("all");

  const { data: response, isLoading, isError } = useQuery<DashboardResponse>({
    queryKey: ["dashboard-stats", lang],
    queryFn: () => GetSpecifiedMethod("/statics/dashboard", lang),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="relative inline-block">
          <div className="h-16 w-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
          <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={24} />
        </div>
      </div>
    );
  }

  if (isError || !response) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="inline-flex p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full mb-4">
          <Flag size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t("common.error")}</h3>
        <p className="text-slate-500 dark:text-slate-400">Failed to load dashboard statistics. Please try refreshing the page.</p>
      </div>
    );
  }

  const stats = response.data[period];
  const totalImages = stats.images.male + stats.images.female;

  return (
    <>
      <PageMeta
        title="Dashboard | YolelAdmin"
        description="System Overview and Real-time Statistics"
      />
      
      <div className="space-y-8 pb-10">
        {/* Header & Period Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/20">
              <Layers size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("dashboard.title") || "Dashboard"}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {t("dashboard.subtitle") || "Insights and key performance metrics"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            {(["all", "lastMonth", "lastWeek"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  period === p
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-md"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {t(`dashboard.periods.${p}`) || (p === "all" ? "All Time" : p === "lastMonth" ? "Last Month" : "Last Week")}
              </button>
            ))}
          </div>
        </div>

        {/* Top Tier Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Users size={24} />}
            label={t("dashboard.stats.users") || "Total Users"}
            value={stats.users}
            color="blue"
          />
          <StatCard
            icon={<ImageIcon size={24} />}
            label={t("dashboard.stats.images") || "Total Images"}
            value={totalImages}
            color="indigo"
          />
          <StatCard
            icon={<Vote size={24} />}
            label={t("dashboard.stats.votes") || "Total Votes"}
            value={stats.votes}
            color="emerald"
          />
          <StatCard
            icon={<Flag size={24} />}
            label={t("dashboard.stats.reports") || "Active Reports"}
            value={stats.reports}
            color="rose"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatCard
            icon={<Trash2 size={24} />}
            label={t("dashboard.stats.deleted") || "Deleted Images"}
            value={stats.deletedImages}
            color="orange"
          />
          <StatCard
            icon={<CreditCard size={24} />}
            label={t("dashboard.stats.subscriptions") || "Subscriptions"}
            value={stats.userSubscriptions}
            color="purple"
          />
          <StatCard
            icon={<Ticket size={24} />}
            label={t("dashboard.stats.promoCodes") || "Promo Codes"}
            value={stats.promoCodes}
            color="cyan"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Gender Distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700/50">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">
              {t("dashboard.charts.gender") || "Visual Distribution"}
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 w-full">
                <Chart
                  type="donut"
                  height={320}
                  series={[stats.images.male, stats.images.female]}
                  options={{
                    labels: [t("common.male"), t("common.female")],
                    colors: ["#3b82f6", "#ec4899"],
                    stroke: { show: false },
                    legend: { 
                      position: "bottom",
                      fontFamily: "inherit",
                      fontWeight: 600,
                      labels: { colors: lang === 'ar' ? '#94a3b8' : '#64748b' }
                    },
                    plotOptions: {
                      pie: {
                        donut: {
                          size: "75%",
                          labels: {
                            show: true,
                            total: {
                              show: true,
                              label: t("common.total"),
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#64748b",
                              formatter: () => totalImages.toString()
                            },
                            value: {
                              fontSize: "24px",
                              fontWeight: 900,
                              color: lang === 'ar' ? '#f8fafc' : '#0f172a'
                            }
                          }
                        }
                      }
                    },
                    dataLabels: { enabled: false }
                  }}
                />
              </div>
              <div className="flex flex-col gap-4 w-full md:w-48">
                <MiniIndicator 
                  label={t("common.male")} 
                  value={stats.images.male} 
                  percent={Math.round((stats.images.male / (totalImages || 1)) * 100)} 
                  color="bg-blue-500" 
                />
                <MiniIndicator 
                  label={t("common.female")} 
                  value={stats.images.female} 
                  percent={Math.round((stats.images.female / (totalImages || 1)) * 100)} 
                  color="bg-pink-500" 
                />
              </div>
            </div>
          </div>

          {/* Age Distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700/50">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">
              {t("dashboard.charts.age")}
            </h3>
            <Chart
              type="bar"
              height={320}
              series={[
                {
                  name: t("common.count"),
                  data: [stats.images.child, stats.images.youth, stats.images.old]
                }
              ]}
              options={{
                chart: { 
                  toolbar: { show: false },
                  fontFamily: "inherit"
                },
                plotOptions: {
                  bar: {
                    borderRadius: 12,
                    distributed: true,
                    columnWidth: "45%",
                    dataLabels: { position: 'top' }
                  }
                },
                colors: ["#10b981", "#3b82f6", "#f59e0b"],
                xaxis: {
                  categories: [
                    t("adminImages.age.child"),
                    t("adminImages.age.youth"),
                    t("adminImages.age.old")
                  ],
                  axisBorder: { show: false },
                  axisTicks: { show: false },
                  labels: {
                    style: {
                      fontWeight: 700,
                      colors: "#64748b"
                    }
                  }
                },
                yaxis: { show: false },
                grid: { show: false },
                legend: { show: false },
                dataLabels: {
                  enabled: true,
                  offsetY: -25,
                  style: {
                    fontSize: '14px',
                    fontWeight: 900,
                    colors: [lang === 'ar' ? '#f8fafc' : '#334155']
                  }
                },
                tooltip: { theme: 'dark' }
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorMap: Record<string, { bg: string, text: string, iconBg: string }> = {
    blue: { bg: "bg-blue-50/50 dark:bg-blue-900/10", text: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-100 dark:bg-blue-900/30" },
    indigo: { bg: "bg-indigo-50/50 dark:bg-indigo-900/10", text: "text-indigo-600 dark:text-indigo-400", iconBg: "bg-indigo-100 dark:bg-indigo-900/30" },
    emerald: { bg: "bg-emerald-50/50 dark:bg-emerald-900/10", text: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-100 dark:bg-emerald-900/30" },
    rose: { bg: "bg-rose-50/50 dark:bg-rose-900/10", text: "text-rose-600 dark:text-rose-400", iconBg: "bg-rose-100 dark:bg-rose-900/30" },
    orange: { bg: "bg-orange-50/50 dark:bg-orange-900/10", text: "text-orange-600 dark:text-orange-400", iconBg: "bg-orange-100 dark:bg-orange-900/30" },
    purple: { bg: "bg-purple-50/50 dark:bg-purple-900/10", text: "text-purple-600 dark:text-purple-400", iconBg: "bg-purple-100 dark:bg-purple-900/30" },
    cyan: { bg: "bg-cyan-50/50 dark:bg-cyan-900/10", text: "text-cyan-600 dark:text-cyan-400", iconBg: "bg-cyan-100 dark:bg-cyan-900/30" },
  };

  const current = colorMap[color] || colorMap.blue;

  return (
    <div className={`p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group`}>
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-2xl transition-transform duration-500 group-hover:rotate-12 ${current.iconBg} ${current.text}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">
            {value.toLocaleString()}
          </h3>
        </div>
      </div>
    </div>
  );
}

function MiniIndicator({ label, value, percent, color }: { label: string, value: number, percent: number, color: string }) {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-500">{label}</span>
        <span className="text-xs font-black text-slate-900 dark:text-white">{percent}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-2 text-sm font-black text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}
