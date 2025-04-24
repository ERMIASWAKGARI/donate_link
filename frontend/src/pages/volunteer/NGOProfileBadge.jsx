import PropTypes from "prop-types";
import { useEffect, useState } from "react";

const NGOProfileBadge = ({ ngo, onClick }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!ngo?.profilePicture) {
      setImageUrl(null);
      return;
    }

    // Clean and normalize the image path
    const cleanPath = ngo.profilePicture
      .replace(/\\/g, "/")
      .replace(/^\/+/, "")
      .trim();

    // Handle different path cases
    let url;
    if (cleanPath.startsWith("http")) {
      url = cleanPath;
    } else if (cleanPath.startsWith("uploads/")) {
      url = `http://localhost:5000/${cleanPath}`;
    } else {
      url = `http://localhost:5000/uploads/${cleanPath}`;
    }

    // Verify the image exists
    const img = new Image();
    img.src = url;
    img.onload = () => setImageUrl(url);
    img.onerror = () => setImageUrl(null);

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [ngo]);

  const getInitials = (name) => {
    if (!name) return "NGO";
    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word[0] || "")
      .join("")
      .toUpperCase();
  };

  if (!ngo) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center mb-4 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
      aria-label="View NGO profile"
    >
      <div className="flex-shrink-0 mr-4">
        {imageUrl ? (
          <img
            className="h-12 w-12 rounded-full border-2 border-yellow-400 border-opacity-80 shadow-md object-cover"
            src={imageUrl}
            alt={ngo.name || "NGO profile"}
          />
        ) : (
          <div className="h-12 w-12 rounded-full border-2 border-yellow-400 border-opacity-80 shadow-md bg-gray-200 flex items-center justify-center">
            <span className="font-medium text-gray-600">
              {getInitials(ngo.name)}
            </span>
          </div>
        )}
      </div>
      <div>
        <h4 className="font-medium text-gray-800">{ngo.name}</h4>
        <p className="text-xs text-gray-500">{ngo.email}</p>
      </div>
    </button>
  );
};

NGOProfileBadge.propTypes = {
  ngo: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    profilePicture: PropTypes.string,
  }),
  onClick: PropTypes.func.isRequired,
};

NGOProfileBadge.defaultProps = {
  ngo: null,
};

export default NGOProfileBadge;
