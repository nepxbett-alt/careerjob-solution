import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PublicLayout from './components/layout/PublicLayout';
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import AboutPage from './pages/AboutPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ForBusinessesPage from './pages/ForBusinessesPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import FaqPage from './pages/FaqPage';
import NotFoundPage from './pages/NotFoundPage';
import CandidateLayout from './components/layout/CandidateLayout';
import CandidateHome from './pages/candidate/HomePage';
import CandidateApplications from './pages/candidate/ApplicationsPage';
import CandidateProfile from './pages/candidate/ProfilePage';
import CandidateSaved from './pages/candidate/SavedJobsPage';
import BusinessLayout from './components/layout/BusinessLayout';
import BusinessHome from './pages/business/BusinessHome';
import BusinessRequest from './pages/business/HiringRequestPage';
import BusinessRequests from './pages/business/RequestsPage';
import BusinessProfile from './pages/business/BusinessProfilePage';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/DashboardPage';
import AdminCandidates from './pages/admin/CandidatesPage';
import AdminJobs from './pages/admin/JobsPage';
import AdminApplications from './pages/admin/ApplicationsPage';
import AdminBusinesses from './pages/admin/BusinessesPage';
import AdminInterviews from './pages/admin/InterviewsPage';
import AdminPlacements from './pages/admin/PlacementsPage';
import AdminAccounting from './pages/admin/AccountingPage';
import AdminSettings from './pages/admin/SettingsPage';
import AdminWalkIn from './pages/admin/WalkInPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/for-businesses" element={<ForBusinessesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/faq" element={<FaqPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Candidate */}
        <Route
          path="/candidate"
          element={
            <ProtectedRoute allowedRoles={['candidate']}>
              <CandidateLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CandidateHome />} />
          <Route path="applications" element={<CandidateApplications />} />
          <Route path="saved" element={<CandidateSaved />} />
          <Route path="profile" element={<CandidateProfile />} />
        </Route>

        {/* Business */}
        <Route
          path="/business"
          element={
            <ProtectedRoute allowedRoles={['business']}>
              <BusinessLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<BusinessHome />} />
          <Route path="request" element={<BusinessRequest />} />
          <Route path="requests" element={<BusinessRequests />} />
          <Route path="profile" element={<BusinessProfile />} />
        </Route>

        {/* Admin / Staff */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['owner', 'admin', 'recruiter', 'staff', 'accountant', 'viewer']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="candidates" element={<AdminCandidates />} />
          <Route path="walk-in" element={<AdminWalkIn />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="businesses" element={<AdminBusinesses />} />
          <Route path="interviews" element={<AdminInterviews />} />
          <Route path="placements" element={<AdminPlacements />} />
          <Route path="accounting" element={<AdminAccounting />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
