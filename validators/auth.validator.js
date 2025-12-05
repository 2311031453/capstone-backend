// validators/auth.validator.js
import Joi from "joi";

export const registerSchema = Joi.object({
  nama: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  no_telp: Joi.string().allow(null, ""),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().valid("mine_planner", "shipping_planner").required(),
});
