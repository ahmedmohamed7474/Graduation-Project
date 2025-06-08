const prisma = require('../prisma/client');

class OrderRepository {
    async createWithItems(orderData) {
        const { items, ...orderDetails } = orderData;
        
        return prisma.$transaction(async (prisma) => {
            // Create the order
            const order = await prisma.order.create({
                data: {
                    ...orderDetails,
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
        });
    }

    async findByUserId(userId) {
        return prisma.order.findMany({
            where: {
                userId: userId
            },
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
    }

    async findAll() {
        return prisma.order.findMany({
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
    }

    async findById(id) {
        return prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });    }
    
    async findByUserId(userId) {
        return prisma.order.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'desc'
            },
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

    async updateStatus(id, status) {
        return prisma.order.update({
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
    }
}

module.exports = new OrderRepository();
