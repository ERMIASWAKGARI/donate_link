import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { FaCalendarAlt, FaClock, FaEdit } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PropTypes from "prop-types";

const ApplicationForm = ({
  need,
  onSubmit,
  loading,
  hasApplied,
  onApplicationSuccess,
}) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm();
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (need?.categories?.service?.length > 0) {
      setSelectedCategory(need.categories.service[0].categoryName);
      setValue("category", need.categories.service[0].categoryName);
      setValue("subCategory", need.categories.service[0].subCategoryName);
    }
  }, [need, setValue]);

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setValue("category", category);
  };

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      if (onApplicationSuccess) {
        onApplicationSuccess(); // Notify parent of successful application
      }
    } catch (err) {
      console.error("Form submission error:", err);
      // Error handling remains the same
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Application Form</h2>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Service Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Category
          </label>
          <select
            {...register("category", { required: "Category is required" })}
            onChange={handleCategoryChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {need?.categories?.service?.map((service, index) => (
              <option key={`cat-${index}`} value={service.categoryName}>
                {service.categoryName}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">
              {errors.category.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Sub-Category
          </label>
          <select
            {...register("subCategory", {
              required: "Sub-category is required",
            })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {need?.categories?.service
              ?.filter((service) => service.categoryName === selectedCategory)
              .map((service, index) => (
                <option key={`subcat-${index}`} value={service.subCategoryName}>
                  {service.subCategoryName} (Vacancy: {service.vacancy})
                </option>
              ))}
          </select>
          {errors.subCategory && (
            <p className="mt-1 text-sm text-red-600">
              {errors.subCategory.message}
            </p>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaCalendarAlt className="mr-2 text-gray-500" /> Start Date
            </label>
            <Controller
              name="startDate"
              control={control}
              rules={{ required: "Start date is required" }}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  minDate={new Date()}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholderText="Select start date"
                />
              )}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaCalendarAlt className="mr-2 text-gray-500" /> End Date
              (Optional)
            </label>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  minDate={new Date()}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholderText="Select end date"
                />
              )}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <FaClock className="mr-2 text-gray-500" /> Hours Per Week
          </label>
          <input
            type="number"
            {...register("hoursPerWeek", {
              required: "Hours per week is required",
              min: { value: 1, message: "Minimum 1 hour" },
              max: { value: 40, message: "Maximum 40 hours" },
            })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 10"
          />
          {errors.hoursPerWeek && (
            <p className="mt-1 text-sm text-red-600">
              {errors.hoursPerWeek.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <FaEdit className="mr-2 text-gray-500" /> Motivation
          </label>
          <textarea
            {...register("motivation", {
              required: "Motivation is required",
              minLength: { value: 25, message: "Minimum 25 characters" },
              maxLength: { value: 1000, message: "Maximum 1000 characters" },
            })}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Explain why you're a good fit for this opportunity..."
          />
          {errors.motivation && (
            <p className="mt-1 text-sm text-red-600">
              {errors.motivation.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || hasApplied}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-300 ${
            loading || hasApplied
              ? "bg-teal-300 text-white cursor-not-allowed"
              : "border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white"
          }`}
        >
          {hasApplied
            ? "Application Submitted"
            : loading
            ? "Submitting..."
            : "Submit Application"}
        </button>
      </form>
    </div>
  );
};

ApplicationForm.propTypes = {
  need: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    categories: PropTypes.shape({
      service: PropTypes.arrayOf(
        PropTypes.shape({
          categoryName: PropTypes.string.isRequired,
          subCategoryName: PropTypes.string.isRequired,
          vacancy: PropTypes.string.isRequired,
        })
      ).isRequired,
    }).isRequired,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  hasApplied: PropTypes.bool,

  onApplicationSuccess: PropTypes.func,
};

ApplicationForm.defaultProps = {
  loading: false,
  hasApplied: false,
};

export default ApplicationForm;
