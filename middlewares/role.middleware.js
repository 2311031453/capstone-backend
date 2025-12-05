// middlewares/role.middleware.js
export const allowRole = (allowedRoles = []) => (req, res, next) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  if (!allowedRoles.includes(user.role)) {
    return res.status(403).json({ message: "Akses ditolak: role tidak memenuhi syarat" });
  }
  next();
};
