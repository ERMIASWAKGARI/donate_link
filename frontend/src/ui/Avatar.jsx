// import React from 'react';
import PropTypes from "prop-types";

const Avatar = ({ src, name, size = "md" }) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center overflow-hidden`}
    >
      {src ? (
        <img
          src={src}
          alt={name || "User avatar"}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-gray-600 font-medium">
          {name ? name.charAt(0).toUpperCase() : "?"}
        </span>
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
};

Avatar.defaultProps = {
  src: null,
  name: null,
  size: "md",
};

export default Avatar;
