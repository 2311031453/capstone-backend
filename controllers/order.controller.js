import db from "../models/index.js";
import { v4 as uuidv4 } from "uuid";

export const createOrder = async (req, res) => {
  try {
    const { origin, destination, cargo_type, cargo_weight_tons, transport_mode, distance_km, planned_departure } = req.body;

    if (!origin || !destination || !cargo_type || !cargo_weight_tons || !transport_mode) {
      return res.status(400).json({ message: "Field wajib: origin, destination, cargo_type, cargo_weight_tons, transport_mode" });
    }

    // create unique order_code
    const order_code = "ORD-" + Date.now().toString(36).toUpperCase();

    const newOrder = await db.Order.create({
      id: uuidv4(),
      order_code,
      origin,
      destination,
      cargo_type,
      cargo_weight_tons,
      transport_mode,
      distance_km,
      planned_departure,
      minePlannerId: req.user.id,
    });

    return res.status(201).json({ message: "Order berhasil dibuat", order: newOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const listOrdersMinePlanner = async (req, res) => {
  try {
    const minePlannerId = req.user.id;
    const orders = await db.Order.findAll({ where: { minePlannerId }, include: [{ model: db.Schedule, as: "schedules" }] });
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await db.Order.findByPk(orderId, { include: [{ model: db.Schedule, as: "schedules" }] });
    if (!order) return res.status(404).json({ message: "Order tidak ditemukan" });
    res.json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
