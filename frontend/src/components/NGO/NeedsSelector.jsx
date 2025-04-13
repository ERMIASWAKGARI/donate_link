import PropTypes from "prop-types";

const NeedsSelector = ({ needs, selectedNeed, onSelectNeed }) => {
  return (
    <div className="relative">
      <select
        className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        value={selectedNeed}
        onChange={(e) => onSelectNeed(e.target.value)}
        aria-label="Select NGO need"
      >
        {needs.map((need) => (
          <option key={need._id} value={need._id}>
            {need.title} ({need.applicationsCount || 0})
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

NeedsSelector.propTypes = {
  needs: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      applicationsCount: PropTypes.number,
    })
  ).isRequired,
  selectedNeed: PropTypes.string,
  onSelectNeed: PropTypes.func.isRequired,
};

NeedsSelector.defaultProps = {
  selectedNeed: "",
};

export default NeedsSelector;
