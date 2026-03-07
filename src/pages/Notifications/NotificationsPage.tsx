import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { Bell, Send, RefreshCw, Smartphone, AlertCircle, CheckCircle2 } from "lucide-react";
import { CreateMethod } from "../../services/apis/ApiMethod";
import { ConfirmationDialog } from "../../components/shared/ConfirmationDialog";

export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isUpdatingApp, setIsUpdatingApp] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  // Form state for broadcast notification
  const [broadcastForm, setBroadcastForm] = useState({
    titleAr: "",
    titleEn: "",
    descAr: "",
    descEn: "",
  });

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.titleAr || !broadcastForm.titleEn || !broadcastForm.descAr || !broadcastForm.descEn) {
      toast.error(t("common.required"));
      return;
    }

    setIsBroadcasting(true);
    const loadingToast = toast.loading(t("notifications.broadcast.sending"));

    try {
      const payload = {
        title: {
          arabic: broadcastForm.titleAr,
          english: broadcastForm.titleEn,
        },
        description: {
          arabic: broadcastForm.descAr,
          english: broadcastForm.descEn,
        },
      };

      const result = await CreateMethod("/user-notification/admin/broadcast", payload, lang);

      if (result) {
        toast.success(t("notifications.broadcast.success"));
        setBroadcastForm({ titleAr: "", titleEn: "", descAr: "", descEn: "" });
      }
    } catch (error) {
      console.error("Broadcast error:", error);
      toast.error(t("notifications.broadcast.error"));
    } finally {
      setIsBroadcasting(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleAppUpdateConfirm = async () => {
    setShowUpdateDialog(false);
    setIsUpdatingApp(true);
    const loadingToast = toast.loading(t("notifications.appUpdate.sending"));

    try {
      const result = await CreateMethod("/user-notification/admin/app-update", {}, lang);
      if (result) {
        toast.success(t("notifications.appUpdate.success"));
      }
    } catch (error) {
      console.error("App update error:", error);
      toast.error(t("notifications.appUpdate.error"));
    } finally {
      setIsUpdatingApp(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
              <Bell size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("notifications.title")}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
                {t("notifications.subtitle")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Broadcast Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 overflow-hidden">
              <div className="p-8 border-b border-slate-50 dark:border-slate-700/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
                <div className="flex items-center gap-3 mb-1">
                  <Send className="text-blue-600 dark:text-blue-400" size={20} />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t("notifications.broadcast.title")}
                  </h2>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  {t("notifications.broadcast.description")}
                </p>
              </div>

              <form onSubmit={handleBroadcastSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  {/* Arabic Inputs */}
                  <div className="space-y-4 p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/30">
                    <h3 className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {t("notifications.form.langAr")}
                    </h3>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                        {t("notifications.form.titleAr")}
                      </label>
                      <input
                        dir="rtl"
                        type="text"
                        value={broadcastForm.titleAr}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, titleAr: e.target.value })}
                        placeholder={t("notifications.form.titlePlaceholderAr")}
                        className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                        {t("notifications.form.descAr")}
                      </label>
                      <textarea
                        dir="rtl"
                        rows={3}
                        value={broadcastForm.descAr}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, descAr: e.target.value })}
                        placeholder={t("notifications.form.descPlaceholderAr")}
                        className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white resize-none"
                      />
                    </div>
                  </div>

                  {/* English Inputs */}
                  <div className="space-y-4 p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/30">
                    <h3 className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {t("notifications.form.langEn")}
                    </h3>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                        {t("notifications.form.titleEn")}
                      </label>
                      <input
                        type="text"
                        value={broadcastForm.titleEn}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, titleEn: e.target.value })}
                        placeholder={t("notifications.form.titlePlaceholderEn")}
                        className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                        {t("notifications.form.descEn")}
                      </label>
                      <textarea
                        rows={3}
                        value={broadcastForm.descEn}
                        onChange={(e) => setBroadcastForm({ ...broadcastForm, descEn: e.target.value })}
                        placeholder={t("notifications.form.descPlaceholderEn")}
                        className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-900 dark:text-white resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isBroadcasting}
                    className="group relative px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-3"
                  >
                    {isBroadcasting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>{t("notifications.broadcast.sending")}</span>
                      </>
                    ) : (
                      <>
                        <span>{t("notifications.broadcast.send")}</span>
                        <Send className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* App Update Section */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700/50 overflow-hidden group">
              <div className="p-8 border-b border-slate-50 dark:border-slate-700/50 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10">
                <div className="flex items-center gap-3 mb-1">
                  <Smartphone className="text-indigo-600 dark:text-indigo-400" size={20} />
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t("notifications.appUpdate.title")}
                  </h2>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  {t("notifications.appUpdate.description")}
                </p>
              </div>

              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-24 h-24 mb-6 rounded-[2rem] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 transform group-hover:scale-110 transition-transform duration-500">
                  <RefreshCw size={40} className={isUpdatingApp ? "animate-spin" : ""} />
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-2 justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <CheckCircle2 size={16} />
                    {t("notifications.appUpdate.alertInfo")}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {t("notifications.appUpdate.alertBody")}
                  </p>
                </div>

                <button
                  onClick={() => setShowUpdateDialog(true)}
                  disabled={isUpdatingApp}
                  className="w-full py-4 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-2xl border-2 border-slate-100 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
                >
                  <RefreshCw size={18} className={isUpdatingApp ? "animate-spin" : ""} />
                  {isUpdatingApp ? t("notifications.appUpdate.sending") : t("notifications.appUpdate.send")}
                </button>
              </div>
            </div>

            {/* Info Card */}
            <div className="p-6 rounded-[2rem] bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
              <div className="flex gap-3">
                <AlertCircle className="text-amber-600 dark:text-amber-500 shrink-0" size={20} />
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400 leading-tight">
                    {t("notifications.bestPractices.title")}
                  </h4>
                  <ul className="text-xs text-amber-800/70 dark:text-amber-500/70 space-y-1 ml-4 list-disc font-medium">
                    <li>{t("notifications.bestPractices.item1")}</li>
                    <li>{t("notifications.bestPractices.item2")}</li>
                    <li>{t("notifications.bestPractices.item3")}</li>
                    <li>{t("notifications.bestPractices.item4")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for App Update */}
      <ConfirmationDialog
        isOpen={showUpdateDialog}
        onClose={() => setShowUpdateDialog(false)}
        onConfirm={handleAppUpdateConfirm}
        title={t("notifications.appUpdate.dialogTitle")}
        description={t("notifications.appUpdate.dialogDescription")}
        confirmText={t("common.confirm")}
        cancelText={t("common.cancel")}
        type="warning"
      />
    </div>
  );
}
