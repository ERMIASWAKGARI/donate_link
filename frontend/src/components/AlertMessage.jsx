/* eslint-disable react/prop-types */
const AlertMessage = ({ message }) => {
  if (!message.text) return null; // Don't render if no message

  return (
    <div
      className={`p-2 mb-4 text-center rounded ${
        message.type === 'success'
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      {message.text}
    </div>
  );
};

export default AlertMessage;
