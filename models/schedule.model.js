//schedule.model.js
export default (sequelize, DataTypes) => {
  const Schedule = sequelize.define("Schedule", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    orderId: { type: DataTypes.UUID, allowNull: false },
    shippingPlannerId: { type: DataTypes.UUID, allowNull: false },
    vehicle_id: { type: DataTypes.STRING, allowNull: true },
    vessel_name: { type: DataTypes.STRING, allowNull: true },
    departure_time: { type: DataTypes.DATE, allowNull: true },
    arrival_time: { type: DataTypes.DATE, allowNull: true },
    road_condition_status: { type: DataTypes.STRING, allowNull: true },
    weather_condition: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, defaultValue: "Planned" },
    notes: { type: DataTypes.TEXT, allowNull: true },
    cost_usd: { type: DataTypes.FLOAT, allowNull: true },
    
    // New attributes for weather
    temperature_c: { type: DataTypes.FLOAT, allowNull: true },
    humidity_percent: { type: DataTypes.FLOAT, allowNull: true },
    rainfall_mm: { type: DataTypes.FLOAT, allowNull: true },
    wind_speed_mps: { type: DataTypes.FLOAT, allowNull: true },
    wind_direction_deg: { type: DataTypes.FLOAT, allowNull: true },
    visibility_km: { type: DataTypes.FLOAT, allowNull: true },
    pressure_hpa: { type: DataTypes.FLOAT, allowNull: true },
    sea_state_level: { type: DataTypes.STRING, allowNull: true },
    wave_height_m: { type: DataTypes.FLOAT, allowNull: true },
    tide_level_m: { type: DataTypes.FLOAT, allowNull: true },
    storm_warning: { type: DataTypes.BOOLEAN, defaultValue: false },
    
    // New attributes for road
    surface_type: { type: DataTypes.STRING, allowNull: true },
    surface_condition: { type: DataTypes.STRING, allowNull: true },
    pothole_density: { type: DataTypes.FLOAT, allowNull: true },
    slope_angle_degrees: { type: DataTypes.FLOAT, allowNull: true },
    traffic_density: { type: DataTypes.STRING, allowNull: true },
    flood_level_m: { type: DataTypes.FLOAT, allowNull: true },
    access_status: { type: DataTypes.STRING, allowNull: true },
    dust_level_ppm: { type: DataTypes.FLOAT, allowNull: true },
    ground_vibration_mm_s: { type: DataTypes.FLOAT, allowNull: true },
    road_temperature_c: { type: DataTypes.FLOAT, allowNull: true },
    soil_moisture_percent: { type: DataTypes.FLOAT, allowNull: true },
    maintenance_activity: { type: DataTypes.BOOLEAN, defaultValue: false },
    accident_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    
    // New attributes for equipment
    machine_type: { type: DataTypes.STRING, allowNull: true },
    engine_temperature_c: { type: DataTypes.FLOAT, allowNull: true },
    oil_pressure_bar: { type: DataTypes.FLOAT, allowNull: true },
    fuel_level_percent: { type: DataTypes.FLOAT, allowNull: true },
    engine_rpm: { type: DataTypes.FLOAT, allowNull: true },
    vibration_level_g: { type: DataTypes.FLOAT, allowNull: true },
    hydraulic_pressure_bar: { type: DataTypes.FLOAT, allowNull: true },
    working_hours: { type: DataTypes.FLOAT, allowNull: true },
    maintenance_status: { type: DataTypes.STRING, allowNull: true },
    fault_code: { type: DataTypes.STRING, allowNull: true },
    operational_mode: { type: DataTypes.STRING, allowNull: true },
    ambient_temperature_c: { type: DataTypes.FLOAT, allowNull: true },
    gear_position: { type: DataTypes.STRING, allowNull: true },
    fuel_consumption_l_h: { type: DataTypes.FLOAT, allowNull: true },
    torque_nm: { type: DataTypes.FLOAT, allowNull: true },
    engine_load_percent: { type: DataTypes.FLOAT, allowNull: true },
    
    // New attributes for vessel
    delay_minutes: { type: DataTypes.INTEGER, defaultValue: 0 },
    cargo_type_vessel: { type: DataTypes.STRING, allowNull: true },
    load_weight_tons: { type: DataTypes.FLOAT, allowNull: true },
    port_condition: { type: DataTypes.STRING, allowNull: true },
    weather_impact_score: { type: DataTypes.FLOAT, allowNull: true },
    sea_condition_code: { type: DataTypes.STRING, allowNull: true },
    crew_availability_percent: { type: DataTypes.FLOAT, allowNull: true },
    vessel_status: { type: DataTypes.STRING, allowNull: true },
    fuel_consumption_tons: { type: DataTypes.FLOAT, allowNull: true },
    distance_traveled_km: { type: DataTypes.FLOAT, allowNull: true },
    average_speed_knots: { type: DataTypes.FLOAT, allowNull: true },
    departure_hour: { type: DataTypes.INTEGER, allowNull: true },
    departure_weekday: { type: DataTypes.STRING, allowNull: true },
    departure_month: { type: DataTypes.STRING, allowNull: true },
    planned_duration_hours: { type: DataTypes.FLOAT, allowNull: true },
    
    // Meta data for additional features
    weather_meta: { type: DataTypes.JSONB, allowNull: true },
    road_meta: { type: DataTypes.JSONB, allowNull: true },
    equipment_meta: { type: DataTypes.JSONB, allowNull: true },
    vessel_meta: { type: DataTypes.JSONB, allowNull: true }
  }, {
    tableName: "schedules",
    timestamps: true,
  });
  return Schedule;
};
