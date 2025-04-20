/* eslint-disable react/prop-types */
// components/SuccessMessage.js
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

/**
 * A reusable success message component
 *
 * @param {Object} props
 * @param {string|Object} props.message - The success message to display
 * @param {string} [props.title="Success"] - Custom title for the success message
 * @param {ReactNode} [props.children] - Additional content to display
 * @param {boolean} [props.dismissible=false] - Whether the message can be dismissed
 * @param {number} [props.autoDismiss] - Time in milliseconds to auto-dismiss the message
 * @param {function} [props.onDismiss] - Callback when message is dismissed
 * @param {string} [props.className] - Additional CSS classes
 * @param {string[]} [props.updatedFields] - Array of updated field names to display
 */
// components/SuccessMessage.js

export const SuccessMessage = ({
  message,
  title = 'Success',
  children,
  dismissible = false,
  autoDismiss,
  onDismiss,
  className = '',
  updatedFields = [],
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const getSuccessMessage = () => {
    if (!message) return 'Operation completed successfully';
    if (typeof message === 'string') return message;
    if (message.message) return message.message;
    return 'Operation completed successfully';
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

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
      className={`rounded-md bg-green-50 p-4 border border-green-100 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircleIcon
            className="h-5 w-5 text-green-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-medium text-green-800">{title}</h3>
            {dismissible && (
              <button
                type="button"
                onClick={handleDismiss}
                className="text-green-500 hover:text-green-600 focus:outline-none"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="mt-2 text-sm text-green-700">
            <p>{getSuccessMessage()}</p>
            {updatedFields.length > 0 && (
              <p className="mt-1 text-xs text-green-600">
                Updated: {updatedFields.join(', ')}
              </p>
            )}
            {children && <div className="mt-2">{children}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;
