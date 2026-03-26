import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOrderNotification = async (order, type = 'new_order') => {
  try {
    const userEmail = order.user?.email || order.email || 'ktilango@gmail.com';
    const userName = order.user?.name || order.name || 'Customer';
    
    let subject = `Order Update: ${order.orderNumber || order.orderId}`;
    let title = 'Order Update';
    let message = '';

    if (type === 'new_order') {
      subject = `New Order Placed: ${order.orderNumber || order.orderId}`;
      title = 'Order Confirmation';
      message = 'Your order has been placed successfully and is currently being processed.';
    } else if (type === 'prescription_approved') {
      subject = `Prescription Approved: ${order.orderNumber || order.orderId}`;
      title = 'Prescription Approved';
      message = `Good news! Your prescription for order #${order.orderNumber} has been approved. We are now preparing your delivery.`;
    } else if (type === 'prescription_rejected') {
      subject = `Prescription Rejected: ${order.orderNumber || order.orderId}`;
      title = 'Prescription Rejected';
      message = `Unfortunately, your prescription for order #${order.orderNumber} was not approved. Please contact support or upload a valid prescription.`;
    } else if (type === 'status_ready') {
      subject = `Order Ready for Shipping: ${order.orderNumber}`;
      title = 'Order Ready';
      message = `Your order #${order.orderNumber} is now ready and will be shipped shortly.`;
    } else if (type === 'status_out_for_delivery') {
      subject = `Order Out for Delivery: ${order.orderNumber}`;
      title = 'Out for Delivery';
      message = `Your order #${order.orderNumber} is out for delivery and will reach you soon!`;
    } else if (type === 'status_delivered') {
      subject = `Order Delivered: ${order.orderNumber}`;
      title = 'Order Delivered';
      message = `Your order #${order.orderNumber} has been successfully delivered. Thank you for shopping with us!`;
    } else if (type === 'status_cancelled') {
      subject = `Order Cancelled: ${order.orderNumber}`;
      title = 'Order Cancelled';
      message = `Your order #${order.orderNumber} has been cancelled as per your request or due to verification issues. Any payments made will be refunded.`;
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0f5132;">${title}</h2>
        <p>Hello ${userName},</p>
        <p>${message}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p><strong>Order ID:</strong> ${order.orderNumber || order.orderId}</p>
        <p><strong>Total:</strong> ₹${order.total.toFixed(2)}</p>
        ${order.deliveryDate ? `<p><strong>Estimated Delivery:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</p>` : ''}
        <br>
        <p>Thank you for choosing Star MediCare!</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Star MediCare" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${userEmail} for ${type}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending notification email:', error);
    return false;
  }
};
