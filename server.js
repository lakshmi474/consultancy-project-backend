import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import nodemailer from "nodemailer";
import ordersRouter from "./routes/orders.js";
import usersRouter from "./routes/users.js";
import medicinesRouter from "./routes/medicines.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

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

// Nodemailer transporter (configure via .env)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send order summary + prescription info email
app.post("/api/notify-order-email", async (req, res) => {
  try {
    const { order } = req.body;

    if (!order || !order.orderId) {
      return res.status(400).json({ error: "Order data is required" });
    }

    const lines = [
      `<strong>Order ID:</strong> ${order.orderId}`,
      `<strong>Customer:</strong> ${order.name} (${order.email || "N/A"})`,
      `<strong>Phone:</strong> ${order.phone || "N/A"}`,
      `<strong>Address:</strong> ${order.address}, ${order.city}, ${order.state} - ${order.pincode}`,
      `<strong>Payment Method:</strong> ${order.paymentMethod?.toUpperCase()}`,
      `<strong>Payment Status:</strong> ${order.paymentStatus || "N/A"}`,
      `<strong>Status:</strong> ${order.status || "Ready"}`,
      `<strong>Subtotal:</strong> ₹${Number(order.subtotal || 0).toFixed(2)}`,
      `<strong>Delivery Charge:</strong> ₹${Number(order.deliveryCharge || 0).toFixed(2)}`,
      `<strong>Total:</strong> ₹${Number(order.total || 0).toFixed(2)}`,
      "",
      "<strong>Items:</strong>",
    ];

    if (Array.isArray(order.items)) {
      order.items.forEach((item, index) => {
        lines.push(
          `${index + 1}. ${item.name} x${item.quantity} — ₹${(
            item.price * item.quantity
          ).toFixed(2)}`
        );
      });
    }

    lines.push("", "<strong>Prescriptions:</strong>");
    if (Array.isArray(order.prescriptionFiles) && order.prescriptionFiles.length) {
      order.prescriptionFiles.forEach((file, index) => {
        const label = typeof file === "string" ? file : file.name;
        lines.push(`${index + 1}. ${label}`);
      });
    } else {
      lines.push("No prescription files uploaded.");
    }

    const html = `
      <h2>New Order Placed</h2>
      <p>A new order has been placed from the Medicine web app.</p>
      <div>${lines.join("<br/>")}</div>
    `;

    // Build attachments from base64 data (if present)
    const attachments = [];
    if (Array.isArray(order.prescriptionFiles)) {
      order.prescriptionFiles.forEach((file) => {
        if (file && typeof file === "object" && file.dataUrl) {
          const [meta, base64Data] = String(file.dataUrl).split(",");
          if (!base64Data) return;

          const mimeMatch = meta.match(/data:(.*);base64/);
          const mimeType =
            file.type || (mimeMatch ? mimeMatch[1] : "application/octet-stream");

          attachments.push({
            filename: file.name || "prescription",
            content: base64Data,
            encoding: "base64",
            contentType: mimeType,
          });
        }
      });
    }

    await transporter.sendMail({
      from: order.email
        ? `"${order.name || "Customer"} via Star MediCare" <${
            process.env.EMAIL_FROM || process.env.EMAIL_USER
          }>`
        : process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: "ktilango@gmail.com",
      replyTo: order.email || undefined,
      subject: `New Order: ${order.orderId}`,
      html,
      attachments,
    });

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
