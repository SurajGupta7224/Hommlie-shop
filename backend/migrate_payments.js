require('./models/index');
const db = require('./config/db');

(async () => {
  try {
    await db.authenticate();
    console.log('DB connected');

    // Force create only payment tables
    const Payment = require('./models/paymentModel');
    const PaymentLog = require('./models/paymentLogModel');

    await Payment.sync({ alter: true });
    console.log('payments table: OK');

    await PaymentLog.sync({ alter: true });
    console.log('payment_logs table: OK');

    const [rows] = await db.query("SHOW TABLES LIKE 'payment%'");
    console.log('Tables found:', rows.map(r => Object.values(r)[0]));

    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
