// controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "../models/index.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const REFRESH_TOKEN_EXPIRES_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || "30", 10);
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || "rtoken";
const NODE_ENV = process.env.NODE_ENV || "development";

const accessTokenExpiresIn = JWT_EXPIRES_IN;

// create JWT access token
const generateAccessToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: accessTokenExpiresIn });

// create random refresh token (return raw token + hash)
const createRefreshTokenValue = () => {
  // create a secure random token
  const token = uuidv4() + "-" + crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
};

// helper to set refresh cookie
const setRefreshCookie = (res, tokenRaw) => {
  const maxAge = REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000;
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    maxAge,
    secure: NODE_ENV === "production",
    path: "/",
  };
  res.cookie(REFRESH_COOKIE_NAME, tokenRaw, cookieOptions);
};

// helper to clear cookie
const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { httpOnly: true, sameSite: "lax", secure: NODE_ENV === "production", path: "/" });
};

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

    const token = generateAccessToken({ id: user.id, email: user.email, role: user.role, type: "mine" });
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

    const token = generateAccessToken({ id: user.id, email: user.email, role: user.role, type: "shipping" });
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

    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role, type: role.startsWith("mine") ? "mine" : "shipping" });

    // create refresh token and persist hashed value
    const { token: refreshTokenRaw, tokenHash } = createRefreshTokenValue();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

    // Save to DB
    const saved = await db.RefreshToken.create({
      tokenHash,
      userId: user.id,
      userType: role.startsWith("mine") ? "mine" : "shipping",
      ip: req.ip || req.headers["x-forwarded-for"] || null,
      userAgent: req.get("User-Agent") || null,
      expiresAt,
    });

    // set cookie
    setRefreshCookie(res, refreshTokenRaw);

    res.json({
      message: "Login berhasil",
      token: accessToken,
      user: { id: user.id, nama: user.nama, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// New: /me endpoint
export const me = async (req, res) => {
  try {
    // authenticateToken middleware attaches req.user (payload)
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id, type } = req.user;
    let user = null;
    if (type === "mine") user = await db.MinePlanner.findByPk(id, { attributes: { exclude: ["password"] } });
    else if (type === "shipping") user = await db.ShippingPlanner.findByPk(id, { attributes: { exclude: ["password"] } });

    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Helper: find refresh token record by raw token
const findRefreshTokenByRaw = async (rawToken) => {
  if (!rawToken) return null;
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const record = await db.RefreshToken.findOne({ where: { tokenHash } });
  return record;
};

// rotate refresh token: revoke old, create new
const rotateRefreshToken = async (oldRecord, req) => {
  // create new token value + db entry
  const { token: newRaw, tokenHash: newHash } = createRefreshTokenValue();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  const newRecord = await db.RefreshToken.create({
    tokenHash: newHash,
    userId: oldRecord.userId,
    userType: oldRecord.userType,
    ip: req.ip || req.headers["x-forwarded-for"] || null,
    userAgent: req.get("User-Agent") || null,
    expiresAt,
  });

  // mark old revoked and set replacedByTokenId
  oldRecord.revoked = true;
  oldRecord.replacedByTokenId = newRecord.id;
  await oldRecord.save();

  return { newRaw, newRecord };
};

// POST /refresh-token
export const refreshToken = async (req, res) => {
  try {
    // get raw refresh token from cookie
    const rtoken = req.cookies[REFRESH_COOKIE_NAME];
    if (!rtoken) {
      return res.status(401).json({ message: "Refresh token tidak ditemukan" });
    }

    const record = await findRefreshTokenByRaw(rtoken);
    if (!record) {
      // possible reuse attack or token missing in DB
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Refresh token tidak valid" });
    }

    // check expiry
    if (new Date() > new Date(record.expiresAt) || record.revoked) {
      // revoke in DB if not already
      if (!record.revoked) {
        record.revoked = true;
        await record.save();
      }
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Refresh token expired / revoked" });
    }

    // success -> rotate refresh token
    const { newRaw, newRecord } = await rotateRefreshToken(record, req);

    // update lastUsedAt
    newRecord.lastUsedAt = new Date();
    await newRecord.save();

    // generate new access token
    const accessToken = generateAccessToken({ id: record.userId, role: record.userType === "mine" ? "mine_planner" : "shipping_planner", email: null, type: record.userType });
    // NOTE: email not available here; client can call /me to get full profile

    // set cookie with new refresh token
    setRefreshCookie(res, newRaw);

    res.json({ token: accessToken, message: "Token refreshed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /logout
export const logout = async (req, res) => {
  try {
    const rtoken = req.cookies[REFRESH_COOKIE_NAME];
    if (rtoken) {
      const record = await findRefreshTokenByRaw(rtoken);
      if (record && !record.revoked) {
        record.revoked = true;
        await record.save();
      }
    }

    clearRefreshCookie(res);
    res.json({ message: "Logout berhasil" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /sessions -> list user's refresh token sessions (active & revoked)
export const listSessions = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userId = req.user.id;
    const userType = req.user.type; // "mine" or "shipping"

    const sessions = await db.RefreshToken.findAll({
      where: { userId, userType },
      order: [["createdAt", "DESC"]],
      attributes: ["id", "ip", "userAgent", "createdAt", "expiresAt", "lastUsedAt", "revoked", "replacedByTokenId"],
    });

    res.json({ sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /sessions/:sessionId -> revoke that session
export const revokeSession = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { sessionId } = req.params;
    const userId = req.user.id;
    const userType = req.user.type;

    const session = await db.RefreshToken.findByPk(sessionId);
    if (!session) return res.status(404).json({ message: "Session tidak ditemukan" });
    if (session.userId !== userId || session.userType !== userType) {
      return res.status(403).json({ message: "Tidak berwenang untuk merubah session ini" });
    }

    session.revoked = true;
    await session.save();

    // If the revoked session equals the cookie in current browser, clear cookie
    const currentCookie = req.cookies[REFRESH_COOKIE_NAME];
    if (currentCookie) {
      const hash = crypto.createHash("sha256").update(currentCookie).digest("hex");
      if (hash === session.tokenHash) {
        clearRefreshCookie(res);
      }
    }

    res.json({ message: "Session berhasil dicabut (revoked)" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
