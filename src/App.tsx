// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLanguage } from "./hooks/useLanguage";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
 import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
 import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import {
  ProtectedRoute,
  PublicRoute,
} from "./components/common/ProtectedRoute/ProtectedRoute";
import ToastProvider from "./components/common/ToastProvider/ToastProvider";
 
import VotesPage from "./pages/Votes/VotesPage";
import AdminImagesPage from "./pages/AdminImages/AdminImagesPage";
import CreateAdminImagePage from "./pages/AdminImages/CreateAdminImagePage";
import DeletedImagesPage from "./pages/AdminImages/DeletedImagesPage";
import UsersPage from "./pages/users/UsersPage";
import SubAdminsPage from "./pages/SubAdmins/SubAdminsPage";
import CreateSubAdminPage from "./pages/SubAdmins/CreateSubAdminPage";
import PrivacyPage from "./pages/StaticPages/PrivacyPage";
import TermsPage from "./pages/StaticPages/TermsPage";
import ContactUsPage from "./pages/ContactUs/ContactUsPage";
import ReportsPage from "./pages/Reports/ReportsPage";
import SubscriptionsPage from "./pages/Subscriptions/SubscriptionsPage";
import PromoCodesPage from "./pages/PromoCodes/PromoCodesPage";
import CreatePromoCodePage from "./pages/PromoCodes/CreatePromoCodePage";
import UpdatePromoCodePage from "./pages/PromoCodes/UpdatePromoCodePage";
import AppealsPage from "./pages/Appeals/AppealsPage";
import ImageLevelPage from "./pages/AdminImages/ImageLevelPage";
import MerchantsPage from "./pages/Merchants/MerchantsPage";
import CreateMerchantPage from "./pages/Merchants/CreateMerchantPage";
import NotificationsPage from "./pages/Notifications/NotificationsPage";

export default function App() {
  useLanguage();

  return (
    <>
      {/* Toast Provider Component */}
      <ToastProvider />

      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <SignIn />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Home />} />
 
            <Route path="votes" element={<VotesPage />} />
            <Route path="admin-images" element={<AdminImagesPage />} />
            <Route path="admin-images/create" element={<CreateAdminImagePage />} />
            <Route path="admin-images/deleted" element={<DeletedImagesPage />} />
            <Route path="admin-images/level" element={<ImageLevelPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="subadmins" element={<SubAdminsPage />} />
            <Route path="subadmins/create" element={<CreateSubAdminPage />} />
            <Route path="privacy-policy" element={<PrivacyPage />} />
            <Route path="terms-conditions" element={<TermsPage />} />
            <Route path="contact-us" element={<ContactUsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="promo-codes" element={<PromoCodesPage />} />
            <Route path="promo-codes/create" element={<CreatePromoCodePage />} />
            <Route path="promo-codes/edit/:id" element={<UpdatePromoCodePage />} />
            <Route path="merchants" element={<MerchantsPage />} />
            <Route path="merchants/create" element={<CreateMerchantPage />} />
            <Route path="appeals" element={<AppealsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />

        
            <Route path="alerts" element={<Alerts />} />
            <Route path="avatars" element={<Avatars />} />
            <Route path="badge" element={<Badges />} />
            <Route path="buttons" element={<Buttons />} />
            <Route path="images" element={<Images />} />
            <Route path="videos" element={<Videos />} />
            <Route path="line-chart" element={<LineChart />} />
            <Route path="bar-chart" element={<BarChart />} />
          </Route>

          </Routes>
      </Router>
    </>
  );
}
