import { Sequelize, DataTypes } from "sequelize";
import dbConfig from "../config/db.config.js";

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: false,
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// load models
import makeMinePlanner from "./minePlanner.model.js";
import makeShippingPlanner from "./shippingPlanner.model.js";
import makeOrder from "./order.model.js";
import makeSchedule from "./schedule.model.js";
import makeLogisticsMeta from "./logistics_meta.model.js";

db.MinePlanner = makeMinePlanner(sequelize, DataTypes);
db.ShippingPlanner = makeShippingPlanner(sequelize, DataTypes);
db.Order = makeOrder(sequelize, DataTypes);
db.Schedule = makeSchedule(sequelize, DataTypes);
db.LogisticsMeta = makeLogisticsMeta(sequelize, DataTypes);

// Associations
db.MinePlanner.hasMany(db.Order, { foreignKey: "minePlannerId", as: "orders" });
db.Order.belongsTo(db.MinePlanner, { foreignKey: "minePlannerId", as: "minePlanner" });

db.ShippingPlanner.hasMany(db.Schedule, { foreignKey: "shippingPlannerId", as: "schedules" });
db.Schedule.belongsTo(db.ShippingPlanner, { foreignKey: "shippingPlannerId", as: "shippingPlanner" });

db.Order.hasMany(db.Schedule, { foreignKey: "orderId", as: "schedules" });
db.Schedule.belongsTo(db.Order, { foreignKey: "orderId", as: "order" });

// FIX: jangan redeclare sequelize
export { sequelize };
export default db;
