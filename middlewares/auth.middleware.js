import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../models/index.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "Token tidak ditemukan" });
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token tidak ditemukan" });

    const payload = jwt.verify(token, JWT_SECRET);
    // payload: { id, email, role, type, iat, exp }
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token tidak valid", error: err.message });
  }
};
