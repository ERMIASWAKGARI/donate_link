/* eslint-disable react/prop-types */
import { useState } from 'react';

import { TeamOutlined } from '@ant-design/icons';
import { FieldRenderer } from './FieldRenderer';
import { volunteerFields } from './profileFields';

export const VolunteerInfo = ({
  user,
  editingField,
  loading,
  formData,
  onEdit,
  onCancel,
  onSave,
  handleFieldChange,
  hasChanges,
}) => (
  <>
    <h2 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
      <TeamOutlined className="mr-2 text-teal-500" />
      Volunteer Information
    </h2>

    {volunteerFields.map((field) => (
      <FieldRenderer
        key={field.fieldName}
        fieldConfig={field}
        user={user}
        editingField={editingField}
        loading={loading}
        formData={formData}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={onSave}
        handleFieldChange={handleFieldChange}
        hasChanges={hasChanges}
      />
    ))}
  </>
);

// components/AvailabilitySelector.js

export const AvailabilitySelector = ({ value = [], onChange, days }) => {
  const [selectedDay, setSelectedDay] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const handleAddAvailability = () => {
    if (!selectedDay) return;

    const newEntry = {
      day: selectedDay,
      startTime,
      endTime,
    };

    // Check if this day already exists
    const exists = value.some((entry) => entry.day === selectedDay);

    if (!exists) {
      onChange([...value, newEntry]);
    } else {
      // Update existing entry
      onChange(
        value.map((entry) => (entry.day === selectedDay ? newEntry : entry))
      );
    }
  };

  const handleRemoveAvailability = (day) => {
    onChange(value.filter((entry) => entry.day !== day));
  };

  // Generate time options
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  return (
    <div className="space-y-4">
      {/* Current availability */}
      <div className="flex flex-wrap gap-2">
        {value.map(({ day, startTime, endTime }) => (
          <div
            key={day}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
          >
            {day}: {startTime}-{endTime}
            <button
              type="button"
              onClick={() => handleRemoveAvailability(day)}
              className="ml-2 text-blue-500 hover:text-blue-700"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add new availability */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Day</label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
          >
            <option value="">Select day</option>
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <select
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
          >
            {timeOptions.map((time) => (
              <option key={`start-${time}`} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <select
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
          >
            {timeOptions.map((time) => (
              <option key={`end-${time}`} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleAddAvailability}
            disabled={!selectedDay}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
