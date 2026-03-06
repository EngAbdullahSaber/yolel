import { AlertCircle, CheckCircle2, Info, X, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "success" | "warning" | "danger";
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  type = "info",
  isLoading = false,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;
  const { t } = useTranslation();

  const getTheme = () => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />,
          bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
          borderColor: "border-emerald-200 dark:border-emerald-800/50",
          btnColor: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30",
          accentColor: "bg-emerald-500/10",
        };
      case "warning":
        return {
          icon: <AlertCircle size={32} className="text-amber-600 dark:text-amber-400" />,
          bgColor: "bg-amber-50 dark:bg-amber-950/30",
          borderColor: "border-amber-200 dark:border-amber-800/50",
          btnColor: "bg-amber-600 hover:bg-amber-700 shadow-amber-500/30",
          accentColor: "bg-amber-500/10",
        };
      case "danger":
        return {
          icon: <AlertCircle size={32} className="text-rose-600 dark:text-rose-400" />,
          bgColor: "bg-rose-50 dark:bg-rose-950/30",
          borderColor: "border-rose-200 dark:border-rose-800/50",
          btnColor: "bg-rose-600 hover:bg-rose-700 shadow-rose-500/30",
          accentColor: "bg-rose-500/10",
        };
      default:
        return {
          icon: <HelpCircle size={32} className="text-blue-600 dark:text-blue-400" />,
          bgColor: "bg-blue-50 dark:bg-blue-950/30",
          borderColor: "border-blue-200 dark:border-blue-800/50",
          btnColor: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30",
          accentColor: "bg-blue-500/10",
        };
    }
  };

  const theme = getTheme();

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all group disabled:opacity-50"
        >
          <X size={20} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
        </button>

        <div className="p-8 space-y-6">
          <div className="flex justify-center">
            <div className={`w-20 h-20 rounded-[2rem] ${theme.bgColor} border-2 ${theme.borderColor} flex items-center justify-center relative`}>
               <div className={`absolute inset-0 rounded-[1.8rem] ${theme.accentColor} animate-pulse`} />
               {theme.icon}
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-[1.5rem] font-bold transition-all disabled:opacity-50"
            >
              {cancelText || t("common.Cancel")}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 px-6 py-4 ${theme.btnColor} text-white rounded-[1.5rem] font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                 confirmText || t("common.confirm")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
