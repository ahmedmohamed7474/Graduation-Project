# SmartStyle - Virtual Try-On Eyewear Application

<div align="center">
  <img src="https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react" alt="React Version" />
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js" alt="Node.js Express" />
  <img src="https://img.shields.io/badge/Prisma-MySQL-orange?style=for-the-badge&logo=prisma" alt="Prisma MySQL" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.3.3-38B2AC?style=for-the-badge&logo=tailwind-css" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/AI-MediaPipe-purple?style=for-the-badge" alt="AI MediaPipe" />
</div>

## 📖 Overview

SmartStyle is a cutting-edge virtual try-on eyewear application that leverages artificial intelligence to provide users with an immersive shopping experience. The application allows customers to virtually try on glasses using their photos, analyze their face shape for personalized recommendations, and complete purchases through a seamless e-commerce platform.

### 🎯 Key Features

- **Virtual Try-On**: Upload photos and see how glasses look on you instantly
- **Face Shape Analysis**: AI-powered face shape detection for personalized recommendations
- **E-commerce Platform**: Complete shopping experience with cart, checkout, and order management
- **Admin Dashboard**: Comprehensive admin panel for product and order management
- **User Authentication**: Secure login/signup system with role-based access
- **Responsive Design**: Modern, mobile-friendly interface built with TailwindCSS

## 🏗️ Architecture

The project follows a modern full-stack architecture with:

- **Frontend**: React 19 with Vite, TailwindCSS, and React Router
- **Backend**: Node.js with Express.js, Prisma ORM, and MySQL database
- **AI/ML**: MediaPipe for face detection and analysis
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **File Upload**: Multer for image uploads and processing

## 📁 Project Structure

```
Graduation-Project/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── contexts/         # React context providers
│   │   ├── pages/           # Page components
│   │   └── App.jsx          # Main application component
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
├── backend/                  # Node.js backend application
│   ├── controllers/         # Request handlers
│   ├── routes/              # API route definitions
│   ├── middleware/          # Custom middleware
│   ├── prisma/              # Database schema and migrations
│   ├── uploads/             # File upload directory
│   ├── utils/               # Utility functions
│   ├── index.js             # Server entry point
│   └── package.json         # Backend dependencies
├── test_grad/               # Testing directory
├── cyclegan.ipynb           # AI/ML model notebook
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/en/download/)
- **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/)
- **Python** (v3.8 or higher) - For AI/ML components

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/ahmedmohamed7474/Graduation-Project.git
cd Graduation-Project
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and other configurations

# Set up the database
npx prisma generate
npx prisma migrate dev --name initDB

# Start the development server
npm start
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/smartstyle_db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# Server Configuration
PORT=3002
NODE_ENV=development

# File Upload
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=10485760

# CORS Origins
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

## 🛠️ Technologies Used

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Prop Types** - Runtime type checking

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Prisma** - Modern database ORM
- **MySQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload middleware
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

### AI/ML
- **MediaPipe** - Face detection and analysis
- **OpenCV** - Computer vision library
- **NumPy** - Numerical computing
- **CycleGAN** - Image-to-image translation

## 📊 Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users** - User accounts with role-based access
- **Products** - Eyewear products with images and details
- **Carts** - Shopping cart functionality
- **Orders** - Order management with payment processing
- **Reviews** - Product reviews and ratings
- **Roles** - User role management (Admin, Customer)

## 🔧 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart-items` - Add item to cart
- `PUT /api/cart-items/:id` - Update cart item
- `DELETE /api/cart-items/:id` - Remove item from cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status (Admin)

### Virtual Try-On
- `POST /api/tryon` - Process virtual try-on
- `POST /api/face-analysis` - Analyze face shape

## 🎨 Features in Detail

### Virtual Try-On System
- Upload user photos
- AI-powered glasses overlay
- Real-time preview generation
- Save try-on results

### Face Shape Analysis
- Automatic face detection
- Face shape classification
- Personalized recommendations
- Style suggestions

### E-commerce Features
- Product catalog with search and filtering
- Shopping cart management
- Secure checkout process
- Order tracking
- Payment processing (Debit Card/Cash)

### Admin Dashboard
- Product management (CRUD operations)
- Order management and status updates
- User management
- Sales analytics
- Inventory tracking

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for password security
- **CORS Protection** - Cross-origin request security
- **Helmet.js** - Security headers
- **Input Validation** - Request data validation
- **Role-based Access Control** - Admin and user permissions

## 🧪 Testing

The project includes comprehensive testing:

```bash
# Frontend testing
cd frontend
npm run test

# Backend testing
cd backend
npm test
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes and orientations

## 🚀 Deployment

### Production Build

```bash
# Frontend build
cd frontend
npm run build

# Backend production
cd backend
NODE_ENV=production npm start
```

### Deployment Options
- **Vercel** - Frontend deployment
- **Railway** - Backend deployment
- **AWS** - Full-stack deployment
- **Heroku** - Alternative deployment option

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

This project was developed as a graduation project by:
- [Ziad Ahmed] - Full Stack Developer
- [Amir Salama] - Full Stack Developer
- [Ziad Tamer] - AI/ML Specialist
- [Omar Kassem] - AI/ML Specialist
- [Ahmed Mohamed] - UI/UX Designer

## 📞 Support

For support and questions:
- Email: [omarten17@gmail.com]
## 🙏 Acknowledgments

- MediaPipe team for face detection capabilities
- Prisma team for the excellent ORM
- React and Vite communities for the amazing tools
- TailwindCSS for the beautiful styling framework

---

<div align="center">
  <p>Made with ❤️ for the graduation project</p>
  <p>SmartStyle - The Future of Eyewear Shopping</p>
</div> 
=======
hello
>>>>>>> 54fd6184622b3c7ec5953e2c9893c0fd8d34d170
