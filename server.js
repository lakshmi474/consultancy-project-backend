import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import ordersRouter from "./routes/orders.js";
import usersRouter from "./routes/users.js";
import medicinesRouter from "./routes/medicines.js";
import { sendOrderNotification } from "./utils/email.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Basic health check
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// API Routes
app.use("/api/orders", ordersRouter);
app.use("/api/users", usersRouter);
app.use("/api/medicines", medicinesRouter);


// Send order summary + prescription info email
app.post("/api/notify-order-email", async (req, res) => {
  try {
    const { order } = req.body;
    if (!order || !order.orderId) {
      return res.status(400).json({ error: "Order data is required" });
    }
    
    await sendOrderNotification(order, 'new_order');
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error sending order email:", error);
    res.status(500).json({ error: "Failed to send order email" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
