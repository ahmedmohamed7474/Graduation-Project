const cartRepository = require('../repositories/cart.repository');
const cartItemRepository = require('../repositories/cartitem.repository');
const productRepository = require('../repositories/product.repository');

class CartController {
    async getCart(req, res) {
        try {
            const userId = req.user.userId;
            let cart = await cartRepository.findByUserId(userId);
            
            if (!cart) {
                cart = await cartRepository.create(userId);
            }

            res.json(cart);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching cart', error: error.message });
        }
    }    async addToCart(req, res) {
        try {
            const userId = req.user.userId;
            const { productId, quantity = 1 } = req.body;

            // Check if product exists and has enough stock
            const product = await productRepository.findById(productId);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (product.stockQuantity < quantity) {
                return res.status(400).json({ message: 'Not enough stock available' });
            }

            // Get or create cart
            let cart = await cartRepository.findByUserId(userId);
            if (!cart) {
                cart = await cartRepository.create(userId);
            }

            // Check if product already in cart
            const existingItem = await cartItemRepository.findByCartAndProduct(cart.id, productId);
            
            if (existingItem) {
                // Update quantity if product already in cart
                await cartItemRepository.update(existingItem.id, existingItem.quantity + quantity);
            } else {
                // Add new item to cart
                await cartItemRepository.create(cart.id, productId, quantity);
            }

            // Fetch the updated cart to return
            const updatedCart = await cartRepository.findByUserId(userId);
            return res.status(200).json(updatedCart);

            // Get updated cart
            cart = await cartRepository.findByUserId(userId);
            res.json(cart);
        } catch (error) {
            res.status(500).json({ message: 'Error adding to cart', error: error.message });
        }
    }

    async removeFromCart(req, res) {
        try {
            const { itemId } = req.params;
            await cartItemRepository.delete(parseInt(itemId));
            res.json({ message: 'Item removed from cart' });
        } catch (error) {
            res.status(500).json({ message: 'Error removing item from cart', error: error.message });
        }
    }

    async clearCart(req, res) {
        try {
            const userId = req.user.userId;
            const cart = await cartRepository.findByUserId(userId);
            if (cart) {
                await cartRepository.clear(cart.id);
            }
            res.json({ message: 'Cart cleared' });
        } catch (error) {
            res.status(500).json({ message: 'Error clearing cart', error: error.message });
        }
    }

    async updateCartItem(req, res) {
        try {
            const { itemId } = req.params;
            const { quantity } = req.body;

            if (!quantity || quantity < 1) {
                return res.status(400).json({ message: 'Invalid quantity' });
            }

            // Get the cart item
            const cartItem = await cartItemRepository.findById(itemId);
            if (!cartItem) {
                return res.status(404).json({ message: 'Cart item not found' });
            }

            // Check if user owns the cart
            const cart = await cartRepository.findById(cartItem.cartId);
            if (cart.userId !== req.user.userId) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            // Check product stock
            const product = await productRepository.findById(cartItem.productId);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (product.stockQuantity < quantity) {
                return res.status(400).json({ message: 'Not enough stock available' });
            }

            // Update cart item
            const updatedItem = await cartItemRepository.update(itemId, quantity);
            res.json(updatedItem);
        } catch (error) {
            res.status(500).json({ message: 'Error updating cart item', error: error.message });
        }
    }
}

module.exports = new CartController();
