// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "Token tidak ditemukan" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token tidak ditemukan" });

    const payload = jwt.verify(token, JWT_SECRET);

    // FIXED: operator precedence bug
    const normalizedRole =
      payload.role ||
      (payload.type === "mine"
        ? "mine_planner"
        : payload.type === "shipping"
        ? "shipping_planner"
        : null);

    const normalizedType =
      payload.type ||
      (payload.role === "mine_planner"
        ? "mine"
        : payload.role === "shipping_planner"
        ? "shipping"
        : null);

    if (!normalizedRole || !normalizedType) {
      return res.status(401).json({ message: "Token payload tidak valid (role/type null)" });
    }

    req.user = {
      id: payload.id,
      email: payload.email,
      role: normalizedRole,
      type: normalizedType,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid", error: err.message });
  }
};
