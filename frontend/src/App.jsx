import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChatModal from './components/ChatModal';
import ForgotPassword from './components/ForgotPassword';
import NgoDashboard from './components/NGO/NgoDashboard';
import PostedNeeds from './components/NGO/postedNeeds';
import PendingDonations from './components/NGO/pendingDonations';
import DonationsList from './components/NGO/donationsList';
import NGOStatistics from './components/NGO/NGOStatistics';
import VolunteerApplication from './components/NGO/VolunteerApplication';
import Reports from './components/NGO/Reports';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import ResetPassword from './components/ResetPassword';
import ScrollToTop from './components/common/ScrollToTop';
import { UserProvider } from './context/UserContext';
import IndividualDashboard from './pages/Donor/IndividualDonor/DashboardIndividual';
import DonationForm from './pages/Donor/OrganizationalDonor/DonationForm';
import NeedDetail from './pages/Donor/IndividualDonor/NeedDetail';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFound';
import RegisterPage from './pages/RegisterPage';
import VerifyEmail from './pages/VerifyEmailPage';
import VerifyOtp from './pages/VerifyOtpPage';
import AdminDashboard from './pages/admin/Dashboard';
import UserDetail from './pages/admin/UserDetail/UserDetail';
import PostDetail from './pages/admin/PostDetail/PostDetail';
import Users from './pages/admin/Users';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import { Provider } from 'react-redux';
import { ChatProvider } from './context/ChatContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import AccountPage from './pages/profile/AccountPage';
import UserProfilePage from './pages/profile/UserProfilePage';
import { store } from './redux/store';
import NGOReportViewer from './components/NGO/NGOReport';
import PaymentSuccess from './pages/Donor/IndividualDonor/PaymentSuccess';
import AdminAcccountPage from './pages/admin/AdminAccountPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import CertificatesPage from './pages/certificates/CertificatesPage';
import Newsletter from './pages/admin/Newsletter';
import UnsubscribePage from './pages/admin/newsletter/UnsubscribePage';
import Posts from './pages/admin/Posts';

function App() {
  return (
    <Provider store={store}>
      <div>
        <UserProvider>
          <SocketProvider>
            <ChatProvider>
              <NotificationProvider>
                <ScrollToTop />
                <ToastContainer />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/verify-otp" element={<VerifyOtp />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route
                    path="/unsubscribe/:email"
                    element={<UnsubscribePage />}
                  />
                  <Route element={<PrivateRoute />}>
                    {/* donor routes */}

                    <Route
                      path="/donor/dashboard"
                      element={<IndividualDashboard />}
                    />
                    <Route path="/donor/NeedDetail" element={<NeedDetail />} />
                    <Route
                      element={
                        <RoleBasedRoute allowedRoles={['organization_donor']} />
                      }
                    >
                      <Route path="/post-donation" element={<DonationForm />} />
                    </Route>
                    <Route
                      path="/donor/payment-success"
                      element={<PaymentSuccess />}
                    />
                    <Route
                      path="/certificates"
                      element={<CertificatesPage />}
                    />

                    {/* ngo routes */}

                    <Route element={<RoleBasedRoute allowedRoles={['ngo']} />}>
                      <Route path="/ngo/dashboard" element={<NgoDashboard />}>
                        <Route index element={<NGOStatistics />} />
                        <Route path="needs" element={<PostedNeeds />} />
                        <Route path="donations" element={<DonationsList />} />
                        <Route
                          path="pending-donations"
                          element={<PendingDonations />}
                        />
                        <Route
                          path="volunteers"
                          element={<VolunteerApplication />}
                        />
                        <Route path="reports" element={<Reports />} />
                      </Route>
                    </Route>

                    <Route path="/chat" element={<ChatModal />} />
                    <Route path="/report/:id" element={<NGOReportViewer />} />
                    <Route
                      path="/volunteer/dashboard"
                      element={<VolunteerDashboard />}
                    />

                    {/* admin routes */}

                    <Route
                      element={<RoleBasedRoute allowedRoles={['admin']} />}
                    >
                      <Route
                        path="/admin/dashboard"
                        element={<AdminDashboard />}
                      />
                      <Route path="/admin/users" element={<Users />} />
                      <Route path="/admin/users/:id" element={<UserDetail />} />
                      <Route path="/admin/posts" element={<Posts />} />
                      <Route path="/admin/posts/:id" element={<PostDetail />} />
                      <Route
                        path="/admin/newsletter"
                        element={<Newsletter />}
                      />
                      <Route
                        path="/admin/profile"
                        element={<AdminProfilePage />}
                      />
                      <Route
                        path="/admin/account/settings"
                        element={<AdminAcccountPage />}
                      />
                    </Route>

                    {/* profile routes */}
                    <Route path="/profile" element={<UserProfilePage />} />
                    <Route path="/account/settings" element={<AccountPage />} />
                  </Route>

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </NotificationProvider>
            </ChatProvider>
          </SocketProvider>
        </UserProvider>
      </div>
    </Provider>
  );
}

export default App;
