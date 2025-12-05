// utils/password.util.js
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const hashPassword = async (plain) => {
  return await bcrypt.hash(plain, SALT_ROUNDS);
};

export const comparePassword = async (plain, hash) => {
  return await bcrypt.compare(plain, hash);
};
