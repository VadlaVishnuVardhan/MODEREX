const { errorResponse } = require("../utils/utils");

const adminMiddleware = (req, res, next) => {
  try {
    const user = req.user;
    
    if (!user) {
      return errorResponse(res, 401, 'Authentication required');
    }

    if (!user.isAdmin) {
      return errorResponse(res, 403, 'Admin access required');
    }

    next();
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  adminMiddleware,
};
