const connection = require('../config/dbconfig');

const CartStatusEnum = {
  BROWSING : 0, 
  AWAITING_PAYMENT : 1, 
  PAID : 2, 
}

class CartRepo {
  static async checkOutCart(cartId){
    if(isNaN(cartId) && !cartId) return;

    let query = ` 
      UPDATE 
        carts 
      SET
        status = ` + CartStatusEnum.AWAITING_PAYMENT + `
      WHERE
        id = `+ cartId + `;`;
    return queryPromise(query)
  }

  static async repoGetAllCarts() {
    let query = ` 
      SELECT 
        carts.id, username, 
        group_concat(products.title_text SEPARATOR ',') as productnames, 
        group_concat(products.id SEPARATOR ',') as productids,
        sum(price) as totalprice,
        carts.status,
        carts.date_added, carts.date_updated
      FROM
        root.carts
            INNER JOIN
        root.users ON carts.userId = users.id
            INNER JOIN
        root.cartAndProduct ON carts.id = cartAndProduct.cartId
            INNER JOIN
        root.products ON cartAndProduct.productId = products.id
      GROUP BY carts.id;`

    return queryPromise(query)
  };

  static async repoGetCartByUserId(userId){
    userId = Number(userId);
    let query = 
      `SELECT 
        carts.id,      
        group_concat(imgs.name SEPARATOR ',') as imgnames,
        group_concat(products.title_text SEPARATOR ',') as productnames, 
        group_concat(products.id SEPARATOR ',') as productids,
        group_concat(products.price SEPARATOR ',') as productprices,
        sum(price) as totalprice,
        carts.date_added, carts.date_updated
      FROM
        root.carts
            INNER JOIN
        root.cartAndProduct ON carts.id = cartAndProduct.cartId
            INNER JOIN
        root.products ON cartAndProduct.productId = products.id
            INNER JOIN
        root.imgs ON imgs.productId = products.id
      WHERE carts.userId = ` + userId + `
      GROUP BY carts.id`;

    return queryPromise(query)
  }

  static async repoCreateCartForUser(userId, firstProduct){
    userId = Number(userId);

    const isoDate = new Date();
    const mySQLDateString = isoDate.toJSON().slice(0, 19).replace('T', ' ');

    let query = 
    `INSERT INTO carts 
    (userId, date_updated)
    VALUES ?`;
    let values = [
      [userId, mySQLDateString]
    ]

    let finalQueryPromise = null;

    await queryPromise(query, values)
    .then(
      (any) => {
        console.log('done adding cart ', any, ' now adding first product...');
        let query = 
        `INSERT INTO cartAndProduct 
        (cartId, productId, date_updated)
        VALUES ?`;
        let values = [
          [any.insertId, firstProduct.id, mySQLDateString]
        ]
        finalQueryPromise = queryPromise(query, values);
      }
    );
    return finalQueryPromise;
  }

  static async repoAddProductToCart(cartId, nextProduct){    
    const isoDate = new Date();
    const mySQLDateString = isoDate.toJSON().slice(0, 19).replace('T', ' ');

    let query = 
      `INSERT INTO cartAndProduct 
      (cartId, productId, date_updated)
      VALUES ?`;
    let values = [
      [cartId, nextProduct.id, mySQLDateString]
    ]
    return queryPromise(query, values);
  }    

  static async repoRemoveProductFromCart(cartId, productId){
    productId = Number(productId);
    if(isNaN(productId)){
      return;
    }
    let query = 
      `DELETE FROM cartAndProduct 
      WHERE 
            cartId = `+cartId+` 
          AND 
            productId = `+ productId +`;`;
            
    return queryPromise(query);
  }   
}
module.exports = { CartRepo }

let queryPromise = function (query, value) {
  if (value) {
    return new Promise(function (res, rej) {
      connection.query(query, [value], (err, rows, columnInfos) => {
        if (err) return rej(err);
        res(rows, columnInfos);
      });
    });
  }
  return new Promise(function (res, rej) {
    connection.query(query, (err, rows, columnInfos) => {
      if (err) return rej(err);
      res(rows, columnInfos);
    });
  });
}
