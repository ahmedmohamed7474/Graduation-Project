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
    }    async update(id, productData) {
        const updateData = { ...productData };
        delete updateData.isSoldOut; // Remove isSoldOut from the update data
        
        // First delete existing images if new ones are being added
        if (updateData.images) {
            await prisma.productImage.deleteMany({
                where: { productId: id }
            });
        }
        
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
    }    async updateStock(id, quantity) {
        return prisma.product.update({
            where: { id },
            data: {
                stockQuantity: quantity,
                isSoldOut: quantity <= 0
            }
        });
    }
}

module.exports = new ProductRepository();
