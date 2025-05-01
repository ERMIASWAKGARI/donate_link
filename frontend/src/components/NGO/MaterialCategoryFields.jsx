import {
  materialCategories,
  getSubCategories,
  getUnits,
} from "../../constants/category";

const MaterialCategoryFields = ({ category, index, handleCategoryChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
      {/* Category Selection */}
      <div>
        <label className="block text-gray-700 text-sm mb-1">
          Category Name*
        </label>
        <select
          value={category.categoryName}
          onChange={(e) => {
            const value = e.target.value;
            handleCategoryChange("material", index, "categoryName", value);
            // Reset dependent fields when category changes
            if (value !== "Other") {
              handleCategoryChange("material", index, "subCategoryName", "");
              handleCategoryChange("material", index, "unit", "");
            }
          }}
          className="w-full p-2 border border-gray-300 rounded text-sm"
          required
        >
          <option value="">Select Category</option>
          {materialCategories.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.name}
            </option>
          ))}
          <option value="Other">Other</option>
        </select>

        {/* Custom Category Input */}
        {category.categoryName === "Other" && (
          <input
            type="text"
            value={category.customCategory || ""}
            onChange={(e) =>
              handleCategoryChange(
                "material",
                index,
                "customCategory",
                e.target.value
              )
            }
            className="w-full p-2 mt-2 border border-gray-300 rounded text-sm"
            placeholder="Enter custom category"
            required
          />
        )}
      </div>

      {/* Subcategory */}
      <div>
        <label className="block text-gray-700 text-sm mb-1">
          Sub-Category*
        </label>
        {category.categoryName === "Other" ? (
          <input
            type="text"
            value={category.subCategoryName}
            onChange={(e) =>
              handleCategoryChange(
                "material",
                index,
                "subCategoryName",
                e.target.value
              )
            }
            className="w-full p-2 border border-gray-300 rounded text-sm"
            placeholder="Enter subcategory"
            required
          />
        ) : (
          <>
            <select
              value={category.subCategoryName}
              onChange={(e) => {
                const value = e.target.value;
                handleCategoryChange(
                  "material",
                  index,
                  "subCategoryName",
                  value
                );
                if (value !== "Other") {
                  handleCategoryChange("material", index, "unit", "");
                }
              }}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              disabled={!category.categoryName}
              required
            >
              <option value="">Select Subcategory</option>
              {category.categoryName &&
                getSubCategories(category.categoryName).map((subCat) => (
                  <option key={subCat} value={subCat}>
                    {subCat}
                  </option>
                ))}
              <option value="Other">Other</option>
            </select>

            {/* Custom Subcategory Input */}
            {category.subCategoryName === "Other" && (
              <input
                type="text"
                value={category.customSubCategory || ""}
                onChange={(e) =>
                  handleCategoryChange(
                    "material",
                    index,
                    "customSubCategory",
                    e.target.value
                  )
                }
                className="w-full p-2 mt-2 border border-gray-300 rounded text-sm"
                placeholder="Enter custom subcategory"
                required
              />
            )}
          </>
        )}
      </div>

      {/* Unit */}
      <div>
        <label className="block text-gray-700 text-sm mb-1">Unit*</label>
        {category.categoryName === "Other" ||
        category.subCategoryName === "Other" ? (
          <input
            type="text"
            value={category.unit}
            onChange={(e) =>
              handleCategoryChange("material", index, "unit", e.target.value)
            }
            className="w-full p-2 border border-gray-300 rounded text-sm"
            placeholder="Enter unit (e.g., kg, pieces)"
            required
          />
        ) : (
          <select
            value={category.unit}
            onChange={(e) =>
              handleCategoryChange("material", index, "unit", e.target.value)
            }
            className="w-full p-2 border border-gray-300 rounded text-sm"
            disabled={!category.categoryName}
            required
          >
            <option value="">Select Unit</option>
            {category.categoryName &&
              getUnits(category.categoryName).map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            <option value="Other">Other</option>
          </select>
        )}
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-gray-700 text-sm mb-1">
          Target Amount*
        </label>
        <input
          type="number"
          min="1"
          value={category.targetAmountNeeded}
          onChange={(e) =>
            handleCategoryChange(
              "material",
              index,
              "targetAmountNeeded",
              e.target.value
            )
          }
          className="w-full p-2 border border-gray-300 rounded text-sm"
          required
        />
      </div>
    </div>
  );
};

export default MaterialCategoryFields;
