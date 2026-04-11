const express = require('express');
const authenticate = require('../../middleware/auth-middleware');
const { getCart, getCartCount, addToCart, removeFromCart } = require('../../controllers/cart-controller/cart.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', getCart);
router.get('/count', getCartCount);
router.post('/add', addToCart);
router.delete('/remove/:courseId', removeFromCart);

module.exports = router;
