import React from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import NgoNeedForm from "./PostNeedsForm";

function PostedNeeds({
  needs,
  handleDeleteNeed,
  showNeedForm,
  setShowNeedForm,
  handleAddNeed,
}) {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Posted Needs</h2>
        <button
          onClick={() => setShowNeedForm(!showNeedForm)}
          className="flex items-center px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <FaPlus className="mr-2" />
          Post New Need
        </button>
      </div>

      {showNeedForm && (
        <NgoNeedForm
          onSubmit={handleAddNeed}
          onCancel={() => setShowNeedForm(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {needs.map((need) => (
          <div
            key={need.id}
            className="p-4 bg-white shadow rounded-lg relative"
          >
            <button
              onClick={() => handleDeleteNeed(need.id)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              title="Delete need"
            >
              <FaTrash />
            </button>
            <p className="font-medium">{need.description}</p>
            <p className="text-gray-600">
              {need.type === "money"
                ? `Amount: ${need.amount}`
                : `Type: ${need.type}`}
            </p>
            <p
              className={`text-sm font-semibold ${
                need.status === "Completed"
                  ? "text-green-600"
                  : need.status === "Pending"
                  ? "text-yellow-600"
                  : "text-blue-600"
              }`}
            >
              Status: {need.status}
            </p>
            <button className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PostedNeeds;
