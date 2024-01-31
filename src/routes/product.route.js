const express = require("express");
//const checkLogin = require("../middleware/checkUser.middleware");
const { getProducts,  getSimilarProducts,
  getMatchingProduct, createProduct, 
  addProductImage, addProductImageAsBase64,
  getProductImages,
  getBaseCategories, getAllCategories,
  updateProducts,deleteProduct, getProductById} = require("../controllers/product.controller");
const router = express.Router();
const multer = require('multer')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'productImage/')
  },
  filename: function (req, file, cb) {
    cb(null, "AtMS" + Date.now() + '.jpg') //Appending .jpg
  }
})
const upload = multer({ storage: storage });

//router.post('/images', upload.single('productImage'), addProductImage);
router.post('/images', addProductImageAsBase64);
router.get('/images/:productId', getProductImages);
router.get('/base-category/', getBaseCategories);
router.get('/category/', getAllCategories);

router.get('/', getMatchingProduct);
router.get('/:productId', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProducts);
router.delete('/:id', deleteProduct)
router.post('/similar', getSimilarProducts);

module.exports = router