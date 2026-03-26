import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

export const sendOrderNotification = async (order, type = 'new_order') => {
  try {
    const userEmail = order.user?.email || order.email || 'illakshmi2705@gmail.com';
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

    const payload = JSON.stringify({
      sender: {
        name: "Star MediCare",
        email: process.env.BREVO_SENDER_EMAIL || "illakshmi2705@gmail.com"
      },
      to: [{ email: userEmail, name: userName }],
      subject: subject,
      htmlContent: html
    });

    const options = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', (chunk) => { responseBody += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ Email sent to ${userEmail} via Brevo API`);
            resolve(true);
          } else {
            console.error(`❌ Brevo API error (${res.statusCode}):`, responseBody);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Error calling Brevo API:', error);
        resolve(false);
      });

      req.write(payload);
      req.end();
    });
  } catch (error) {
    console.error('❌ Error in sendOrderNotification:', error);
    return false;
  }
};
