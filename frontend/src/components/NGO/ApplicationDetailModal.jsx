import { Fragment, useState } from "react";
import PropTypes from "prop-types";
import { Dialog, Transition } from "@headlessui/react";
import Badge from "../../ui/Badge";

const ApplicationDetailModal = ({ application, onClose, onStatusUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(application._id, status);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!application) return null;

  return (
    <Transition appear show as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={onClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                Application Details
              </Dialog.Title>

              <div className="mt-4 space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      className="h-16 w-16 rounded-full"
                      src={application.volunteer.profilePicture}
                      alt={application.volunteer.name}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">
                      {application.volunteer.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {application.volunteer.email}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {application.skills.map((skill) => (
                        <Badge key={skill} color="blue">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge
                    color={
                      application.status === "approved"
                        ? "green"
                        : application.status === "rejected"
                        ? "red"
                        : "yellow"
                    }
                  >
                    {application.status}
                  </Badge>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Application Message
                  </h4>
                  <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">
                    {application.message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Availability
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      {application.availability || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Applied On
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <div className="space-x-3">
                  {application.status !== "approved" && (
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      onClick={() => handleStatusUpdate("approved")}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Processing..." : "Approve"}
                    </button>
                  )}
                  {application.status !== "rejected" && (
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={() => handleStatusUpdate("rejected")}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Processing..." : "Reject"}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

ApplicationDetailModal.propTypes = {
  application: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    volunteer: PropTypes.shape({
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      profilePicture: PropTypes.string,
    }).isRequired,
    skills: PropTypes.arrayOf(PropTypes.string).isRequired,
    status: PropTypes.oneOf(["pending", "approved", "rejected"]).isRequired,
    message: PropTypes.string.isRequired,
    availability: PropTypes.string,
    appliedAt: PropTypes.string.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
  onStatusUpdate: PropTypes.func.isRequired,
};

ApplicationDetailModal.defaultProps = {
  application: null,
};

export default ApplicationDetailModal;
