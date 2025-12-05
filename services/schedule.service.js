// services/schedule.service.js - UPDATE LIST SCHEDULES SERVICE
import db from "../models/index.js";
import { v4 as uuidv4 } from "uuid";

export const createScheduleService = async ({ payload, shippingPlannerId }) => {
  const { orderId, vehicle_id, vessel_name, departure_time, arrival_time, road_condition_status, weather_condition, cost_usd, notes } = payload;

  // validate order exists
  const order = await db.Order.findByPk(orderId);
  if (!order) throw Object.assign(new Error("Order tidak ditemukan"), { status: 404 });

  // business rule: cannot schedule if order already Completed/Cancelled
  if (["Completed", "Cancelled"].includes(order.status)) {
    throw Object.assign(new Error("Order sudah tidak dapat dijadwalkan (status tidak valid)"), { status: 400 });
  }

  const schedule = await db.Schedule.create({
    id: uuidv4(),
    orderId,
    shippingPlannerId,
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

  return schedule;
};

export const updateScheduleStatusService = async ({ scheduleId, payload }) => {
  const { status, notes, road_condition_status, weather_condition } = payload;
  const schedule = await db.Schedule.findByPk(scheduleId, { include: [{ model: db.Order, as: "order" }] });
  if (!schedule) throw Object.assign(new Error("Schedule tidak ditemukan"), { status: 404 });

  if (status) schedule.status = status;
  if (notes !== undefined) schedule.notes = notes;
  if (road_condition_status !== undefined) schedule.road_condition_status = road_condition_status;
  if (weather_condition !== undefined) schedule.weather_condition = weather_condition;

  await schedule.save();

  // update related order status
  if (schedule.order) {
    if (status === "Ongoing") schedule.order.status = "In Transit";
    if (status === "Completed") schedule.order.status = "Completed";
    if (status === "Delayed") schedule.order.status = "Delayed";
    await schedule.order.save();
  }

  return schedule;
};

// PERBAIKAN PENTING: Fungsi listSchedulesService untuk menangani kedua role
export const listSchedulesService = async ({ user }) => {
  let where = {};
  let include = [
    { 
      model: db.Order, 
      as: "order",
      include: [
        { model: db.MinePlanner, as: "minePlanner" }
      ]
    }, 
    { model: db.ShippingPlanner, as: "shippingPlanner" }
  ];

  // Jika shipping planner, hanya tampilkan schedules yang mereka buat
  if (user.role === "shipping_planner") {
    where.shippingPlannerId = user.id;
  }
  // Jika mine planner, hanya tampilkan schedules untuk order mereka
  else if (user.role === "mine_planner") {
    // Gunakan kondisi melalui include order
    include = [
      { 
        model: db.Order, 
        as: "order",
        where: { minePlannerId: user.id },
        required: true,
        include: [
          { model: db.MinePlanner, as: "minePlanner" }
        ]
      }, 
      { model: db.ShippingPlanner, as: "shippingPlanner" }
    ];
  }

  const schedules = await db.Schedule.findAll({
    where,
    include,
    order: [["createdAt", "DESC"]],
  });

  return schedules;
};

// Tambahkan fungsi untuk mendapatkan schedule detail
export const getScheduleDetailService = async ({ scheduleId, user }) => {
  let include = [
    { 
      model: db.Order, 
      as: "order",
      include: [
        { model: db.MinePlanner, as: "minePlanner" }
      ]
    }, 
    { model: db.ShippingPlanner, as: "shippingPlanner" }
  ];

  const schedule = await db.Schedule.findByPk(scheduleId, {
    include
  });

  if (!schedule) {
    throw Object.assign(new Error("Schedule tidak ditemukan"), { status: 404 });
  }

  // Authorization check
  if (user.role === "mine_planner" && schedule.order.minePlannerId !== user.id) {
    throw Object.assign(new Error("Anda tidak memiliki akses ke schedule ini"), { status: 403 });
  }

  if (user.role === "shipping_planner" && schedule.shippingPlannerId !== user.id) {
    throw Object.assign(new Error("Anda tidak memiliki akses ke schedule ini"), { status: 403 });
  }

  return schedule;
};

// Fungsi untuk mendapatkan schedules berdasarkan orderId
export const getSchedulesByOrderIdService = async ({ orderId, user }) => {
  let where = { orderId };
  
  // Authorization: mine planner hanya bisa lihat schedules untuk order mereka sendiri
  if (user.role === "mine_planner") {
    const order = await db.Order.findByPk(orderId);
    if (!order) {
      throw Object.assign(new Error("Order tidak ditemukan"), { status: 404 });
    }
    if (order.minePlannerId !== user.id) {
      throw Object.assign(new Error("Anda tidak memiliki akses ke order ini"), { status: 403 });
    }
  }

  const schedules = await db.Schedule.findAll({
    where,
    include: [
      { 
        model: db.Order, 
        as: "order",
        include: [
          { model: db.MinePlanner, as: "minePlanner" }
        ]
      }, 
      { model: db.ShippingPlanner, as: "shippingPlanner" }
    ],
    order: [["createdAt", "DESC"]],
  });

  return schedules;
};