// eslint-disable-next-line react/prop-types
const RoleSelection = ({ onSelect }) => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-center">Choose Your Role</h2>
      <div className="grid grid-cols-2 gap-4">
        <button
          className="bg-blue-500 text-white p-3 rounded"
          onClick={() => onSelect('individual_donor')}
        >
          Individual Donor
        </button>
        <button
          className="bg-green-500 text-white p-3 rounded"
          onClick={() => onSelect('organization_donor')}
        >
          Organization Donor
        </button>
        <button
          className="bg-yellow-500 text-white p-3 rounded"
          onClick={() => onSelect('volunteer')}
        >
          Volunteer
        </button>
        <button
          className="bg-purple-500 text-white p-3 rounded"
          onClick={() => onSelect('ngo')}
        >
          NGO
        </button>
      </div>
    </>
  );
};

export default RoleSelection;
