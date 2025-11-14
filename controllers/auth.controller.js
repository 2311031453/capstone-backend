import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../models/index.js";
import { v4 as uuidv4 } from "uuid";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const generateToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

export const registerMinePlanner = async (req, res) => {
  try {
    const { nama, email, no_telp, password } = req.body;
    if (!nama || !email || !password) {
      return res.status(400).json({ message: "nama, email, dan password wajib diisi" });
    }
    const exists = await db.MinePlanner.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: "Email sudah terdaftar (mine planner)" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await db.MinePlanner.create({ id: uuidv4(), nama, email, no_telp, password: hashed });

    const token = generateToken({ id: user.id, email: user.email, role: user.role, type: "mine" });
    res.status(201).json({ message: "Registrasi berhasil (Mine Planner)", user: { id: user.id, nama: user.nama, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const registerShippingPlanner = async (req, res) => {
  try {
    const { nama, email, no_telp, password } = req.body;
    if (!nama || !email || !password) {
      return res.status(400).json({ message: "nama, email, dan password wajib diisi" });
    }
    const exists = await db.ShippingPlanner.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: "Email sudah terdaftar (shipping planner)" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await db.ShippingPlanner.create({ id: uuidv4(), nama, email, no_telp, password: hashed });

    const token = generateToken({ id: user.id, email: user.email, role: user.role, type: "shipping" });
    res.status(201).json({ message: "Registrasi berhasil (Shipping Planner)", user: { id: user.id, nama: user.nama, email: user.email }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: "email, password, role wajib diisi" });

    let user = null;
    if (role === "mine_planner") {
      user = await db.MinePlanner.findOne({ where: { email } });
    } else if (role === "shipping_planner") {
      user = await db.ShippingPlanner.findOne({ where: { email } });
    } else {
      return res.status(400).json({ message: "role tidak dikenal" });
    }

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Password salah" });

    const token = generateToken({ id: user.id, email: user.email, role: user.role, type: role.startsWith("mine") ? "mine" : "shipping" });

    res.json({
      message: "Login berhasil",
      token,
      user: { id: user.id, nama: user.nama, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
