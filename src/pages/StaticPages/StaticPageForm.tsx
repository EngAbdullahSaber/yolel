"use client";
import { useState, useEffect } from "react";
import { Save, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks/useToast";
import { apiClient } from "../../services/axios";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "../../index.css"; // assuming tailwind

interface StaticPageFormProps {
  pageType: "PRIVACY" | "TERMS_AND_CONDITIONS";
  title: string;
  subtitle: string;
}

export default function StaticPageForm({ pageType, title, subtitle }: StaticPageFormProps) {
  const { t } = useTranslation();
  const toast = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  const [contentArabic, setContentArabic] = useState("");
  const [contentEnglish, setContentEnglish] = useState("");
  const [contentSpanish, setContentSpanish] = useState("");

  useEffect(() => {
    fetchData();
  }, [pageType]);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const response = await apiClient.get<any>(`/static-view/${pageType}`);
      const data = response.data?.data || response.data;
      if (data) {
        setContentArabic(data.contentArabic || "");
        setContentEnglish(data.contentEnglish || "");
        setContentSpanish(data.contentSpanish || "");
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error(t("messages.error") || "Failed to fetch data");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading(t("common.saving") || "Saving...");

    try {
      const payload = {
        type: pageType,
        contentArabic,
        contentEnglish,
        contentSpanish,
      };

      await apiClient.put("/static-view", payload);
      toast.dismiss(loadingToast);
      toast.success(t("messages.success") || "Saved successfully");
    } catch (error: any) {
      console.error("Failed to update:", error);
      toast.dismiss(loadingToast);
      toast.error(t("messages.error") || "Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="flex justify-center p-8">{t("common.loading") || "Loading..."}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-slate-100 dark:via-indigo-100 dark:to-purple-100 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
          <div className="mb-6 rounded-md bg-amber-50 dark:bg-amber-900/30 p-4 border border-amber-200 dark:border-amber-800">
             <p className="text-amber-800 dark:text-amber-300 text-sm">
                {t("staticPages.disclaimer", { defaultValue: "Ensure you fill in content for all languages to provide the best user experience." })}
             </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-12">
            
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("staticPages.arabicContent", { defaultValue: "Arabic Content (محتوى عربي)" })}
              </label>
              <div className="rounded-lg shadow-sm">
                <ReactQuill 
                  theme="snow" 
                  value={contentArabic} 
                  onChange={setContentArabic} 
                  className="h-64"
                />
              </div>
            </div>

            <div className="space-y-3 pt-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("staticPages.englishContent", { defaultValue: "English Content" })}
              </label>
              <div className="rounded-lg shadow-sm">
                <ReactQuill 
                  theme="snow" 
                  value={contentEnglish} 
                  onChange={setContentEnglish} 
                  className="h-64"
                />
              </div>
            </div>

            <div className="space-y-3 pt-6">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t("staticPages.spanishContent", { defaultValue: "Spanish Content" })}
              </label>
              <div className="rounded-lg shadow-sm">
                <ReactQuill 
                  theme="snow" 
                  value={contentSpanish} 
                  onChange={setContentSpanish} 
                  className="h-64"
                />
              </div>
            </div>

            <div className="pt-12 mt-12 flex justify-end gap-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {isLoading ? (t("common.saving") || "Saving...") : (t("common.save") || "Save Changes")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
