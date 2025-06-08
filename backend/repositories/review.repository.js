const prisma = require('../prisma/connection');

class ReviewRepository {
    async create(reviewData) {
        return prisma.review.create({
            data: reviewData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }

    async findById(id) {
        return prisma.review.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }

    async findByProduct(productId) {
        return prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findByUserAndProduct(userId, productId) {
        return prisma.review.findFirst({
            where: {
                userId,
                productId
            }
        });
    }

    async update(id, reviewData) {
        return prisma.review.update({
            where: { id },
            data: reviewData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }

    async delete(id) {
        return prisma.review.delete({
            where: { id }
        });
    }

    async getAverageRating(productId) {
        const aggregation = await prisma.review.aggregate({
            where: { productId },
            _avg: {
                rating: true
            }
        });

        return aggregation._avg.rating || 0;
    }
}

module.exports = new ReviewRepository();
