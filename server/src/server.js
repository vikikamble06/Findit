const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = env.PORT || 5000;

let server;

async function startServer() {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 FindIt Server running in ${env.NODE_ENV} mode`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('❌ Failed to start FindIt server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Gracefully shutting down FindIt server...');
  if (server) {
    server.close(async () => {
      await disconnectDB();
      console.log('✅ Server and database connections closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
