const prisma = require('../prisma/client');

class CartItemRepository {
    async create(cartId, productId, quantity) {
        return prisma.cartItem.create({
            data: {
                cartId,
                productId,
                quantity
            },
            include: {
                product: {
                    include: {
                        images: true
                    }
                }
            }
        });
    }

    async update(id, quantity) {
        return prisma.cartItem.update({
            where: { id },
            data: { quantity },
            include: {
                product: {
                    include: {
                        images: true
                    }
                }
            }
        });
    }

    async delete(id) {
        return prisma.cartItem.delete({
            where: { id }
        });
    }

    async findByCartAndProduct(cartId, productId) {
        return prisma.cartItem.findFirst({
            where: {
                cartId,
                productId
            },
            include: {
                product: true
            }
        });
    }
}

module.exports = new CartItemRepository();
