require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const prisma = require('./prisma/connection');

// Import Routes
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const cartRoutes = require('./routes/cart.routes');
const cartItemRoutes = require('./routes/cartitem.routes');
const orderRoutes = require('./routes/order.routes');
const orderItemRoutes = require('./routes/orderitem.routes');
const tryonRoutes = require('./routes/tryon.routes');
const faceAnalysisRoutes = require('./routes/face-analysis.routes');

const app = express();

// الإعدادات الأساسية
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));

// Configure helmet but allow images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));

app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// تكوين المسارات
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/cart-items', cartItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-items', orderItemRoutes);
app.use('/api/tryon', tryonRoutes);
app.use('/api/face-analysis', faceAnalysisRoutes);

// معالجة الأخطاء
app.use((req, res, next) => {
  const error = new Error('المسار غير موجود');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || 'Something went wrong!';
  res.status(status).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3002;

// Function to start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Successfully connected to database');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();

// معالجة الإغلاق بشكل آمن
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// معالجة الأخطاء غير المتوقعة
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (error.code === 'P1001') {
    console.error('Prisma Database Connection Error. Checking connection...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    prisma.$connect()
      .then(() => {
        console.log('Database connection successful');
        prisma.$disconnect();
      })
      .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
      });
  } else {
    process.exit(1);
  }
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

module.exports = app;
