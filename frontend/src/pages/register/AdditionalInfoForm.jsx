/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
const AdditionalInfoForm = ({
  selectedRole,
  formData,
  onChange,
  onFileChange,
  onBack,
  onSubmit,
}) => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-center">
        Additional Information
      </h2>
      <form onSubmit={onSubmit} className="space-y-4">
        {(selectedRole === 'organization_donor' || selectedRole === 'ngo') && (
          <>
            <input
              type="text"
              name="address"
              placeholder="Address"
              className="w-full p-2 border border-gray-300 rounded"
              onChange={onChange}
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              className="w-full p-2 border border-gray-300 rounded"
              onChange={onChange}
            />
            <input
              type="file"
              multiple
              onChange={onFileChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </>
        )}

        {selectedRole === 'volunteer' && (
          <>
            <input
              type="text"
              name="skills"
              placeholder="Skills (comma-separated)"
              className="w-full p-2 border border-gray-300 rounded"
              onChange={onChange}
            />
            <input
              type="text"
              name="availability"
              placeholder="Availability (e.g., Mon-Fri, 9 AM - 5 PM)"
              className="w-full p-2 border border-gray-300 rounded"
              onChange={onChange}
            />
          </>
        )}

        <div className="flex justify-between">
          <button
            className="bg-gray-500 text-white p-2 rounded"
            onClick={onBack}
          >
            Back
          </button>
          <button type="submit" className="bg-green-500 text-white p-2 rounded">
            Register
          </button>
        </div>
      </form>
    </>
  );
};

export default AdditionalInfoForm;
