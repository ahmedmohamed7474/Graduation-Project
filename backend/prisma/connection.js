const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error'],
    errorFormat: 'pretty',
  });
} else {
  // In development, use a global variable to prevent multiple instances during hot-reloading
  if (!global.__db) {
    global.__db = new PrismaClient({
      log: ['query', 'error', 'warn'],
      errorFormat: 'pretty',
    });
  }
  prisma = global.__db;
}

// Better error handling for connection issues
prisma.$on('error', (e) => {
  console.error('Prisma Error:', e);
});

// Handle queries for debugging in development
if (process.env.NODE_ENV !== 'production') {
  prisma.$on('query', (e) => {
    console.log('Query:', e.query);
    console.log('Duration:', e.duration + 'ms');
  });
}

// Graceful shutdown handling using process events
process.on('exit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT. Cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});

module.exports = prisma;
