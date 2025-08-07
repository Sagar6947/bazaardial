/* server/config/db.js */
const mongoose = require('mongoose');

module.exports = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌  MONGO_URI not set'); process.exit(1);
  }

  // Mongoose 8 uses the modern driver defaults already
  const opts = { maxPoolSize: 10, serverSelectionTimeoutMS: 5_000 };

  const connectWithRetry = async (tries = 0) => {
    try {
      await mongoose.connect(uri, opts);
      console.log('✅  MongoDB connected');
    } catch (err) {
      if (tries >= 3) {
        console.error('❌  MongoDB: max retries reached'); process.exit(1);
      }
      console.warn(`⏳  Retry MongoDB (${tries + 1}) in 2s`);
      setTimeout(() => connectWithRetry(tries + 1), 2_000);
    }
  };

  await connectWithRetry();

  mongoose.connection
    .on('disconnected', () => console.warn('⚠️  MongoDB disconnected'))
    .on('reconnected',  () => console.log('🔄  MongoDB re-connected'))
    .on('error',  (e)  => console.error('❌  MongoDB error:', e.message));
};
