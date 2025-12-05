// controllers/order.controller.js
import asyncHandler from "../middlewares/asyncHandler.js";
import * as OrderService from "../services/order.service.js";
import { created, ok } from "../utils/response.util.js";
import { createOrderSchema } from "../validators/order.validator.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { error: vErr } = createOrderSchema.validate(req.body);
  if (vErr) return res.status(400).json({ message: vErr.message });

  const newOrder = await OrderService.createOrderService({ payload: req.body, minePlannerId: req.user.id });
  return created(res, { order: newOrder }, "Order berhasil dibuat");
});

export const listOrdersMinePlanner = asyncHandler(async (req, res) => {
  const minePlannerId = req.user.id;
  const orders = await OrderService.listOrdersForMinePlanner(minePlannerId);
  return ok(res, { orders }, "Orders fetched");
});

export const listOrdersForShipping = asyncHandler(async (req, res) => {
  const orders = await OrderService.listOrdersForShippingService();
  return ok(res, { orders }, "Orders fetched for shipping planner");
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await OrderService.getOrderByIdService(orderId);
  return ok(res, { order }, "Order detail");
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const minePlannerId = req.user.id;
  
  const result = await OrderService.deleteOrderService(orderId, minePlannerId);
  return ok(res, {}, result.message);
});