const prisma = require('../prisma/connection');

class UserRepository {
    async create(userData) {
        return prisma.user.create({
            data: userData,
            include: {
                role: true
            }
        });
    }

    async findAll() {
        return prisma.user.findMany({
            include: {
                role: true
            }
        });
    }

    async findById(id) {
        return prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
                orders: true,
                carts: true
            }
        });
    }

    async findByEmail(email) {
        return prisma.user.findUnique({
            where: { email },
            include: {
                role: true
            }
        });
    }

    async login(email, password) {
        return prisma.user.findFirst({
            where: {
                email: email,
                password: password
            },
            include: {
                role: true,
                carts: {
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
                }
            }
        });
    }

    async update(id, userData) {
        return prisma.user.update({
            where: { id },
            data: userData,
            include: {
                role: true
            }
        });
    }

    async delete(id) {
        return prisma.user.delete({
            where: { id }
        });
    }
}

module.exports = new UserRepository();
