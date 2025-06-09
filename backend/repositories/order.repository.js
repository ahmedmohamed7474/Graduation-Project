const prisma = require('../prisma/client');

class OrderRepository {
    async createWithItems(orderData) {
        const { items, userId, ...orderDetails } = orderData;
        try {
            // Create order with proper user connection and validate userId
            if (!userId || typeof userId !== 'number') {
                throw new Error('Invalid user ID');
            }

            const order = await prisma.order.create({
                data: {
                    ...orderDetails,
                    user: {
                        connect: {
                            id: userId
                        }
                    },
                    items: {
                        create: items
                    }
                },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });

            // Update product stock quantities
            for (const item of items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stockQuantity: {
                            decrement: item.quantity
                        }
                    }
                });
            }

            return order;
        } catch (error) {
            console.error('Error in createWithItems:', error);
            throw error;
        }
    }

    async findByUserId(userId) {
        try {
            return await prisma.order.findMany({
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
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        } catch (error) {
            console.error('Error in findByUserId:', error);
            throw error;
        }
    }

    async findAll() {
        try {
            return await prisma.order.findMany({
                include: {
                    user: true,
                    items: {
                        include: {
                            product: {
                                include: {
                                    images: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        } catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            return await prisma.order.findUnique({
                where: { id },
                include: {
                    user: true,
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error in findById:', error);
            throw error;
        }
    }

    async updateStatus(id, status) {
        try {
            return await prisma.order.update({
                where: { id },
                data: { status },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error in updateStatus:', error);
            throw error;
        }
    }
}

module.exports = new OrderRepository();
