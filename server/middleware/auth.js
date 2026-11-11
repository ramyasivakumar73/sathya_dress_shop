// JWT authentication middleware - protects routes for logged in Users/Admins
const jwt = require("jsonwebtoken");

const protect = (requiredRole) => (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (requiredRole && decoded.role !== requiredRole) {
      return res.status(403).json({ message: "Access denied for this role" });
    }

    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

module.exports = protect;
