const { PrismaClient } = require('@prisma/client');

// إنشاء نسخة واحدة من Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// التعامل مع أحداث Prisma
prisma.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});

// معالجة إغلاق الاتصال عند إيقاف التطبيق
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma; 