export default (sequelize, DataTypes) => {
  const MinePlanner = sequelize.define("MinePlanner", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nama: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    no_telp: { type: DataTypes.STRING, allowNull: true },
    role: { type: DataTypes.STRING, defaultValue: "mine_planner" },
    password: { type: DataTypes.STRING, allowNull: false },
  }, {
    tableName: "mine_planners",
    timestamps: true,
  });
  return MinePlanner;
};
