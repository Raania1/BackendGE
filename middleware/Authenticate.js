import jwt  from "jsonwebtoken";


export const verifyToken = (req, res, next) => {
    const authHeader = req.headers.Authorization || req.headers.authorization;
  
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
  
      if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
      }
  
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        console.log("Decoded user:", req.user);
        next();
      } catch (err) {
        return res.status(400).json({ message: "Token is not valid" });
      }
    } else {
      return res.status(401).json({ message: "Authorization header missing" });
    }
  };

export const roleBasedAccess = (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(403).json({ message: "Unauthorized, user not found" });
      }
  
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied, insufficient permissions" });
      }
  
      next();
    };
  };