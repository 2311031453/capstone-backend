// services/auth.service.js
import db from "../models/index.js";
import { v4 as uuidv4 } from "uuid";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import { generateAccessToken, createRefreshTokenValue, hashRaw } from "../utils/token.util.js";
import { REFRESH_TOKEN_EXPIRES_DAYS } from "../utils/token.util.js";

const REFRESH_USER_TYPE_MAP = {
  mine_planner: "mine",
  shipping_planner: "shipping",
};

export const register = async ({ nama, email, no_telp, password, type }) => {
  const Model = type === "mine" ? db.MinePlanner : db.ShippingPlanner;
  const exists = await Model.findOne({ where: { email } });
  if (exists) throw Object.assign(new Error("Email sudah terdaftar"), { status: 400 });

  const hashed = await hashPassword(password);
  const user = await Model.create({ id: uuidv4(), nama, email, no_telp, password: hashed });
  const token = generateAccessToken({ id: user.id, email: user.email, role: user.role, type });
  return { user: { id: user.id, nama: user.nama, email: user.email }, token };
};

export const login = async ({ email, password, role, ip, userAgent }) => {
  // role = mine_planner | shipping_planner
  const userType = REFRESH_USER_TYPE_MAP[role];
  const Model = role === "mine_planner" ? db.MinePlanner : db.ShippingPlanner;
  const user = await Model.findOne({ where: { email } });
  if (!user) throw Object.assign(new Error("User tidak ditemukan"), { status: 404 });

  const match = await comparePassword(password, user.password);
  if (!match) throw Object.assign(new Error("Password salah"), { status: 401 });

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role, type: userType });

  // create refresh token record
  const { tokenRaw, tokenHash, expiresAt } = createRefreshTokenValue();
  const record = await db.RefreshToken.create({
    tokenHash,
    userId: user.id,
    userType,
    ip,
    userAgent,
    expiresAt,
  });

  return {
    accessToken,
    refreshTokenRaw: tokenRaw,
    user: { id: user.id, nama: user.nama, email: user.email, role: user.role },
  };
};

export const me = async ({ id, type }) => {
  const Model = type === "mine" ? db.MinePlanner : db.ShippingPlanner;
  const user = await Model.findByPk(id, { attributes: { exclude: ["password"] } });
  if (!user) throw Object.assign(new Error("User tidak ditemukan"), { status: 404 });
  return user;
};

export const findRefreshTokenByRaw = async (raw) => {
  if (!raw) return null;
  const tokenHash = hashRaw(raw);
  const record = await db.RefreshToken.findOne({ where: { tokenHash } });
  return record;
};

export const rotateRefreshToken = async (oldRecord, { ip, userAgent }) => {
  // create new token
  const { tokenRaw, tokenHash, expiresAt } = createRefreshTokenValue();
  const newRec = await db.RefreshToken.create({
    tokenHash,
    userId: oldRecord.userId,
    userType: oldRecord.userType,
    ip,
    userAgent,
    expiresAt,
  });

  oldRecord.revoked = true;
  oldRecord.replacedByTokenId = newRec.id;
  await oldRecord.save();

  newRec.lastUsedAt = new Date();
  await newRec.save();

  return { newRaw: tokenRaw, newRec };
};

export const revokeRefreshToken = async (record) => {
  if (!record) return;
  record.revoked = true;
  await record.save();
};

export const listSessionsForUser = async ({ userId, userType }) => {
  const sessions = await db.RefreshToken.findAll({
    where: { userId, userType },
    order: [["createdAt", "DESC"]],
    attributes: ["id", "ip", "userAgent", "createdAt", "expiresAt", "lastUsedAt", "revoked", "replacedByTokenId"],
  });
  return sessions;
};
