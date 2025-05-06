import { useNavigate } from 'react-router-dom';
import { PiWarningCircleBold, PiHouseBold } from 'react-icons/pi';
import { useUser } from '../context/UserContext';
import { Spin } from 'antd';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { user, accessToken, loading } = useUser();

  const handleGoHome = () => {
    if (loading) return;

    if (!accessToken) {
      navigate('/');
      return;
    }

    if (!user) return;

    const roleRoutes = {
      admin: '/admin/dashboard',
      individual_donor: '/donor/dashboard',
      organization_donor: '/donor/dashboard',
      volunteer: '/volunteer/dashboard',
      ngo: '/ngo/dashboard',
    };

    const route = roleRoutes[user.role];
    navigate(route || '/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-4 text-[#008080] font-extrabold">404</div>
        <div className="flex justify-center mb-6 text-[#008080] text-6xl">
          <PiWarningCircleBold />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Oops! Nothing&apos;s here.
        </h1>
        <p className="text-gray-600 mb-8">
          We couldn&apos;t find the page you were looking for.
        </p>
        <button
          onClick={handleGoHome}
          className="flex items-center gap-2 px-6 py-2 rounded-md bg-[#008080] text-white hover:bg-[#006666] transition duration-200 mx-auto"
          disabled={loading}
        >
          <PiHouseBold className="text-lg" />
          {loading ? 'Loading...' : 'Go Home'}
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
