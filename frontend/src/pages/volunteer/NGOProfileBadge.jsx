import PropTypes from "prop-types";
import { FaBuilding } from "react-icons/fa";

const NGOProfileBadge = ({ ngo, onClick }) => {
  if (!ngo) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center mb-4 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
      aria-label="View NGO profile"
    >
      <div className="bg-blue-100 p-2 rounded-full mr-3">
        <FaBuilding className="text-blue-600" />
      </div>
      <div>
        <h4 className="font-medium text-gray-800">{ngo.name}</h4>
        <p className="text-xs text-gray-500">{ngo.email}</p>
      </div>
    </button>
  );
};

NGOProfileBadge.propTypes = {
  ngo: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  onClick: PropTypes.func.isRequired,
};

NGOProfileBadge.defaultProps = {
  ngo: null,
};

export default NGOProfileBadge;
