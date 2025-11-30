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
    road_condition_status: { type: DataTypes.STRING, allowNull: true }, // Good, Moderate, Bad
    weather_condition: { type: DataTypes.STRING, allowNull: true }, // Clear, Rainy, Storm
    status: { type: DataTypes.STRING, defaultValue: "Planned" }, // Planned, Ongoing, Completed, Delayed, Cancelled
    notes: { type: DataTypes.TEXT, allowNull: true },
    cost_usd: { type: DataTypes.FLOAT, allowNull: true },
  }, {
    tableName: "schedules",
    timestamps: true,
  });
  return Schedule;
};
