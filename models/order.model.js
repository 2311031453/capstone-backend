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
    status: { type: DataTypes.STRING, defaultValue: "Created" }, // Created, Scheduled, In Transit, Completed, Cancelled
    estimated_cost_usd: { type: DataTypes.FLOAT, allowNull: true },
    minePlannerId: { type: DataTypes.UUID, allowNull: false },
  }, {
    tableName: "orders",
    timestamps: true,
  });
  return Order;
};
