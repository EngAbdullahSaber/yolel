import StaticPageForm from "./StaticPageForm";
import { useTranslation } from "react-i18next";

export default function TermsPage() {
  const { t } = useTranslation();
  
  return (
    <StaticPageForm 
      pageType="TERMS_AND_CONDITIONS" 
      title={t("sidebar.terms", { defaultValue: "Terms and Conditions" })} 
      subtitle={t("sidebar.termsSubtitle", { defaultValue: "Manage Terms and Conditions Content" })} 
    />
  );
}
