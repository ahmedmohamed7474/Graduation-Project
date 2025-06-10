import { useState, useRef, useEffect } from "react";
import "./App.css";
import ProductCard from "./components/ProductCard";

import TryOnModal from "./components/TryOnModal";
import FaceShapeAnalyzer from "./components/FaceShapeAnalyzer";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import CartIcon from "./components/CartIcon";
import CartDrawer from "./components/CartDrawer";
import Toast from "./components/Toast";
import Orders from "./components/Orders";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";





function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedGlasses, setSelectedGlasses] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [products, setProducts] = useState([]);
  const glassesRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleTryOn = (glasses) => {
    setSelectedGlasses(glasses);
    setIsModalOpen(true);
  };

  const handleAddToCart = (product) => {
    setToastMessage(`${product.name} added to cart`);
    setShowToast(true);
  };

  const handleLogout = () => {
    logout();
  };

  const scrollToGlasses = () => {
    glassesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Router>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation */}
          <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center space-x-2">
                  {user?.roleId === 1 ? (
                    <span className="text-xl font-bold text-gray-900">SmartStyle</span>
                  ) : (
                    <Link to="/" className="text-xl font-bold text-gray-900">
                      SmartStyle
                    </Link>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  {user ? (
                    <>
                      <span className="text-gray-600">Welcome, {user.name}</span>
                      {user.roleId !== 1 && (
                        <Link
                          to="/orders"
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          My Orders
                        </Link>
                      )}
                      {user.roleId === 1 && (
                        <Link
                          to="/admin"
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="text-gray-600 hover:text-white hover:bg-black transition-colors duration-200 px-4 py-2 rounded-md"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="text-gray-600 hover:text-white hover:bg-black transition-colors duration-200 px-4 py-2 rounded-md"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="text-gray-600 hover:text-white hover:bg-black transition-colors duration-200 px-4 py-2 rounded-md"
                      >
                        Signup
                      </Link>
                    </>
                  )}
                  {(!user || user.roleId !== 1) && (
                    <button
                      onClick={() => setIsCartOpen(true)}
                      className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <CartIcon />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Add padding to account for fixed navbar */}
          <div className="pt-16">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/face-analysis" element={<FaceShapeAnalyzer />} />
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/"
                element={
                  <>
                    {/* Hero Section */}
                    <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
                      {/* Background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100 opacity-90" />
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiA0NGM0LjQxOCAwIDgtMy41ODIgOC04cy0zLjU4Mi04LTgtOC04IDMuNTgyLTggOCAzLjU4MiA4IDggOHoiIGZpbGw9IiNlZWYiLz48L2c+PC9zdmc+')] opacity-5" />
                      <div className="relative text-center max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                          Virtual Try-On
                          <span className="block text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                            Eyeglasses
                          </span>
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                          Experience the future of eyewear shopping. Upload your
                          photo and see how our glasses look on you instantly!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                          <button
                            onClick={scrollToGlasses}
                            className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
                          >
                            <span>Try Glasses Now</span>
                            <svg
                              className="w-5 h-5 animate-bounce group-hover:animate-none"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                              />
                            </svg>
                          </button>
                          <Link
                            to="/face-analysis"
                            className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 border-2 border-blue-600"
                          >
                            <span>Analyze Face Shape</span>
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 5l7 7-7 7M5 5l7 7-7 7"
                              />
                            </svg>
                          </Link>
                        </div>
                        <div className="mt-12 flex justify-center gap-8 text-gray-500">
                          <div className="flex items-center space-x-2">
                            <svg
                              className="w-6 h-6 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>100% Virtual Try-On</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <svg
                              className="w-6 h-6 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>Instant Results</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <svg
                              className="w-6 h-6 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                            <span>Secure Payment</span>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Face Shape Analysis Section */}
                    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
                      <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Find Your Perfect Fit
                          </h2>
                          <p className="text-gray-600 max-w-2xl mx-auto">
                            Upload a photo to analyze your face shape and get
                            personalized frame recommendations
                          </p>
                        </div>
                        <FaceShapeAnalyzer />
                      </div>
                    </section>

                    {/* Eyeglasses Products Section */}
                    <div
                      ref={glassesRef}
                      className="py-16 px-4 sm:px-6 lg:px-8"
                    >
                      <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Our Collection
                          </h2>
                          <p className="text-gray-600 max-w-2xl mx-auto">
                            Choose from our wide selection of premium eyewear.
                            Each pair is carefully crafted for style and
                            comfort.
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {products.map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              onTryOn={() => handleTryOn(product)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>


                  </>
                }
              />
            </Routes>
          </div>

          {/* Try On Modal */}
          <TryOnModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            glassesImage={selectedGlasses?.images?.[0]?.imageUrl || ""}
          />

          {/* Cart Drawer */}
          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

          {/* Toast Notification */}
          {showToast && (
            <Toast message={toastMessage} onClose={() => setShowToast(false)} />
          )}
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
