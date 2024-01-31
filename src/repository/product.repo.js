const connection = require('../config/dbconfig');
const moment = require('moment/moment');
const fs = require('fs');

class ProductRepo {
  static repoGetAllProducts() {
    //let selectAllProduct = "SELECT * FROM products;"
    
    let selectAllProductJoinImgs = `
        SELECT 
            products.*,
            category.name as category_name,
            group_concat(imgs.id SEPARATOR ', ') as imageIds, 
            group_concat(imgs.name SEPARATOR ', ') as imageNames
        FROM
            root.products
                INNER JOIN
            root.imgs ON products.id = imgs.productId
                INNER JOIN
            root.category ON products.categoryId = category.id
        group by products.id;`;

    return queryPromise(selectAllProductJoinImgs)
  }

  static repoGetProduct(id) {
    let query = "SELECT * FROM products WHERE id = " + id + ";";
    return queryPromise(query)
  }

  static getBaseCategories() {
    let query = `SELECT * FROM category WHERE parentId = 0`;
    return queryPromise(query);
  }

  static getAllCategories(){    
    let query = `SELECT * FROM category`;
    return queryPromise(query);
  }

  static repoInsertProduct(product) {
    product.categoryId = product.categoryId || "0";

    let polygon_count = 0;
    let vertices_count = 0;
    let has_textures = 1;
    let has_material = 1;
    let had_rigged = 1;
    let had_animated = 1;
    let had_UVMapped = 1;
    let is_gameReady = 1;

    let query = `INSERT INTO products  
      (title_text, desc_text, categoryId, 
        likes_count, visit_count, download_count, price, geometry)
      VALUES (?) `;

    let values = [
      product.title_text, product.desc_text, product.categoryId,
      0, 0, 0,
    Number(product.price) || 0, product.geometry];
    return queryPromise(query, values);
  }

  static async saveImagesToLocal(images, productId) {
    if(!images || images.length < 1){
      console.warn("CAN'T Save those images to server, got ", images);
      return;
    }
    let addedImgs = [];

    
    console.log("saving ", images.length);
    images.forEach(
      eachImg => {
        let eachImageBase64String = eachImg.data_url;

        let fileName = getNextProductImgName(
          Number(productId),
          eachImageBase64String
        );
        let fullFileName = "data/productImage/" + fileName;

        eachImageBase64String = eachImageBase64String.split(';base64,').pop();

        console.log("saving... ", fullFileName);
        fs.writeFileSync(fullFileName, eachImageBase64String, 'base64');
        console.log("SAVED FILE: ");
        addedImgs.push({
          fullFileName: fullFileName
        });
      }
    );
    console.log("returned addedImgs ", addedImgs);
    return addedImgs;
  }

  static isOnlyOnLocal(img){
    return img.file.toString() === "unavailable";
  }

  static repoAddProductImages(imgs, productId) {
    if (!imgs || imgs.length < 1) {
      console.warn("CAN'T ADD such product image into DB, got ", imgs);
      return;
    }

    var values = [];

    imgs.forEach(
      img => {

        /***
         * @type {string}
         */
        let fullFileName = img.fullFileName;
        if (!fullFileName) return;

        let fileSize = fs.statSync(fullFileName).size;

        let filename = fullFileName.split('/').pop();
        if (filename.length > 1024) {
          filename = filename.substring(0, 1024);
        }

        values.push([productId, fileSize, filename, "unavailable"]);
      }
    );

    let query = `INSERT INTO imgs 
                 (productId, file_size, name, file)
                 VALUES ?`;

    return queryPromise(query, values)
  }

  /***
   * @param {number} productId
   */
  static getProductImages(productId){
    if(isNaN(Number(productId))){
      console.warn("getProductImages(..): invalid product id, got " + productId);
      return;
    }
    
    productId = Number(productId);
    let query = `SELECT * FROM imgs WHERE productId = ` + productId + `;`;   

    return queryPromise(query)
  }

  static repoUpdateProduct(id, product) {
    let query = `UPDATE products  
      SET title_text = "` + product.title_text
      + `", desc_text = "` + product.desc_text
      + `", price = ` + product.price
      + `, categoryId = ` + product.categoryId
      + `, geometry = "` + product.geometry 
      + `" WHERE id = ` + id + `;`;

    return queryPromise(query)
  }

  static repoDeleteProduct(id) {
    let query = "DELETE FROM products "
      + "WHERE id = '" + id + "';";

    return queryPromise(query)
  }
}


// module.exports = {repoGetAllProducts, repoGetProduct,
//    repoInsertProduct, 
//     repoUpdateProduct, repoDeleteProduct}

module.exports = { ProductRepo };

const queryPromise = function (query, value) {
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


/***
 * @param {number} productId
 * @param {string} base64FileData
 */
const getNextProductImgName = (productId, base64FileData) => {
  let ext = ".png";
  if (base64FileData.startsWith("data:image/jpeg")) {
      ext = ".jpeg";
  }
  let timeString = moment().format("D-M-YYYYTH-mm-ss-SSSS");
  return "productImage-id" + productId + "-" + timeString + ext;
}
