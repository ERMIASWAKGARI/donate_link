// utils/responseHelper.js

const sendSuccessResponse = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

module.exports = sendSuccessResponse;
