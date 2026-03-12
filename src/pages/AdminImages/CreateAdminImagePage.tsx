import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks/useToast";
import { CreateMethodFormData } from "../../services/apis/ApiMethod";
import {
  Image as ImageIcon,
  Upload,
  ArrowLeft,
  CheckCircle2,
  User,
  Users,
  Loader2,
  X,
} from "lucide-react";

const AGE_OPTIONS = ["child", "teenager", "youth", "old"] as const;
const GENDER_OPTIONS = ["male", "female"] as const;

type Age = (typeof AGE_OPTIONS)[number];
type Gender = (typeof GENDER_OPTIONS)[number];

export default function CreateAdminImagePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [age, setAge] = useState<Age>("youth");
  const [gender, setGender] = useState<Gender>("male");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── File handling ─────────────────────────────────────────── */
  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error(t("adminImages.create.invalidFileType"));
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Submit ─────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error(t("adminImages.create.fileRequired"));
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading(t("adminImages.create.creating"));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("age", age);
      formData.append("gender", gender);

      const response = await CreateMethodFormData("/image/admin", formData, lang);

      if (response) {
        toast.dismiss(loadingToast);
        toast.success(t("adminImages.create.createSuccess"));
        queryClient.invalidateQueries({ queryKey: ["admin-images"] });
        setTimeout(() => navigate("/admin-images"), 1500);
      } else {
        throw new Error(t("adminImages.create.createError"));
      }
    } catch (error: any) {
      console.error("Failed to create image:", error);
      toast.dismiss(loadingToast);
      toast.error(error?.response?.data?.message?.english || error.message || t("adminImages.create.createError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-900/10 dark:to-indigo-900/10 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin-images")}
            className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-3xl shadow-xl shadow-blue-500/20">
              <ImageIcon size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {t("adminImages.create.title")}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">
                {t("adminImages.create.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">

          {/* Image Upload Zone */}
          <div className="p-8 border-b border-slate-100 dark:border-slate-700">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">
              {t("adminImages.create.imageLabel")}
              <span className="text-rose-500 ml-1">*</span>
            </label>

            {!preview ? (
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 py-16 px-8 ${
                  isDragging
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]"
                    : "border-slate-200 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                }`}
              >
                <div className={`p-5 rounded-2xl transition-all duration-300 ${isDragging ? "bg-blue-100 dark:bg-blue-900/40" : "bg-slate-100 dark:bg-slate-700"}`}>
                  <Upload size={32} className={isDragging ? "text-blue-500" : "text-slate-400"} />
                </div>
                <div className="text-center">
                  <p className="text-slate-700 dark:text-slate-200 font-bold text-lg">
                    {isDragging ? t("adminImages.create.dropHere") : t("adminImages.create.dragOrClick")}
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                    {t("adminImages.create.fileHint")}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-600 group">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-80 object-cover"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white/90 backdrop-blur-sm text-slate-800 rounded-xl font-bold text-sm hover:bg-white transition-all"
                  >
                    {t("adminImages.create.changeImage")}
                  </button>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="p-2 bg-rose-500/90 backdrop-blur-sm text-white rounded-xl hover:bg-rose-500 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
                {/* File name badge */}
                <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold rounded-full max-w-[200px] truncate">
                  {file?.name}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="p-8 space-y-8">

            {/* Age Group */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                {t("adminImages.table.age")}
                <span className="text-rose-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {AGE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setAge(option)}
                    className={`relative flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl border-2 font-bold text-sm transition-all duration-200 ${
                      age === option
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-lg shadow-blue-500/10"
                        : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                    }`}
                  >
                    {age === option && (
                      <CheckCircle2 size={14} className="absolute top-2 right-2 text-blue-500" />
                    )}
                    <span className="text-2xl">
                      {option === "old" ? "👴" : option === "youth" ? "🧑" : option === "teenager" ? "🧒" : "👶"}
                    </span>
                    <span className="capitalize">{t(`adminImages.age.${option}`)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                {t("adminImages.table.gender")}
                <span className="text-rose-500 ml-1">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                {GENDER_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setGender(option)}
                    className={`relative flex items-center justify-center gap-3 py-5 rounded-2xl border-2 font-bold text-sm transition-all duration-200 ${
                      gender === option
                        ? option === "female"
                          ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 shadow-lg shadow-pink-500/10"
                          : "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 shadow-lg shadow-indigo-500/10"
                        : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/40"
                    }`}
                  >
                    {gender === option && (
                      <CheckCircle2
                        size={14}
                        className={`absolute top-2 right-2 ${option === "female" ? "text-pink-500" : "text-indigo-500"}`}
                      />
                    )}
                    {option === "male" ? (
                      <User size={20} />
                    ) : (
                      <Users size={20} />
                    )}
                    <span className="capitalize text-base">{t(`adminImages.gender.${option}`)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate("/admin-images")}
                disabled={isLoading}
                className="flex-1 py-4 rounded-2xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={isLoading || !file}
                className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {t("adminImages.create.creating")}
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    {t("adminImages.create.submit")}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
