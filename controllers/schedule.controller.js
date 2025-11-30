//schedule.controller.js
import db from "../models/index.js";
import { v4 as uuidv4 } from "uuid";

export const createSchedule = async (req, res) => {
  try {
    const { orderId, vehicle_id, vessel_name, departure_time, arrival_time, road_condition_status, weather_condition, cost_usd, notes } = req.body;

    if (!orderId) return res.status(400).json({ message: "orderId wajib diisi" });

    const order = await db.Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: "Order tidak ditemukan" });

    const schedule = await db.Schedule.create({
      id: uuidv4(),
      orderId,
      shippingPlannerId: req.user.id,
      vehicle_id,
      vessel_name,
      departure_time,
      arrival_time,
      road_condition_status,
      weather_condition,
      cost_usd,
      notes,
      status: "Planned",
    });

    // update order status to Scheduled
    order.status = "Scheduled";
    await order.save();

    res.status(201).json({ message: "Schedule dibuat", schedule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateScheduleStatus = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { status, notes, road_condition_status, weather_condition } = req.body;

    const schedule = await db.Schedule.findByPk(scheduleId, { include: [{ model: db.Order, as: "order" }] });
    if (!schedule) return res.status(404).json({ message: "Schedule tidak ditemukan" });

    if (status) schedule.status = status;
    if (notes) schedule.notes = notes;
    if (road_condition_status) schedule.road_condition_status = road_condition_status;
    if (weather_condition) schedule.weather_condition = weather_condition;

    await schedule.save();

    // optional: update related order status based on schedule
    if (schedule.order) {
      if (status === "Ongoing") schedule.order.status = "In Transit";
      if (status === "Completed") schedule.order.status = "Completed";
      if (status === "Delayed") schedule.order.status = "Delayed";
      await schedule.order.save();
    }

    res.json({ message: "Schedule diperbarui", schedule });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const listSchedules = async (req, res) => {
  try {
    const where = {};
    // shipping planner listing own schedule; admin-style listing can be added
    if (req.user.role === "shipping_planner") {
      where.shippingPlannerId = req.user.id;
    }
    const schedules = await db.Schedule.findAll({ where, include: [{ model: db.Order, as: "order" }, { model: db.ShippingPlanner, as: "shippingPlanner" }] });
    res.json({ schedules });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
