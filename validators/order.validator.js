// validators/order.validator.js
import Joi from "joi";

export const createOrderSchema = Joi.object({
  origin: Joi.string().required(),
  destination: Joi.string().required(),
  cargo_type: Joi.string().required(),
  cargo_weight_tons: Joi.number().positive().required(),
  transport_mode: Joi.string().required(),
  distance_km: Joi.number().positive().optional(),
  planned_departure: Joi.date().optional().allow(null),
  
  // New logistics attributes
  origin_location: Joi.string().optional().allow(null, ""),
  destination_location: Joi.string().optional().allow(null, ""),
  travel_time_hr: Joi.number().positive().optional().allow(null),
  actual_travel_time_hr: Joi.number().positive().optional().allow(null),
  fuel_used_liters: Joi.number().positive().optional().allow(null),
  fuel_cost_usd: Joi.number().positive().optional().allow(null),
  delivery_status: Joi.string().optional().allow(null, ""),
  delay_cause: Joi.string().optional().allow(null, ""),
  co2_emission_kg: Joi.number().positive().optional().allow(null),
  
  // New production attributes
  production_tons: Joi.number().positive().optional().allow(null),
  fuel_consumed_liters: Joi.number().positive().optional().allow(null),
  downtime_minutes: Joi.number().integer().positive().optional().allow(null),
  equipment_efficiency_percent: Joi.number().min(0).max(100).optional().allow(null),
  fuel_efficiency_tons_per_liter: Joi.number().positive().optional().allow(null),
  incident_report: Joi.string().optional().allow(null, ""),
  maintenance_required: Joi.boolean().optional().allow(null),
  production_cost_usd: Joi.number().positive().optional().allow(null),
  revenue_usd: Joi.number().positive().optional().allow(null),
  
  // Meta data
  logistics_meta: Joi.object().optional().allow(null),
  production_meta: Joi.object().optional().allow(null)
});