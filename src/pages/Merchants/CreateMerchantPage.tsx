import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Store, 
  Mail, 
  Lock, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  ShoppingBag,
  ShieldCheck
} from "lucide-react";
import { CreateMethod } from "../../services/apis/ApiMethod";
import PageMeta from "../../components/common/PageMeta";
import { toast } from "react-hot-toast";

export default function CreateMerchantPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language || "en";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => CreateMethod("user/merchant", data, lang),
    onSuccess: () => {
      toast.success(t("merchants.create.form.success") || "Merchant created successfully!");
      navigate("/merchants");
    },
    onError: (error: any) => {
      console.error("Error creating merchant:", error);
      toast.error(t("merchants.create.form.error") || "Failed to create merchant. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error(t("common.messages.fillAllFields") || "Please fill all fields");
      return;
    }
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900/10 p-4 md:p-8">
      <PageMeta 
        title={`${t("merchants.createTitle") || "Create Merchant"} | YolelAdmin`}
        description="Add a new merchant account to the system"
      />

      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/merchants"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-black text-slate-500 hover:text-indigo-600 transition-colors mb-8 group"
        >
          <div className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm group-hover:shadow group-hover:-translate-x-1 transition-all">
            <ArrowLeft size={18} />
          </div>
          {t("merchants.page.back") || "Back to Merchants"}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
              <div className="p-4 bg-gradient-to-tr from-indigo-600 to-indigo-800 rounded-3xl shadow-xl shadow-indigo-500/20 w-fit mb-6 transform -rotate-3">
                <ShoppingBag size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight mb-4">
                {t("merchants.create.title") || "Add New Merchant"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                {t("merchants.create.description") || "Create a new merchant account with contact information and security settings."}
              </p>

              <div className="space-y-4">
                {[
                  { icon: <ShieldCheck size={18} />, text: "Verified Store System" },
                  { icon: <Store size={18} />, text: "Full Catalog Management" },
                  { icon: <Mail size={18} />, text: "Email Communication" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <div className="text-indigo-500">{item.icon}</div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-2">
            <form 
              onSubmit={handleSubmit}
              className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700"
            >
              <div className="space-y-8">
                {/* Store Name */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    {t("merchants.table.name") || "Store Name"}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <Store size={20} />
                    </div>
                    <input
                      required
                      type="text"
                      name="name"
                      placeholder="e.g. Fashion Haven"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    {t("merchants.table.email") || "Email Address"}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <Mail size={20} />
                    </div>
                    <input
                      required
                      type="email"
                      name="email"
                      placeholder="merchant@example.com"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                    {t("subAdmins.form.password") || "Password"}
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <Lock size={20} />
                    </div>
                    <input
                      required
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-base font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white rounded-3xl font-black text-lg shadow-2xl shadow-indigo-500/40 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:grayscale disabled:pointer-events-none"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        {t("merchants.create.form.loading") || "Creating Account..."}
                      </>
                    ) : (
                      <>
                        <PlusCircle size={22} />
                        {t("merchants.create.form.submit") || "Create Merchant Account"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const PlusCircle = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);
