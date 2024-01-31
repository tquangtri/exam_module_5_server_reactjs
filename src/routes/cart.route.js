const express = require("express");
const router = express.Router();
const multer = require('multer');
const { 
  getMatchingcart, getCartByUserId, 
  createCartForUser, addToCart, removeFromCart,
  checkOutCart
} = require("../controllers/cart.controller");

router.get('/', getMatchingcart);
router.get('/:productId', () => {});
router.post('/', () => {});
router.put('/:id', () => {});
router.delete('/:id', () => {})
router.get('/userId/:userId', getCartByUserId);
router.put('/userId/:userId', removeFromCart);
router.post('/userId/:userId', createCartForUser);
router.post('/cart-item/:cartId', addToCart);
router.post('/checkout/:cartId', checkOutCart);


module.exports = router
