const orderRepository = require('../repositories/order.repository');
const orderItemRepository = require('../repositories/orderitem.repository');
const cartRepository = require('../repositories/cart.repository');
const productRepository = require('../repositories/product.repository');

class OrderController {
    async getUserOrders(req, res) {
        try {
            const userId = req.user.userId;
            const orders = await orderRepository.findByUserId(userId);
            res.json(orders);
        } catch (error) {
            console.error('Error in getUserOrders:', error);
            res.status(500).json({ 
                message: 'Error fetching orders',
                error: error.message 
            });
        }
    }

    async createOrder(req, res) {
        try {
            const userId = req.user.userId;
            const {
                address,
                phone,
                paymentMethod,
                cardNumber,
                cardHolderName,
                cardExpiryMonth,
                cardExpiryYear,
                cardCvv
            } = req.body;

            // Get user's cart
            const cart = await cartRepository.findByUserId(userId);
            if (!cart || !cart.items.length) {
                return res.status(400).json({ message: 'Cart is empty' });
            }            // Verify stock availability and calculate total
            let total = 0;
            for (const item of cart.items) {
                if (item.quantity > item.product.stockQuantity) {
                    return res.status(400).json({ 
                        message: `Not enough stock available for ${item.product.name}` 
                    });
                }
                total += item.product.price * item.quantity;
            }

            // Add $5 fee for cash on delivery
            if (paymentMethod === 'CASH') {
                total += 5;
            }

            // Create order with items and update stock in a transaction
            const order = await orderRepository.createWithItems({
                userId,
                status: 'PENDING',
                address,
                phone,
                paymentMethod: paymentMethod === 'CASH' ? 'CASH' : 'DEBIT_CARD',
                total,
                cardNumber: paymentMethod === 'CASH' ? null : cardNumber,
                cardHolderName: paymentMethod === 'CASH' ? null : cardHolderName,
                cardExpiryMonth: paymentMethod === 'CASH' ? null : cardExpiryMonth,
                cardExpiryYear: paymentMethod === 'CASH' ? null : cardExpiryYear,
                cardCvv: paymentMethod === 'CASH' ? null : cardCvv,
                items: cart.items.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    priceAtPurchase: item.product.price
                }))
            });

            // Update stock quantities
            for (const item of cart.items) {
                await productRepository.updateStock(
                    item.product.id,
                    item.product.stockQuantity - item.quantity
                );
            }

            // Clear cart
            await cartRepository.clear(cart.id);

            res.status(201).json({
                message: 'تم إنشاء الطلب بنجاح',
                order
            });
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الطلب', error: error.message });
        }
    }

    async getAllOrders(req, res) {
        try {
            const orders = await orderRepository.findAll();
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء جلب قائمة الطلبات', error: error.message });
        }
    }    async getUserOrders(req, res) {
        try {
            const userId = req.user.userId;
            console.log('Fetching orders for user:', userId);
            
            const orders = await orderRepository.findByUserId(userId);
            console.log('Found orders:', orders);
            
            res.json(orders);
        } catch (error) {
            console.error('Error in getUserOrders:', error);
            res.status(500).json({ 
                message: 'Error fetching orders',
                error: error.message 
            });
        }
    }

    async getOrderById(req, res) {
        try {
            const { id } = req.params;
            const order = await orderRepository.findById(parseInt(id));
            
            if (!order) {
                return res.status(404).json({ message: 'الطلب غير موجود' });
            }

            // Check if user is authorized to view this order
            if (req.user.role !== 'ADMIN' && order.userId !== req.user.userId) {
                return res.status(403).json({ message: 'غير مصرح لك بعرض هذا الطلب' });
            }

            res.json(order);
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء جلب بيانات الطلب', error: error.message });
        }
    }

    async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const order = await orderRepository.updateStatus(parseInt(id), status);
            res.json({
                message: 'تم تحديث حالة الطلب بنجاح',
                order
            });
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء تحديث حالة الطلب', error: error.message });
        }
    }

    getStatusText(status) {
        const statusMap = {
            'PENDING': 'Pending',
            'PROCESSING': 'Processing',
            'SHIPPED': 'Shipped',
            'DELIVERED': 'Delivered',
            'CANCELLED': 'Cancelled'
        };
        return statusMap[status] || status;
    }
}

module.exports = new OrderController();
