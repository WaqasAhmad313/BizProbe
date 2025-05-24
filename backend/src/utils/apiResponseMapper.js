const responseMessages = {
  200: { status: "Success", message: "Request successful." },
  201: { status: "Created", message: "Resource created successfully." },
  204: {
    status: "No Content",
    message: "Request processed, but no data returned.",
  },
  400: {
    status: "Bad Request",
    message: "Invalid request parameters. Please check and try again.",
  },
  401: {
    status: "Unauthorized",
    message: "Invalid API key or authentication failed.",
  },
  403: {
    status: "Forbidden",
    message:
      "Access denied. You do not have permission to access this resource.",
  },
  404: { status: "Not Found", message: "Requested resource not found." },
  408: {
    status: "Timeout",
    message: "Request timed out. Please try again later.",
  },
  429: {
    status: "Too Many Requests",
    message: "Rate limit exceeded. Please wait and retry.",
  },
  500: {
    status: "Server Error",
    message: "Internal server error. Please try again later.",
  },
  502: { status: "Bad Gateway", message: "Bad gateway. API response invalid." },
  503: {
    status: "Service Unavailable",
    message: "Service is currently unavailable. Try again later.",
  },
};

const getResponseDetails = (code) => {
  const details = responseMessages[code];

  return (
    details || {
      status: "Unknown Error",
      message: `Unexpected response code: ${code}. Please check the API response.`,
    }
  );
};

module.exports = { getResponseDetails };
