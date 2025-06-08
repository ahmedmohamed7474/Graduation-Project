const orderItemRepository = require('../repositories/orderitem.repository');
const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');

class OrderItemController {
    async getOrderItems(req, res) {
        try {
            const { orderId } = req.params;
            
            // التحقق من صلاحية المستخدم لعرض عناصر الطلب
            const order = await orderRepository.findById(parseInt(orderId));
            if (!order) {
                return res.status(404).json({ message: 'الطلب غير موجود' });
            }

            if (req.user.role !== 'ADMIN' && order.userId !== req.user.userId) {
                return res.status(403).json({ message: 'غير مصرح لك بعرض عناصر هذا الطلب' });
            }

            const items = await orderItemRepository.findByOrderId(parseInt(orderId));
            res.json(items);
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء جلب عناصر الطلب', error: error.message });
        }
    }

    async addOrderItem(req, res) {
        try {
            const { orderId } = req.params;
            const { productId, quantity } = req.body;

            // التحقق من وجود الطلب
            const order = await orderRepository.findById(parseInt(orderId));
            if (!order) {
                return res.status(404).json({ message: 'الطلب غير موجود' });
            }

            // التحقق من وجود المنتج
            const product = await productRepository.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'المنتج غير موجود' });
            }

            // التحقق من المخزون
            if (product.stockQuantity < quantity) {
                return res.status(400).json({ message: 'الكمية المطلوبة غير متوفرة في المخزون' });
            }

            // إضافة العنصر للطلب
            const orderItem = await orderItemRepository.createMany([{
                orderId: parseInt(orderId),
                productId,
                quantity,
                priceAtPurchase: product.price
            }]);

            // تحديث المخزون
            await productRepository.updateStock(productId, product.stockQuantity - quantity);

            // تحديث إجمالي الطلب
            const updatedOrder = await orderRepository.findById(parseInt(orderId));
            
            res.status(201).json({
                message: 'تمت إضافة المنتج إلى الطلب بنجاح',
                orderItem,
                order: updatedOrder
            });
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء إضافة المنتج إلى الطلب', error: error.message });
        }
    }

    async updateOrderItem(req, res) {
        try {
            const { id } = req.params;
            const { quantity } = req.body;

            // التحقق من وجود العنصر في الطلب
            const orderItem = await orderItemRepository.findById(parseInt(id));
            if (!orderItem) {
                return res.status(404).json({ message: 'العنصر غير موجود في الطلب' });
            }

            // التحقق من المخزون
            const product = await productRepository.findById(orderItem.productId);
            const quantityDiff = quantity - orderItem.quantity;
            
            if (product.stockQuantity < quantityDiff) {
                return res.status(400).json({ message: 'الكمية المطلوبة غير متوفرة في المخزون' });
            }

            // تحديث الكمية
            const updatedItem = await orderItemRepository.update(parseInt(id), quantity);

            // تحديث المخزون
            await productRepository.updateStock(product.id, product.stockQuantity - quantityDiff);

            res.json({
                message: 'تم تحديث الكمية بنجاح',
                orderItem: updatedItem
            });
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء تحديث الكمية', error: error.message });
        }
    }

    async deleteOrderItem(req, res) {
        try {
            const { id } = req.params;

            // التحقق من وجود العنصر في الطلب
            const orderItem = await orderItemRepository.findById(parseInt(id));
            if (!orderItem) {
                return res.status(404).json({ message: 'العنصر غير موجود في الطلب' });
            }

            // إعادة الكمية إلى المخزون
            const product = await productRepository.findById(orderItem.productId);
            await productRepository.updateStock(product.id, product.stockQuantity + orderItem.quantity);

            // حذف العنصر
            await orderItemRepository.delete(parseInt(id));

            res.json({
                message: 'تم حذف المنتج من الطلب بنجاح'
            });
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء حذف المنتج من الطلب', error: error.message });
        }
    }
}

module.exports = new OrderItemController();
