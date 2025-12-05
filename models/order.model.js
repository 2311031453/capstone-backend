//order.model.js
export default (sequelize, DataTypes) => {
  const Order = sequelize.define("Order", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    order_code: { type: DataTypes.STRING, allowNull: false, unique: true },
    origin: { type: DataTypes.STRING, allowNull: false },
    destination: { type: DataTypes.STRING, allowNull: false },
    cargo_type: { type: DataTypes.STRING, allowNull: false },
    cargo_weight_tons: { type: DataTypes.FLOAT, allowNull: false },
    transport_mode: { type: DataTypes.STRING, allowNull: false },
    distance_km: { type: DataTypes.FLOAT, allowNull: true },
    planned_departure: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.STRING, defaultValue: "Created" },
    estimated_cost_usd: { type: DataTypes.FLOAT, allowNull: true },
    minePlannerId: { type: DataTypes.UUID, allowNull: false },
    
    // New attributes for logistics
    origin_location: { type: DataTypes.STRING, allowNull: true },
    destination_location: { type: DataTypes.STRING, allowNull: true },
    travel_time_hr: { type: DataTypes.FLOAT, allowNull: true },
    actual_travel_time_hr: { type: DataTypes.FLOAT, allowNull: true },
    fuel_used_liters: { type: DataTypes.FLOAT, allowNull: true },
    fuel_cost_usd: { type: DataTypes.FLOAT, allowNull: true },
    delivery_status: { type: DataTypes.STRING, allowNull: true },
    delay_cause: { type: DataTypes.STRING, allowNull: true },
    co2_emission_kg: { type: DataTypes.FLOAT, allowNull: true },
    
    // New attributes for production
    production_tons: { type: DataTypes.FLOAT, allowNull: true },
    fuel_consumed_liters: { type: DataTypes.FLOAT, allowNull: true },
    downtime_minutes: { type: DataTypes.INTEGER, allowNull: true },
    equipment_efficiency_percent: { type: DataTypes.FLOAT, allowNull: true },
    fuel_efficiency_tons_per_liter: { type: DataTypes.FLOAT, allowNull: true },
    incident_report: { type: DataTypes.TEXT, allowNull: true },
    maintenance_required: { type: DataTypes.BOOLEAN, defaultValue: false },
    production_cost_usd: { type: DataTypes.FLOAT, allowNull: true },
    revenue_usd: { type: DataTypes.FLOAT, allowNull: true },
    
    // Meta data for additional features
    logistics_meta: { type: DataTypes.JSONB, allowNull: true },
    production_meta: { type: DataTypes.JSONB, allowNull: true }
  }, {
    tableName: "orders",
    timestamps: true,
  });
  return Order;
};