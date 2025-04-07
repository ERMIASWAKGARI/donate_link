// eslint-disable-next-line react/prop-types
const StatusBadge = ({ isBanned, isVerified }) => {
  if (isBanned) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Banned
      </span>
    );
  }

  if (isVerified) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Verified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      Pending Verification
    </span>
  );
};

export default StatusBadge;
