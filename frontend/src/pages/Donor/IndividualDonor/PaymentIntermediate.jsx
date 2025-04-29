import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentIntermediate = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const tx_ref = searchParams.get('tx_ref');

  useEffect(() => {
    if (status === 'success') {
      // Store that we've shown the receipt
      sessionStorage.setItem('chapa_receipt_viewed', 'true');

      // Redirect to success page after delay
      const timer = setTimeout(() => {
        navigate(`/payment-success?tx_ref=${tx_ref}`);
      }, 10000); // 10 second delay

      return () => clearTimeout(timer);
    } else {
      navigate('/payment-failed');
    }
  }, [status, tx_ref, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">Payment Receipt</h2>
        <p className="mb-6">
          Please download your receipt from this page before continuing.
          You&apos;ll be automatically redirected in 10 seconds.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => window.print()} // Browser's native print (which can save as PDF)
            className="w-full bg-blue-500 text-white py-2 rounded"
          >
            Download Receipt
          </button>
          <button
            onClick={() => navigate(`/payment-success?tx_ref=${tx_ref}`)}
            className="w-full bg-gray-200 py-2 rounded"
          >
            Continue Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentIntermediate;
