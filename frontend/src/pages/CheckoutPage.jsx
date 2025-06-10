import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [formData, setFormData] = useState({
    paymentMethod: 'DEBIT_CARD',
    cardNumber: '5259 3701 7717 8385',
    cardHolder: 'CARD HOLDER',
    expMonth: '09',
    expYear: '28',
    cvv: '',
    address: '',
    phone: ''
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
    // Handle form submission
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Shopping Cart</h1>
          <div className="flex justify-between items-center text-lg mb-4">
            <span>Subtotal:</span>
            <span>100.00 EGP</span>
          </div>
          <p className="text-gray-500 text-sm">Total: 100.00 EGP</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900"
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
              className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900"
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
              className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            />
          </div>

          {formData.paymentMethod === 'DEBIT_CARD' && (
            <div className="space-y-6">
              {/* Card Preview */}
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-6">
                  <div className="flex justify-between items-center">
                    <div className="w-12 h-8 bg-white/20 rounded"></div>
                    <img 
                      src="/mastercard-logo.png" 
                      alt="Mastercard"
                      className="h-8 w-auto"
                    />
                  </div>
                  <div className="mt-4">
                    <div className="text-white/80 text-sm">Card Number</div>
                    <div className="text-white font-medium tracking-wider mt-1">
                      {formData.cardNumber}
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <div>
                      <div className="text-white/80 text-sm">Card Holder</div>
                      <div className="text-white font-medium">{formData.cardHolder}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/80 text-sm">Expires</div>
                      <div className="text-white font-medium">{formData.expMonth}/{formData.expYear}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="5259 3701 7717 8385"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Holder *
                  </label>
                  <input
                    type="text"
                    name="cardHolder"
                    value={formData.cardHolder}
                    onChange={handleInputChange}
                    placeholder="CARD HOLDER"
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900 uppercase"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiration Date *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        name="expMonth"
                        value={formData.expMonth}
                        onChange={handleInputChange}
                        placeholder="09"
                        required
                        maxLength="2"
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                      />
                      <input
                        type="text"
                        name="expYear"
                        value={formData.expYear}
                        onChange={handleInputChange}
                        placeholder="28"
                        required
                        maxLength="2"
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV *
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="125"
                      required
                      maxLength="3"
                      className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {formData.paymentMethod === 'CASH' ? 'Place Order' : 'Pay Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
