import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

const Checkout = ({ onClose }) => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [formData, setFormData] = useState({
    address: "",
    phone: "",
    paymentMethod: "DEBIT_CARD",
    cardNumber: "",
    cardHolder: "CARD HOLDER",
    cardExpiry: "MM/YY"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
  };

  const subtotal = 100.00; // Replace with actual cart total
  const total = subtotal;

  return (
    <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
      >
        <span className="sr-only">Close</span>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 className="text-2xl font-semibold mb-6">Shopping Cart</h2>
      
      {/* Subtotal */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-lg font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-500">Shipping calculated at checkout.</p>
      </div>

      {/* Checkout Form */}
      <div className="mt-8">
        <h3 className="text-xl font-medium mb-4">Checkout</h3>
        <div className="flex justify-between items-center mb-4">
          <span>Subtotal:</span>
          <span>{subtotal.toFixed(2)} EGP</span>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="font-bold">Total:</span>
          <span className="text-blue-600 font-bold">{total.toFixed(2)} EGP</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-800 text-white"
            >
              <option value="DEBIT_CARD">Debit Card</option>
              <option value="CASH">Cash on Delivery</option>
            </select>
          </div>

          {/* Shipping Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shipping Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
              rows="3"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Credit Card Form */}
          {formData.paymentMethod === 'DEBIT_CARD' && (
            <div className="space-y-4">
              {/* Card Display */}
              <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-6 text-white shadow-lg">
                <div className="mb-4">
                  <img src="/path-to-card-logo.png" alt="Card" className="w-12 h-12" />
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm opacity-80">Card Number</div>
                    <div className="font-mono text-lg tracking-wider">
                      {formData.cardNumber || "•••• •••• •••• ••••"}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm opacity-80">Card Holder</div>
                      <div className="font-mono">{formData.cardHolder}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-80">Expires</div>
                      <div className="font-mono">{formData.cardExpiry}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="0000 0000 0000 0000"
                  className="w-full p-2 border border-gray-300 rounded-md font-mono"
                  maxLength="19"
                />
              </div>

              {/* Card Holder Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Holder
                </label>
                <input
                  type="text"
                  name="cardHolder"
                  value={formData.cardHolder}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="cardExpiry"
                    value={formData.cardExpiry}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    className="w-full p-2 border border-gray-300 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="password"
                    name="cvv"
                    maxLength="3"
                    placeholder="123"
                    className="w-full p-2 border border-gray-300 rounded-md font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            {formData.paymentMethod === 'CASH' ? 'Place Order' : 'Pay Now'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
