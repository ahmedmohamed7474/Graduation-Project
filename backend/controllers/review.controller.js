const reviewRepository = require('../repositories/review.repository');
const productRepository = require('../repositories/product.repository');

class ReviewController {
    async createReview(req, res) {
        try {
            const userId = req.user.userId;
            const { productId } = req.params;
            const { rating, comment } = req.body;

            // Validate rating
            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Rating must be between 1 and 5' });
            }

            // Check if product exists
            const product = await productRepository.findById(parseInt(productId));
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Check if user has already reviewed this product
            const existingReview = await reviewRepository.findByUserAndProduct(userId, parseInt(productId));
            if (existingReview) {
                return res.status(400).json({ message: 'You have already reviewed this product' });
            }

            const review = await reviewRepository.create({
                userId,
                productId: parseInt(productId),
                rating,
                comment
            });

            res.status(201).json({
                message: 'Review created successfully',
                review
            });
        } catch (error) {
            res.status(500).json({ message: 'Error creating review', error: error.message });
        }
    }

    async getProductReviews(req, res) {
        try {
            const { productId } = req.params;

            // Check if product exists
            const product = await productRepository.findById(parseInt(productId));
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            const reviews = await reviewRepository.findByProduct(parseInt(productId));
            res.json(reviews);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching reviews', error: error.message });
        }
    }

    async updateReview(req, res) {
        try {
            const userId = req.user.userId;
            const { productId, reviewId } = req.params;
            const { rating, comment } = req.body;

            // Validate rating
            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Rating must be between 1 and 5' });
            }

            // Check if review exists and belongs to user
            const review = await reviewRepository.findById(parseInt(reviewId));
            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }

            if (review.userId !== userId) {
                return res.status(403).json({ message: 'You can only update your own reviews' });
            }

            const updatedReview = await reviewRepository.update(parseInt(reviewId), {
                rating,
                comment
            });

            res.json({
                message: 'Review updated successfully',
                review: updatedReview
            });
        } catch (error) {
            res.status(500).json({ message: 'Error updating review', error: error.message });
        }
    }

    async deleteReview(req, res) {
        try {
            const userId = req.user.userId;
            const { productId, reviewId } = req.params;

            // Check if review exists and belongs to user
            const review = await reviewRepository.findById(parseInt(reviewId));
            if (!review) {
                return res.status(404).json({ message: 'Review not found' });
            }

            if (review.userId !== userId && req.user.role !== 'ADMIN') {
                return res.status(403).json({ message: 'You can only delete your own reviews' });
            }

            await reviewRepository.delete(parseInt(reviewId));

            res.json({ message: 'Review deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting review', error: error.message });
        }
    }
}

module.exports = new ReviewController();
