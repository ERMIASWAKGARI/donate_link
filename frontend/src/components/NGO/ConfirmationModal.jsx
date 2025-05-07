import { motion, AnimatePresence } from "framer-motion";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, actionType }) => {
  const getModalContent = () => {
    switch (actionType) {
      case "accepted":
        return {
          title: "Accept Volunteer",
          message: "Are you sure you want to accept this volunteer?",
          icon: (
            <svg
              className="h-16 w-16 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ),
          confirmColor: "bg-green-600 hover:bg-green-700",
          confirmText: "Yes, Accept",
        };
      case "rejected":
        return {
          title: "Reject Volunteer",
          message:
            "Are you sure you want to reject this volunteer application?",
          icon: (
            <svg
              className="h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ),
          confirmColor: "bg-red-600 hover:bg-red-700",
          confirmText: "Yes, Reject",
        };
      default:
        return {
          title: "Confirm Action",
          message: "Are you sure you want to perform this action?",
          icon: (
            <svg
              className="h-16 w-16 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ),
          confirmColor: "bg-blue-600 hover:bg-blue-700",
          confirmText: "Confirm",
        };
    }
  };

  const { title, message, icon, confirmColor, confirmText } = getModalContent();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background overlay - now separate from the modal content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity"
          />

          {/* Modal content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 sm:mx-0 sm:h-20 sm:w-20">
                    {icon}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3
                      className="text-2xl leading-6 font-bold text-gray-900"
                      id="modal-headline"
                    >
                      {title}
                    </h3>
                    <div className="mt-4">
                      <p className="text-lg text-gray-600">{message}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl bg-gray-50">
                <button
                  type="button"
                  onClick={() => {
                    onConfirm(true);
                    onClose();
                  }}
                  className={`w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-6 py-3 text-base font-medium text-white ${confirmColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200`}
                >
                  {confirmText}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onConfirm(false);
                    onClose();
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
