import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

import { useUser } from '../../../context/UserContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleReturnToHome = () => {
    if (user) {
      if (
        user?.role === 'individual_donor' ||
        user?.role === 'organization_donor'
      ) {
        navigate('/donor/dashboard');
      }
      if (user?.role === 'ngo') {
        navigate('/ngo/dashboard');
      }
      if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      }
      if (user?.role === 'volunteer') {
        navigate('/volunteer/dashboard');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-[#008080]" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Successful!
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Thank you for your generous donation
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="animate-bounce">
              <svg
                className="mx-auto h-12 w-12 text-[#008080]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h3 className="mt-4 text-xl font-medium text-gray-900">
              Your donation has been processed
            </h3>
            <p className="mt-2 text-gray-600">
              We&apos;ve sent a receipt to your email address
            </p>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-500">
                Transaction ID:{' '}
                <span className="font-mono">
                  chapa-{Math.random().toString(36).substring(2, 10)}
                </span>
              </p>
            </div>

            <div className="mt-6">
              <button
                onClick={handleReturnToHome}
                className="w-full flex justify-center items-center px-4 py-2 rounded-md shadow-sm text-[#008080] hover:text-white hover:bg-[#008080] border border-[#008080] "
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a
              href="mailto:support@yourorganization.org"
              className="font-medium text-[#008080] hover:underline"
            >
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
