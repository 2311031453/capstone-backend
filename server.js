// server.js
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { sequelize } from "./models/index.js";
import authRoutes from "./routes/auth.routes.js";
import orderRoutes from "./routes/order.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import errorHandler from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

app.use(helmet());
// CORS: sesuaikan origin di .env bila perlu
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/schedules", scheduleRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// error handler must be last
app.use(errorHandler);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✔ Database connected.");
    await sequelize.sync({ alter: true });
    console.log("✔ Models synchronized.");

    app.listen(PORT, () => {
      console.log("====================================");
      console.log(`🚀 Server running at: http://localhost:${PORT}`);
      console.log(`📌 Environment     : ${process.env.NODE_ENV || "development"}`);
      console.log("====================================");
    });
  } catch (err) {
    console.error("❌ Unable to start server:", err);
    process.exit(1);
  }
})();
