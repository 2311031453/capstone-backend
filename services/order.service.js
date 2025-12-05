// services/order.service.js
import db from "../models/index.js";
import { v4 as uuidv4 } from "uuid";

export const createOrderService = async ({ payload, minePlannerId }) => {
  const {
    origin,
    destination,
    cargo_type,
    cargo_weight_tons,
    transport_mode,
    distance_km,
    planned_departure,
    origin_location,
    destination_location,
    travel_time_hr,
    actual_travel_time_hr,
    fuel_used_liters,
    fuel_cost_usd,
    delivery_status,
    delay_cause,
    co2_emission_kg,
    production_tons,
    fuel_consumed_liters,
    downtime_minutes,
    equipment_efficiency_percent,
    fuel_efficiency_tons_per_liter,
    incident_report,
    maintenance_required,
    production_cost_usd,
    revenue_usd,
    logistics_meta,
    production_meta
  } = payload;

  if (cargo_weight_tons <= 0) throw Object.assign(new Error("cargo_weight_tons harus > 0"), { status: 400 });

  const order_code = `ORD-${Date.now().toString(36).toUpperCase()}`;

  let estimated_cost_usd = null;
  if (distance_km && cargo_weight_tons) {
    estimated_cost_usd = Number((50 + distance_km * 0.5 + cargo_weight_tons * 2).toFixed(2));
  }

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
    status: "Created",
    estimated_cost_usd,
    minePlannerId,
    origin_location,
    destination_location,
    travel_time_hr,
    actual_travel_time_hr,
    fuel_used_liters,
    fuel_cost_usd,
    delivery_status,
    delay_cause,
    co2_emission_kg,
    production_tons,
    fuel_consumed_liters,
    downtime_minutes,
    equipment_efficiency_percent,
    fuel_efficiency_tons_per_liter,
    incident_report,
    maintenance_required,
    production_cost_usd,
    revenue_usd,
    logistics_meta,
    production_meta
  });

  return newOrder;
};

export const listOrdersForMinePlanner = async (minePlannerId) => {
  const orders = await db.Order.findAll({ 
    where: { minePlannerId }, 
    include: [{ 
      model: db.Schedule, 
      as: "schedules",
      include: [
        { model: db.ShippingPlanner, as: "shippingPlanner" }
      ]
    }],
    order: [['createdAt', 'DESC']]
  });
  return orders;
};

export const listOrdersForShippingService = async () => {
  const orders = await db.Order.findAll({
    where: { status: ['Created', 'Scheduled'] },
    include: [
      { model: db.MinePlanner, as: "minePlanner" },
      { 
        model: db.Schedule, 
        as: "schedules",
        include: [
          { model: db.ShippingPlanner, as: "shippingPlanner" }
        ]
      }
    ],
    order: [['createdAt', 'DESC']]
  });
  return orders;
};

export const getOrderByIdService = async (orderId) => {
  const order = await db.Order.findByPk(orderId, { 
    include: [
      { 
        model: db.Schedule, 
        as: "schedules",
        include: [
          { model: db.ShippingPlanner, as: "shippingPlanner" }
        ]
      },
      { model: db.MinePlanner, as: "minePlanner" }
    ] 
  });
  if (!order) throw Object.assign(new Error("Order tidak ditemukan"), { status: 404 });
  return order;
};

export const deleteOrderService = async (orderId, minePlannerId) => {
  const order = await db.Order.findByPk(orderId);
  
  if (!order) {
    throw Object.assign(new Error("Order tidak ditemukan"), { status: 404 });
  }
  
  if (order.minePlannerId !== minePlannerId) {
    throw Object.assign(new Error("Anda tidak memiliki izin untuk menghapus order ini"), { status: 403 });
  }
  
  if (order.status !== "Created") {
    throw Object.assign(new Error("Order hanya bisa dihapus jika statusnya Created"), { status: 400 });
  }
  
  // Check if order has schedules
  const schedules = await db.Schedule.findAll({ where: { orderId } });
  if (schedules.length > 0) {
    throw Object.assign(new Error("Order tidak bisa dihapus karena sudah memiliki schedule"), { status: 400 });
  }
  
  await order.destroy();
  
  return { message: "Order berhasil dihapus" };
};