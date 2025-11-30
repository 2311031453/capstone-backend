//shippingPlanner.model.js
export default (sequelize, DataTypes) => {
  const ShippingPlanner = sequelize.define("ShippingPlanner", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nama: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    no_telp: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.STRING, defaultValue: "shipping_planner" },
    password: { type: DataTypes.STRING, allowNull: false },
  }, {
    tableName: "shipping_planners",
    timestamps: true,
  });
  return ShippingPlanner;
};
