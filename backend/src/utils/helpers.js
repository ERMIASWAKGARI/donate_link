const crypto = require("crypto");

exports.generateTrackingId = () => {
  const randomString = crypto.randomBytes(4).toString("hex").toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `DON-${timestamp}-${randomString}`;
};
