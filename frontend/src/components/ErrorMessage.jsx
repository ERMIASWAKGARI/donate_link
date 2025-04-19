/* eslint-disable react/prop-types */
// components/ErrorMessage.js
import { ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

/**
 * A reusable error message component
 *
 * @param {Object} props
 * @param {string|Error|Object} props.error - The error to display (can be string, Error object, or API error response)
 * @param {string} [props.title] - Custom title for the error (defaults to "Error")
 * @param {ReactNode} [props.children] - Additional content to display with the error
 * @param {boolean} [props.dismissible=false] - Whether the error can be dismissed
 * @param {number} [props.autoDismiss] - Time in milliseconds to auto-dismiss the error
 * @param {function} [props.onDismiss] - Callback when error is dismissed
 * @param {string} [props.className] - Additional CSS classes
 */
export const ErrorMessage = ({
  error,
  title = 'Error',
  children,
  dismissible = false,
  autoDismiss,
  onDismiss,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Extract error message from different error types
  const getErrorMessage = () => {
    if (!error) return 'An unknown error occurred';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.error) return error.error;
    if (error.errors) {
      // Handle API validation errors
      return Object.values(error.errors).join(', ');
    }
    return 'An unknown error occurred';
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  // Auto-dismiss if configured
  useEffect(() => {
    if (autoDismiss && isVisible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismiss);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`rounded-md bg-red-50 p-4 border border-red-100 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationCircleIcon
            className="h-5 w-5 text-red-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-red-800">{title}</h3>
            {dismissible && (
              <button
                type="button"
                onClick={handleDismiss}
                className="text-red-500 hover:text-red-600 focus:outline-none"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="mt-2 text-sm text-red-700">
            <p>{getErrorMessage()}</p>
            {children && <div className="mt-2">{children}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
