const prisma = require('../prisma/client');

class OrderItemRepository {
    async createMany(items) {
        return prisma.orderItem.createMany({
            data: items
        });
    }

    async findByOrderId(orderId) {
        return prisma.orderItem.findMany({
            where: { orderId },
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
        return prisma.orderItem.delete({
            where: { id }
        });
    }

    async deleteByOrderId(orderId) {
        return prisma.orderItem.deleteMany({
            where: { orderId }
        });
    }
}

module.exports = new OrderItemRepository();
