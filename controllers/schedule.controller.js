// controllers/schedule.controller.js - UPDATE
import asyncHandler from "../middlewares/asyncHandler.js";
import * as ScheduleService from "../services/schedule.service.js";
import { created, ok } from "../utils/response.util.js";
import { createScheduleSchema, updateScheduleSchema } from "../validators/schedule.validator.js";

export const createSchedule = asyncHandler(async (req, res) => {
  const { error: vErr } = createScheduleSchema.validate(req.body);
  if (vErr) return res.status(400).json({ message: vErr.message });

  const schedule = await ScheduleService.createScheduleService({ 
    payload: req.body, 
    shippingPlannerId: req.user.id 
  });
  return created(res, { schedule }, "Schedule dibuat");
});

export const updateScheduleStatus = asyncHandler(async (req, res) => {
  const { error: vErr } = updateScheduleSchema.validate(req.body);
  if (vErr) return res.status(400).json({ message: vErr.message });

  const { scheduleId } = req.params;
  const schedule = await ScheduleService.updateScheduleStatusService({ 
    scheduleId, 
    payload: req.body 
  });
  return ok(res, { schedule }, "Schedule diperbarui");
});

export const listSchedules = asyncHandler(async (req, res) => {
  const schedules = await ScheduleService.listSchedulesService({ user: req.user });
  return ok(res, { schedules }, "Schedules fetched");
});

// TAMBAHKAN: Fungsi untuk mendapatkan detail schedule
export const getScheduleDetail = asyncHandler(async (req, res) => {
  const { scheduleId } = req.params;
  const schedule = await ScheduleService.getScheduleDetailService({
    scheduleId,
    user: req.user
  });
  return ok(res, { schedule }, "Schedule detail fetched");
});

// TAMBAHKAN: Fungsi untuk mendapatkan schedules berdasarkan orderId
export const getSchedulesByOrderId = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const schedules = await ScheduleService.getSchedulesByOrderIdService({
    orderId,
    user: req.user
  });
  return ok(res, { schedules }, "Schedules fetched by order");
});