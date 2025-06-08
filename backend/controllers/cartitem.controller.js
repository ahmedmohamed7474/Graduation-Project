const cartItemRepository = require('../repositories/cartitem.repository');
const cartRepository = require('../repositories/cart.repository');
const productRepository = require('../repositories/product.repository');

class CartItemController {
    async addItem(req, res) {
        try {
            const { cartId, productId, quantity } = req.body;

            // التحقق من وجود المنتج وكمية المخزون
            const product = await productRepository.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'المنتج غير موجود' });
            }

            if (product.stockQuantity < quantity) {
                return res.status(400).json({ message: 'الكمية المطلوبة غير متوفرة في المخزون' });
            }

            // التحقق من وجود المنتج في السلة
            const existingItem = await cartItemRepository.findByCartAndProduct(cartId, productId);
            
            let cartItem;
            if (existingItem) {
                // تحديث الكمية إذا كان المنتج موجود
                const newQuantity = existingItem.quantity + quantity;
                if (product.stockQuantity < newQuantity) {
                    return res.status(400).json({ message: 'الكمية المطلوبة تتجاوز المخزون المتوفر' });
                }
                cartItem = await cartItemRepository.update(existingItem.id, newQuantity);
            } else {
                // إضافة منتج جديد
                cartItem = await cartItemRepository.create(cartId, productId, quantity);
            }

            const updatedCart = await cartRepository.findByUserId(req.user.userId);

            res.status(201).json({
                message: 'تمت إضافة المنتج إلى السلة بنجاح',
                cartItem,
                cart: updatedCart
            });
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء إضافة المنتج إلى السلة', error: error.message });
        }
    }

    async updateQuantity(req, res) {
        try {
            const { id } = req.params;
            const { quantity } = req.body;

            const cartItem = await cartItemRepository.findById(parseInt(id));
            if (!cartItem) {
                return res.status(404).json({ message: 'العنصر غير موجود في السلة' });
            }

            // التحقق من المخزون المتوفر
            const product = await productRepository.findById(cartItem.productId);
            if (product.stockQuantity < quantity) {
                return res.status(400).json({ message: 'الكمية المطلوبة غير متوفرة في المخزون' });
            }

            const updatedItem = await cartItemRepository.update(parseInt(id), quantity);
            const updatedCart = await cartRepository.findByUserId(req.user.userId);

            res.json({
                message: 'تم تحديث الكمية بنجاح',
                cartItem: updatedItem,
                cart: updatedCart
            });
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء تحديث الكمية', error: error.message });
        }
    }

    async deleteItem(req, res) {
        try {
            const { id } = req.params;
            
            const cartItem = await cartItemRepository.findById(parseInt(id));
            if (!cartItem) {
                return res.status(404).json({ message: 'العنصر غير موجود في السلة' });
            }

            await cartItemRepository.delete(parseInt(id));
            const updatedCart = await cartRepository.findByUserId(req.user.userId);

            res.json({
                message: 'تم حذف المنتج من السلة بنجاح',
                cart: updatedCart
            });
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء حذف المنتج من السلة', error: error.message });
        }
    }

    async getCartItems(req, res) {
        try {
            const { cartId } = req.params;
            const items = await cartItemRepository.findByCartId(parseInt(cartId));
            res.json(items);
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء جلب عناصر السلة', error: error.message });
        }
    }
}

module.exports = new CartItemController();
