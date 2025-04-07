const NeedInformation = ({ need }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Description
        </h3>
        <p className="text-gray-600">{need.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Details</h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Status:</span>{" "}
              <span
                className={`font-semibold ${
                  need.status === "Fulfilled"
                    ? "text-green-600"
                    : need.status === "Expired"
                    ? "text-red-600"
                    : "text-blue-600"
                }`}
              >
                {need.status}
              </span>
            </p>
            <p>
              <span className="font-medium">Urgency:</span>{" "}
              <span className="font-semibold">{need.urgencyLevel}</span>
            </p>
            <p>
              <span className="font-medium">Beneficiaries:</span>{" "}
              <span>{need.beneficiaryInfo.numberOfBeneficiaries}</span>
            </p>
            <p>
              <span className="font-medium">End Date:</span>{" "}
              <span>{new Date(need.endDate).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        {need.needTypes.includes("money") && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Financial Target
            </h3>
            <p className="text-2xl font-bold text-green-600">
              ${need.targetMoney}
            </p>
            <p className="text-sm text-gray-500">Target amount needed</p>
          </div>
        )}
      </div>

      {/* Material Needs */}
      {need.needTypes.includes("material") &&
        need.categories.material?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Material Needs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {need.categories.material.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium">{item.categoryName}</p>
                  <p className="text-sm text-gray-600">
                    {item.subCategoryName}
                  </p>
                  <p className="text-sm">
                    Amount needed: {item.targetAmountNeeded}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Service Needs */}
      {need.needTypes.includes("service") &&
        need.categories.service?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Service Needs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {need.categories.service.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded border">
                  <p className="font-medium">{item.categoryName}</p>
                  <p className="text-sm text-gray-600">
                    {item.subCategoryName}
                  </p>
                  <p className="text-sm">Vacancies: {item.vacancy}</p>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};

export default NeedInformation;
