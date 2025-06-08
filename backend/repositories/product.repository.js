const prisma = require('../prisma/client');

class ProductRepository {
    async create(productData) {
        return prisma.product.create({
            data: productData,
            include: {
                images: true,
                reviews: true
            }
        });
    }

    async findAll() {
        return prisma.product.findMany({
            include: {
                images: true,
                reviews: true
            }
        });
    }

    async findById(id) {
        return prisma.product.findUnique({
            where: { id },
            include: {
                images: true,
                reviews: {
                    include: {
                        user: true
                    }
                }
            }
        });
    }

    async update(id, productData) {
        return prisma.product.update({
            where: { id },
            data: productData,
            include: {
                images: true,
                reviews: true
            }
        });
    }

    async delete(id) {
        return prisma.product.delete({
            where: { id }
        });
    }

    async updateStock(id, quantity) {
        return prisma.product.update({
            where: { id },
            data: {
                stockQuantity: quantity
            }
        });
    }
}

module.exports = new ProductRepository();
