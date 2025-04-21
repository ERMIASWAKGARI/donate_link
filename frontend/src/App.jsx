import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChatModal from './components/ChatModal';
import ForgotPassword from './components/ForgotPassword';
import NgoDashboard from './components/NGO/NgoDashboard';
import PrivateRoute from './components/PrivateRoute';
import ResetPassword from './components/ResetPassword';
import ScrollToTop from './components/common/ScrollToTop';
import { UserProvider } from './context/UserContext';
import IndividualDashboard from './pages/Donor/IndividualDonor/DashboardIndividual';
import NeedDetail from './pages/Donor/IndividualDonor/NeedDetail';
import DonationForm from './pages/Donor/OrganizationalDonor/DonationForm';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFound';
import RegisterPage from './pages/RegisterPage';
import VerifyEmail from './pages/VerifyEmailPage';
import VerifyOtp from './pages/VerifyOtpPage';
import AdminDashboard from './pages/admin/Dashboard';
import UserDetail from './pages/admin/UserDetail/UserDetail';
import Users from './pages/admin/Users';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
// import UserProfile from "./components/header/UserProfile";
import { Provider } from 'react-redux';
import { ChatProvider } from './context/ChatContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import AccountPage from './pages/profile/AccountPage';
import UserProfilePage from './pages/profile/UserProfilePage';
import { store } from './redux/store';

function App() {
  return (
    <Provider store={store}>
      <div className="pb-16">
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

                  <Route element={<PrivateRoute />}>
                    <Route
                      path="/donor/dashboard"
                      element={<IndividualDashboard />}
                    />
                  </Route>
                  <Route element={<PrivateRoute />}>
                    <Route path="/donor/NeedDetail" element={<NeedDetail />} />
                  </Route>

                  {/* Corrected: Just the Route component */}
                  <Route path="/chat" element={<ChatModal />} />

                  <Route element={<PrivateRoute />}>
                    <Route path="/ngo/dashboard" element={<NgoDashboard />} />
                  </Route>

                  <Route element={<PrivateRoute />}>
                    <Route
                      path="/volunteer/dashboard"
                      element={<VolunteerDashboard />}
                    />
                  </Route>

                  <Route element={<PrivateRoute />}>
                    <Route
                      path="/admin/dashboard"
                      element={<AdminDashboard />}
                    />
                    <Route path="/admin/users" element={<Users />} />
                    <Route path="/admin/users/:id" element={<UserDetail />} />
                    <Route path="/post-donation" element={<DonationForm />} />
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
