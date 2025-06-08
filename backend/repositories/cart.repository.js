const prisma = require('../prisma/client');

class CartRepository {
    async create(userId) {
        return prisma.cart.create({
            data: {
                userId
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });
    }

    async findByUserId(userId) {
        return prisma.cart.findFirst({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true
                            }
                        }
                    }
                }
            }
        });
    }

    async clear(cartId) {
        return prisma.cartItem.deleteMany({
            where: { cartId }
        });
    }

    async delete(id) {
        await this.clear(id);
        return prisma.cart.delete({
            where: { id }
        });
    }
}

module.exports = new CartRepository();
