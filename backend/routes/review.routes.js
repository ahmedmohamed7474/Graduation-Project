const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const auth = require('../middleware/auth');

// Get reviews for a product
router.get('/:productId/reviews', reviewController.getProductReviews);

// Create, update, delete reviews (requires authentication)
router.post('/:productId/reviews', auth, reviewController.createReview);
router.put('/:productId/reviews/:reviewId', auth, reviewController.updateReview);
router.delete('/:productId/reviews/:reviewId', auth, reviewController.deleteReview);

module.exports = router;
