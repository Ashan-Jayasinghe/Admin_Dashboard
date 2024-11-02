const roleMiddleware = (roles) => {
  return (req, res, next) => {
    // Check if user information is available
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          message: "Access denied. You do not have the right permissions.",
        });
    }
    next(); // Proceed to the next middleware or route handler
  };
};

export default roleMiddleware;
