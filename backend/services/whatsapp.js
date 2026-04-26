const axios = require('axios');

/**
 * Send WhatsApp notification via CallMeBot (free service)
 *
 * SETUP (one-time, takes 1 minute):
 * 1. Save +34 644 59 87 26 in your phone contacts as "CallMeBot"
 * 2. Send this WhatsApp message to that number: "I allow callmebot to send me messages"
 * 3. You will receive your APIKEY via WhatsApp
 * 4. Set CALLMEBOT_APIKEY and ADMIN_WHATSAPP in your .env file
 */

const sendWhatsApp = async (phone, message) => {
  const apiKey = process.env.CALLMEBOT_APIKEY;
  if (!apiKey) {
    // WhatsApp not configured — log to console instead
    console.log(`[WhatsApp Not Configured] Would send to ${phone}:\n${message}`);
    return;
  }

  // CallMeBot requires Pakistani numbers without leading 0, prefixed with country code
  // e.g. 03178384342 → 923178384342
  const formatted = phone.replace(/^0/, '92');
  const encoded = encodeURIComponent(message);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${formatted}&text=${encoded}&apikey=${apiKey}`;

  try {
    await axios.get(url, { timeout: 8000 });
    console.log(`[WhatsApp] ✅ Sent to ${formatted}`);
  } catch (err) {
    console.error(`[WhatsApp] ❌ Failed: ${err.message}`);
  }
};

const orderPlacedAdminMsg = (order) =>
  `🛒 *New SellMix Order!*\n` +
  `━━━━━━━━━━━━━━\n` +
  `📋 Order: *#${order.orderId}*\n` +
  `👤 Customer: ${order.customerName}\n` +
  `📱 WhatsApp: ${order.whatsapp}\n` +
  `📍 Address: ${order.address}\n` +
  `💰 Total: *Rs. ${order.total?.toLocaleString()}*\n` +
  `💳 Payment: ${order.paymentMethod}\n` +
  `🧾 Items: ${order.items?.length} item(s)\n` +
  `━━━━━━━━━━━━━━\n` +
  `📦 Chichawatni Delivery`;

const orderPlacedCustomerMsg = (order) =>
  `✅ *SellMix Order Confirmed!*\n` +
  `━━━━━━━━━━━━━━\n` +
  `Your order *#${order.orderId}* has been received.\n` +
  `Total: *Rs. ${order.total?.toLocaleString()}*\n` +
  `Payment: ${order.paymentMethod}\n\n` +
  `We will deliver to:\n${order.address}\n` +
  `━━━━━━━━━━━━━━\n` +
  `Track: SellMix App → Track Order → ${order.orderId}\n` +
  `Thank you for shopping at SellMix! 🛵`;

module.exports = { sendWhatsApp, orderPlacedAdminMsg, orderPlacedCustomerMsg };
