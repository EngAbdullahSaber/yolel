import StaticPageForm from "./StaticPageForm";
import { useTranslation } from "react-i18next";

export default function PrivacyPage() {
  const { t } = useTranslation();
  
  return (
    <StaticPageForm 
      pageType="PRIVACY" 
      title={t("sidebar.privacy", { defaultValue: "Privacy Policy" })} 
      subtitle={t("sidebar.privacySubtitle", { defaultValue: "Manage Privacy Policy Content" })} 
    />
  );
}
