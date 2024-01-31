const fs = require('fs');

const { validateCartSortParam, matchedKey } = require('../Utils');
const multer = require('multer');
const { CartRepo } = require('../repository/cart.repo');
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

var cached_selectAllCarts = null;
const clearCache = () => {
    cached_selectAllCarts = null;
}
var cartCacheIter = null;


const getCartByUserId = async (req, res) => {
    let userId = req.params.userId;
    if(isNaN(Number(userId))){
        res.status(400).send("Invalid userId, got ", userId);
        return;
    }
    let foundCart = await CartRepo.repoGetCartByUserId(Number(userId));
    if(foundCart instanceof Array) foundCart = foundCart[0];

    if(foundCart?.productids){
        let idList = foundCart.productids?.split(',') || [];
        let imgList = foundCart.imgnames?.split(',') || [];
        let productNameList = foundCart.productnames?.split(',') || [];
        let priceList = foundCart.productprices?.split(',') || [];
    
        foundCart.products = [];
    
        let appearedId = [];
        idList.forEach(
            (eachProductId, arrayIndex) => {
                if(appearedId.includes(eachProductId)) return;
                appearedId.push(eachProductId);
    
                let newDistinctProduct = {
                    id: eachProductId,
                    title_text: productNameList[arrayIndex],
                    img: imgList[arrayIndex],
                    price: priceList[arrayIndex]
                }
                foundCart.products.push(newDistinctProduct);
            }
        );
    }

    res.status(200).json({
        cart: foundCart
    });
}

const createCartForUser = async (req, res) => {
    let userId = req.params.userId;
    let {product} = req.body;

    if(isNaN(Number(userId))){
        res.status(400).send("Invalid userId, got ", userId);
        return;
    }
    console.log('createCartForUser = ',userId,' firstProduct = ', product);
    userId = Number(userId);
    await CartRepo.repoCreateCartForUser(userId, product)
    .then(
        any => {          
            res.status(200).json({
                message: "Success"
            });
        }
    )
    .catch(
        err => {
            res.status(400).json({
                message: "Error " + JSON.stringify(err)
            });
        }
    )
}

const addToCart = async (req, res) => {
    let cartId = Number(req.params.cartId);
    let {product} = req.body;
    let nextProduct = product;
    await CartRepo.repoAddProductToCart(cartId, nextProduct)    
    .then(
        any => {          
            res.status(200).json({
                message: "Success"
            });
        }
    )
    .catch(
        err => {
            console.log("err", err);
            res.status(400).json({
                message: "Error " + JSON.stringify(err)
            });
        }
    )
}

const removeFromCart = async (req, res) => {    
    console.log("removeFromCart ");

    //let { cartId, productId } = req.query;
    let { cartId, productId } = req.body;    
    productId = Number(productId);
    console.log("cartId ", cartId, " productId ", productId);

    let any = await CartRepo.repoRemoveProductFromCart(cartId, productId);    
   
    res.status(200).json({
        message: "Success"
    });
}

const getMatchingcart = async (req, res) => {
    let { key, page, size, sort } = req.query;
    console.log("getMatchingcart, query = ", req.query);
    page = Number(page);
    if (!page || isNaN(page) || page <= 0) {
        page = 1;
    }

    if (!size || isNaN(size)) {
        size = 10;
    }

    const pageSize = Number(size);

    let { sortOrder, sortBy } = validateCartSortParam(sort);

    if(!cached_selectAllCarts){
        if(cartCacheIter) {
            clearInterval(cartCacheIter);
            cartCacheIter = null;
        }
        cached_selectAllCarts = await CartRepo.repoGetAllCarts();
        cartCacheIter = setInterval(
            () => {
                cached_selectAllCarts = null;
                clearInterval(cartCacheIter);
            }, 8000
        );
    }
      
    let pagedCarts = [...cached_selectAllCarts];

    if (key) {
        pagedCarts = pagedCarts.filter((cart) => {
            return matchedKey(cart.username, key)
                //|| matchedKey(cart.productname, key)
        })
    }
    let totalFound = pagedCarts.length;
    pagedCarts = pagedCarts.sort(
        (cartA, cartB) => {
            let compareElementA = (cartA[sortBy]) ? cartA[sortBy].toString() : "";
            let compareElementB = (cartB[sortBy]) ? cartB[sortBy].toString() : "";

            if (sortOrder === "asc") {
                return compareElementA.localeCompare(compareElementB);
            }
            return -(compareElementA.localeCompare(compareElementB));
        }
    );
    //console.log("pagedUsers with pageSize: ", pagedUsers)



    let startIndex = (page - 1) * pageSize;
    let endIndex = startIndex + (pageSize - 1);
    pagedCarts = pagedCarts.slice(startIndex, endIndex + 1);

    return res.status(200).json({
        content: pagedCarts,
        pageIndex: Math.floor(startIndex / pageSize) + 1,
        totalElements: totalFound,
        totalPages: Math.ceil(totalFound / pageSize),
        size: pageSize,
        sortOrder: sortOrder,
        sortBy: sortBy,
        searchKey: key,
    });
}

const checkOutCart = async (req, res) => {
    let cartId = req.params.cartId;
    if(cartId < 1){
        console.error("checkOutCart: ", cartId);
        res.status(400).send("UNKNOWN cartId")
        return;
    }
    console.log("checkOutCart: ", cartId);
    let any = await CartRepo.checkOutCart(Number(cartId));
    return res.status(200).send("SUCCESS")
}

module.exports = {
    getMatchingcart , getCartByUserId, 
    createCartForUser, addToCart,
    removeFromCart , 
    checkOutCart
}
