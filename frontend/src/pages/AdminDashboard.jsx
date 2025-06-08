import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProductModal from '../components/ProductModal';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    image: null,
    imagePreview: null,
  });

  // Reset form when selectedProduct changes
  useEffect(() => {
    if (selectedProduct) {
      setProductForm({
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price,
        stockQuantity: selectedProduct.stockQuantity,
        image: null,
        imagePreview: selectedProduct.images?.[0]?.imageUrl || null,
      });
    }
  }, [selectedProduct]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch products
      const productsRes = await fetch('http://localhost:3002/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const productsData = await productsRes.json();

      // Fetch orders
      const ordersRes = await fetch('http://localhost:3002/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();

      // Fetch users
      const usersRes = await fetch('http://localhost:3002/api/users/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();

      setProducts(productsData);
      setOrders(ordersData);
      setUsers(usersData);

      // Calculate stats
      setStats({
        totalOrders: ordersData.length,
        totalUsers: usersData.length,
        totalRevenue: ordersData.reduce((sum, order) => sum + order.total, 0)
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      // Create FormData object to handle file upload
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('stockQuantity', productForm.stockQuantity);
      if (productForm.image) {
        formData.append('images', productForm.image);
      }

      const res = await fetch('http://localhost:3002/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setShowAddModal(false);
        setProductForm({
          name: "",
          description: "",
          price: "",
          stockQuantity: "",
          image: null,
          imagePreview: null,
        });
        fetchDashboardData();
        // Show success message
        setError('');
      } else {
        setError(data.message || 'Failed to add product');
      }
    } catch (err) {
      setError('Error adding product');
      console.error(err);
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stockQuantity: product.stockQuantity.toString(),
      image: null,
      imagePreview: product.images?.[0]?.imageUrl || product.imageUrl
    });
    setShowEditModal(true);
  };

  const handleProductEdit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('stockQuantity', productForm.stockQuantity);
      if (productForm.image) {
        formData.append('images', productForm.image);
      }

      const res = await fetch(`http://localhost:3002/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type header when sending FormData
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setShowEditModal(false);
        setSelectedProduct(null);
        setProductForm({
          name: "",
          description: "",
          price: "",
          stockQuantity: "",
          image: null,
          imagePreview: null,
        });
        fetchDashboardData();
        setError('');
      } else {
        setError(data.message || 'Failed to update product');
      }
    } catch (err) {
      setError('Error updating product');
      console.error(err);
    }
  };

  const handleProductDelete = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3002/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchDashboardData();
      } else {
        setError('Failed to delete product');
      }
    } catch (err) {
      setError('Error deleting product');
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3002/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchDashboardData();
      } else {
        setError('Failed to update order status');
      }
    } catch (err) {
      setError('Error updating order status');
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      setProductForm({
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price.toString(),
        stockQuantity: selectedProduct.stockQuantity.toString(),
        image: null,
        imagePreview: selectedProduct.images?.[0]?.imageUrl || selectedProduct.imageUrl,
      });
    }
  }, [selectedProduct]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800">Total Users</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-800">Total Revenue</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              ${stats.totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Products</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add New Product
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded object-cover" 
                              src={product.images?.[0]?.imageUrl || product.imageUrl} 
                              alt={product.name} 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${product.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.stockQuantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleProductDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.user?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${(order.status === 'completed') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                        >
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Users</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.role?.name || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ProductModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        title="Add New Product"
        submitText="Add Product"
        handleSubmit={handleProductSubmit}
        productForm={productForm}
        setProductForm={setProductForm}
        error={error}
      />

      <ProductModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
          setProductForm({
            name: "",
            description: "",
            price: "",
            stockQuantity: "",
            image: null,
            imagePreview: null,
          });
        }}
        title="Edit Product"
        submitText="Update Product"
        handleSubmit={handleProductEdit}
        productForm={productForm}
        setProductForm={setProductForm}
        error={error}
      />

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
