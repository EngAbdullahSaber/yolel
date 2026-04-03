import { Check, X, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
  type?: "success" | "warning" | "info";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isLoading = false,
  type = "info",
}: ConfirmDialogProps) {
  if (!isOpen) return null;
  const { t } = useTranslation();

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
          iconBorder: "border-emerald-200 dark:border-emerald-800/50",
          iconColor: "text-emerald-600 dark:text-emerald-400",
          buttonBg: "bg-gradient-to-br from-emerald-600 to-emerald-700",
          buttonShadow: "shadow-emerald-500/30",
          glow: "from-emerald-500/30 via-teal-500/30 to-emerald-500/30",
        };
      case "warning":
        return {
          iconBg: "bg-amber-50 dark:bg-amber-950/30",
          iconBorder: "border-amber-200 dark:border-amber-800/50",
          iconColor: "text-amber-600 dark:text-amber-400",
          buttonBg: "bg-gradient-to-br from-amber-600 to-amber-700",
          buttonShadow: "shadow-amber-500/30",
          glow: "from-amber-500/30 via-orange-500/30 to-amber-500/30",
        };
      default:
        return {
          iconBg: "bg-blue-50 dark:bg-blue-950/30",
          iconBorder: "border-blue-200 dark:border-blue-800/50",
          iconColor: "text-blue-600 dark:text-blue-400",
          buttonBg: "bg-gradient-to-br from-blue-600 to-blue-700",
          buttonShadow: "shadow-blue-500/30",
          glow: "from-blue-500/30 via-indigo-500/30 to-blue-500/30",
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => !isLoading && onClose()}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative top border */}
        <div className={`h-1.5 ${colors.buttonBg}`}></div>

        <div className="p-8 space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${colors.glow} rounded-full blur-2xl animate-pulse`}></div>
              <div className={`relative w-20 h-20 rounded-3xl ${colors.iconBg} border-2 ${colors.iconBorder} flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-500 shadow-xl`}>
                {type === "success" ? <Check size={36} className={colors.iconColor} /> : <HelpCircle size={36} className={colors.iconColor} />}
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {title}
            </h3>
            <div className="space-y-3">
              <p className="text-slate-600 dark:text-slate-400 font-medium">
                {description}
              </p>
              {itemName && (
                <div className="inline-block px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 font-bold text-slate-900 dark:text-white shadow-sm">
                  {itemName}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {t("common.cancel") || "Cancel"}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 py-4 ${colors.buttonBg} text-white font-black rounded-2xl shadow-xl ${colors.buttonShadow} transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Check size={20} />
                  {t("common.confirm") || "Confirm"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
