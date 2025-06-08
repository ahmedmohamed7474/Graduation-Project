const productRepository = require('../repositories/product.repository');
const path = require('path');

class ProductController {
    async createProduct(req, res) {
        try {
            const { name, description, price, stockQuantity } = req.body;
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            
            // Generate full URLs for images
            const images = req.files ? req.files.map(file => ({
                imageUrl: `${baseUrl}/uploads/${file.filename}`
            })) : [];

            const product = await productRepository.create({
                name,
                description,
                price: parseFloat(price),
                stockQuantity: parseInt(stockQuantity),
                images: {
                    create: images
                }
            });

            res.status(201).json({
                message: 'تم إضافة المنتج بنجاح',
                product
            });
        } catch (error) {
            console.error('Product creation error:', error);
            res.status(500).json({ message: 'حدث خطأ أثناء إضافة المنتج', error: error.message });
        }
    }

    async getAllProducts(req, res) {
        try {
            const products = await productRepository.findAll();
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء جلب قائمة المنتجات', error: error.message });
        }
    }

    async getProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await productRepository.findById(parseInt(id));
            
            if (!product) {
                return res.status(404).json({ message: 'المنتج غير موجود' });
            }

            res.json(product);
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء جلب بيانات المنتج', error: error.message });
        }
    }    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const { name, description, price, stockQuantity } = req.body;
            
            if (!name || !description || !price || !stockQuantity) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const updateData = {
                name,
                description,
                price: parseFloat(price),
                stockQuantity: parseInt(stockQuantity)
            };
            
            if (req.files && req.files.length > 0) {
                const baseUrl = `${req.protocol}://${req.get('host')}`;
                updateData.images = {
                    deleteMany: {},
                    create: req.files.map(file => ({
                        imageUrl: `${baseUrl}/uploads/${file.filename}`
                    }))
                };
            }

            const product = await productRepository.update(parseInt(id), updateData);
            res.json({
                message: 'تم تحديث المنتج بنجاح',
                product
            });
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء تحديث المنتج', error: error.message });
        }
    }

    async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            await productRepository.delete(parseInt(id));
            res.json({ message: 'تم حذف المنتج بنجاح' });
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء حذف المنتج', error: error.message });
        }
    }

    async updateStock(req, res) {
        try {
            const { id } = req.params;
            const { quantity } = req.body;
            
            const product = await productRepository.updateStock(parseInt(id), parseInt(quantity));
            res.json({
                message: 'تم تحديث المخزون بنجاح',
                product
            });
        } catch (error) {
            res.status(500).json({ message: 'حدث خطأ أثناء تحديث المخزون', error: error.message });
        }
    }
}

module.exports = new ProductController();
