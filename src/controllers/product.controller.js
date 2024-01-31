const fs = require('fs');
const { ProductRepo } = require('../repository/product.repo');
const { validateProductSortParam, matchedKey } = require('../Utils');
const multer = require('multer');
const { ProductSimilarity } = require('../feature/ProductSimilarity');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'productImage/')
    },
    filename: function (req, file, cb) {
        cb(null, "AtMS" + Date.now() + '.jpg') //Appending .jpg
    }
})
const upload = multer({ storage: storage });

const PAGE_SIZE = 20;

const clearCache = () => {
    cached_selectAllProduct = null;
}

const getProducts = async (req, res) => {
    // #swagger.tags = ['Product']
    // #swagger.summary = 'Get all products'
    // #swagger.description = 'Retrieve all products in database'
    console.log("getProducts");
    const { id } = req.params;

    let products = await ((id) ? ProductRepo.repoGetProduct(id) : ProductRepo.repoGetAllProducts());
    //console.log("products ", products)
    //get all user
    let pageCount = Math.ceil(products.length / PAGE_SIZE);

    res.status(200).json({
        content: products,
        totalElements: products.length,
        totalPages: pageCount,
        size: PAGE_SIZE
    });
}

const getProductById = async (req, res) => {
    // #swagger.tags = ['Product']
    // #swagger.summary = 'Get product by Id'
    // #swagger.description = 'Get product by Id description'
    const { productId } = req.params
    if (isNaN(Number(productId))) {
        res.status(400);
        res.send(" Giá trị ID không hợp lệ");
    }
    let product = await ProductRepo.repoGetProduct(productId)
    if (product instanceof Array) {
        product = product[0];
    }

    let imgs = await ProductRepo.getProductImages(productId);
    //console.log("productImage ", imgs);
    imgs.forEach(
        img => {
            img.file = "unavailable";
        }
    );
    product.imgs = imgs;

    res.status(200).json({
        product: product
    })
}

const getSimilarProducts = async (req, res) => {
    let { product } = req.body;
    console.log("getSimilarProducts , product.id = ", product.id);

    let any = await getAllAndSaveToCache();
    let allProducts = [...cached_selectAllProduct];
    let similarProducts = ProductSimilarity.filterSimilars(allProducts, product);

    // if (similarProducts) {
    //     similarProducts.forEach(
    //         eachSimilarProduct => {
    //             console.log("find productImages for ", eachSimilarProduct.title_text);
    //             ProductRepo.getProductImages(eachSimilarProduct.id)
    //             .then(
    //                 imgs => {
    //                     eachSimilarProduct.imgs = imgs;
    //                 }
    //             )
    //         }
    //     )
    // }

    res.status(200).json({
        message: "success",
        similarProducts: similarProducts
    });
}


var cached_selectAllProduct = null;
var productCacheIter = null;

const getAllAndSaveToCache = async () => {
    if (!cached_selectAllProduct) {
        if (productCacheIter) {
            clearInterval(productCacheIter);
            productCacheIter = null;
        }
        cached_selectAllProduct = await ProductRepo.repoGetAllProducts();
        productCacheIter = setInterval(
            () => {
                cached_selectAllProduct = null;
                clearInterval(productCacheIter);
            }, 8000
        );
    }
    return cached_selectAllProduct;
}

const getMatchingProduct = async (req, res) => {
    let { key, page, size, sort } = req.query;
    console.log("getMatchingProduct, query = ", req.query);
    page = Number(page);
    if (!page || isNaN(page) || page <= 0) {
        page = 1;
    }

    if (!size || isNaN(size)) {
        size = 10;
    }

    const pageSize = Number(size);

    let { sortOrder, sortBy } = validateProductSortParam(sort);

    await getAllAndSaveToCache();

    let pagedProducts = [...cached_selectAllProduct];

    if (key) {
        pagedProducts = pagedProducts.filter((product) => {
            return matchedKey(product.title_text, key)
                || matchedKey(product.desc_text, key)
                || matchedKey(product.price, key)
                || matchedKey(product.category_name, key)
        })
        //console.log("pagedUsers matched key: ", pagedUsers)
    }
    let totalFound = pagedProducts.length;

    //console.log("sortOrder ", sortOrder)
    //console.log("sortBy ", sortBy)
    pagedProducts = pagedProducts.sort(
        (productA, productB) => {
            let compareElementA = productA[sortBy].toString() || "";
            let compareElementB = productB[sortBy].toString() || "";

            if (sortOrder === "asc") {
                return compareElementA.localeCompare(compareElementB);
            }
            return -(compareElementA.localeCompare(compareElementB));
        }
    );
    //console.log("pagedUsers with pageSize: ", pagedUsers)



    let startIndex = (page - 1) * pageSize;
    let endIndex = startIndex + (pageSize - 1);
    //console.log("startIndex ", startIndex)
    //console.log("endIndex ", endIndex)
    pagedProducts = pagedProducts.slice(startIndex, endIndex + 1);
    //console.log("pagedUsers sorted", pagedUsers)

    pagedProducts.forEach(
        product => {

            /***
             * @type {string}
             */
            let imgs = product.imageIds;
            imgs = imgs.split(",");
            product.imgs = imgs;
        }
    )
    return res.status(200).json({
        content: pagedProducts,
        pageIndex: Math.floor(startIndex / pageSize) + 1,
        totalElements: totalFound,
        totalPages: Math.ceil(totalFound / pageSize),
        size: pageSize,
        sortOrder: sortOrder,
        sortBy: sortBy,
        searchKey: key,
    });
}

const createProduct = async (req, res) => {
    // #swagger.tags = ['Product']
    // #swagger.summary = 'Create Product'
    // #swagger.description = 'Create Product description'
    let product = req.body;
    console.log("createProduct ", req.body);

    let any = await ProductRepo.repoInsertProduct(product);
    clearCache();

    product.id = any.insertId;
    res.status(200).json(product)
}

const addProductImage = (req, res, next) => {
    console.log("got image ?");
    res.status(200).json("Success");
}

const addProductImageAsBase64 = async (req, res) => {
    //console.log("got image ? req.body = ", req.body);
    let { productId, images } = req.body;
    if (isNaN(Number(productId))) {
        console.warn("productId must be a number, got", productId);
        res.status(400).json("invalid id");
        return;
    }

    const addedImgs = await ProductRepo.saveImagesToLocal(images, productId);
    let any = await ProductRepo.repoAddProductImages(addedImgs, productId);
    res.status(200).json("Success");
}

const getProductImages = async (req, res) => {
    let productId = req.params.productId;
    let imgs = await ProductRepo.getProductImages(productId);
    console.log("productImage ", imgs);
    imgs.forEach(
        img => {
            // if(ProductRepo.isOnlyOnLocal(img))
            // {
            //  return;   
            // }
            img.file = "unavailable";
        }
    );

    res.status(200).json({
        imgs: imgs
    });
}

const getBaseCategories = async (req, res) => {
    let baseCategories = await ProductRepo.getBaseCategories();
    res.status(200).json({
        baseCategories: baseCategories
    });
}
const getAllCategories = async (req, res) => {
    let allCategories = await ProductRepo.getAllCategories();
    res.status(200).json({
        categories: allCategories
    });
}

const updateProducts = (req, res) => {
    // #swagger.tags = ['Product']
    // #swagger.summary = 'Update Product'
    // #swagger.description = 'Update Product description'
    let productId = req.params.id;
    let productReq = req.body;
    if (!productId) {
        res.status(400);
        res.send(" Giá trị ID không hợp lệ");
    }
    clearCache();
    let any = ProductRepo.repoUpdateProduct(productId, productReq)
    res.status(200).json(productReq);
}

const deleteProduct = async (req, res) => {
    // #swagger.tags = ['Product']
    // #swagger.summary = 'Delete product'
    // #swagger.description = 'Delete product description'


    //console.log("req ", req);
    //console.log("req.params ", req.params);
    let productId = req?.params?.id || req;
    productId = Number(productId);
    if (productId < 0) {
        res.status(400);
        res.send("Giá trị Id không hợp lệ");
    }
    clearCache();
    let any = await ProductRepo.repoDeleteProduct(productId)
    res.status(200).json("Xóa thành công");
}

module.exports = {
    getProducts, getSimilarProducts,
    getProductById, createProduct,
    addProductImage, addProductImageAsBase64,
    getProductImages,
    getBaseCategories, getAllCategories,
    updateProducts, deleteProduct, getMatchingProduct
}
