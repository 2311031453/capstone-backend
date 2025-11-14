export default (sequelize, DataTypes) => {
    const LogisticsMeta = sequelize.define("LogisticsMeta", {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      meta: { type: DataTypes.JSONB, allowNull: true }, // simpan features, categorical map, dsb
    }, {
      tableName: "logistics_meta",
      timestamps: true,
    });
    return LogisticsMeta;
  };
  