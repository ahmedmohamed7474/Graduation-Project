import PropTypes from "prop-types";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import TryOn from "./TryOn";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTryOn, setShowTryOn] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      // You might want to show a login modal here
      alert("Please log in to add items to cart");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await addToCart(product);
      
      if (result.success) {
        // Show success message
        alert("Item added to cart successfully!");
      } else {
        setError(result.error || "Failed to add to cart");
        alert(result.error || "Failed to add to cart");
      }
    } catch (err) {
      setError("Failed to add to cart");
      alert("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const handleTryOnClick = () => {
    setShowTryOn(true);
  };

  const handleCloseTryOn = () => {
    setShowTryOn(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 group">
      <div className="relative w-full h-64 overflow-hidden">
        <img
          src={product?.images?.[0]?.imageUrl || "/default-product.png"}
          alt={product?.name || "Product Image"}
          className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">
            ${product.price}
          </span>
          <div className="space-x-2">
            <button
              onClick={handleTryOnClick}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
            >
              Virtual Try-On
            </button>
            <button
              onClick={handleAddToCart}
              disabled={loading || product.stockQuantity === 0}
              className={`px-4 py-2 rounded-md transition-colors ${
                loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : product.stockQuantity === 0
                  ? "bg-red-100 text-red-800 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading
                ? "Adding..."
                : product.stockQuantity === 0
                ? "Out of Stock"
                : "Add to Cart"}
            </button>
          </div>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}

        <p className="mt-2 text-sm text-gray-500">
          {product.stockQuantity > 0
            ? `${product.stockQuantity} in stock`
            : "Currently unavailable"}
        </p>
      </div>

      {/* Try-On Modal */}
      {showTryOn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Virtual Try-On</h2>
              <button
                onClick={handleCloseTryOn}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TryOn productId={product.id} product={product} />
          </div>
        </div>
      )}
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    stockQuantity: PropTypes.number.isRequired,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        imageUrl: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
};

export default ProductCard;
