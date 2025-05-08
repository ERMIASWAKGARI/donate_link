import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {
  fetchDonationsByNeed,
  selectDonationsByNeedId,
} from "../../../redux/donationsSlice";

const NeedInformation = ({ need }) => {
  const dispatch = useDispatch();
  const donations = useSelector((state) =>
    selectDonationsByNeedId(need._id)(state)
  );
  const loading = useSelector((state) => state?.donations?.loading);
  console.log("need", need);
  useEffect(() => {
    dispatch(fetchDonationsByNeed(need._id));
  }, [need._id, dispatch]);

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

        {need.needTypes?.includes("money") && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Financial Target
            </h3>
            {loading ? (
              <div className="animate-pulse h-8 w-1/2 bg-gray-200 rounded"></div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-2xl font-bold text-green-600">
                    ${donations?.money?.donated?.toLocaleString() || 0} donated
                  </p>
                  <p className="text-lg font-semibold">
                    ${need.targetMoney?.toLocaleString() || 0} target
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: `${donations?.money?.percentage || 0}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {donations?.money?.percentage || 0}% of target reached
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Material Needs */}
      {need.needTypes?.includes("material") &&
        need.categories.material?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Material Needs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {need.categories.material.map((item, index) => {
                const key = `${item.categoryName}-${item.subCategoryName}`;
                const donationData = donations?.material?.[key];

                return (
                  <div key={index} className="p-3 bg-gray-50 rounded border">
                    <p className="font-medium">{item.categoryName}</p>
                    <p className="text-sm text-gray-600">
                      {item.subCategoryName}
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          {donationData?.donated || 0} {item.unit} donated
                        </span>
                        <span>
                          {item.targetAmountNeeded} {item.unit} needed
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${donationData?.percentage || 0}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {donationData?.percentage || 0}% complete
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      {/* Service Needs */}
      {need.needTypes?.includes("service") &&
        need.categories.service?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Service Needs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {need.categories.service.map((item, index) => {
                const key = `${item.categoryName}-${item.subCategoryName}`;
                const serviceData = donations?.service?.categories?.[key];

                return (
                  <div key={index} className="p-3 bg-gray-50 rounded border">
                    <p className="font-medium">{item.categoryName}</p>
                    <p className="text-sm text-gray-600">
                      {item.subCategoryName}
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm">
                        <span>{serviceData?.applications || 0} applicants</span>
                        <span>{item.vacancy} vacancies</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${serviceData?.percentageFilled || 0}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {serviceData?.remaining || item.vacancy} remaining spots
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </div>
  );
};

export default NeedInformation;
