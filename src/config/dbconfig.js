const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'user',
  password: 'password',
  database: 'root',
  port: '42333'
})

connection.connect();

module.exports = connection;

let logQuery = false;
let callQuery = (query, values, eachRowCallback) => {
  if (values) {
    connection.query(query, [values], (err, rows, columnInfos, any) => {
      if (err) throw err;
      if (eachRowCallback)
        rows.forEach(eachRow => {
          eachRowCallback(eachRow)
        });
      if(logQuery) console.log('rows ', rows);
      if(logQuery) console.log('columnInfo ', columnInfos);
    });
    return;
  }
  connection.query(query, (err, rows, columnInfos, any) => {
    if (err) throw err;

    if (eachRowCallback){
      rows.forEach(eachRow => {
        eachRowCallback(eachRow)
      });
    }
    if(logQuery) console.log('rows ', rows)
    if(logQuery) console.log('columnInfo ', columnInfos)
  })
}

// let query = `CREATE TABLE products (
//   id INT primary key NOT NULL AUTO_INCREMENT,
//   title_text VARCHAR(45),
//   desc_text VARCHAR(255),
//   likes_count INT,
//   imgId INT,
//   categoryId INT,
//   visit_count INT,
//   download_count INT,
//   price INT,
//   authorId INT,
//   geometry VARCHAR(45),
//   polygon_count INT,
//   vertices_count INT,
//   has_textures BOOLEAN,
//   has_material BOOLEAN,
//   had_rigged BOOLEAN,
//   had_animated BOOLEAN,
//   had_UVMapped BOOLEAN,
//   is_gameReady BOOLEAN,
//   fileId INT,
//   tagId INT,
//   date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
//   date_updated DATETIME ON UPDATE CURRENT_TIMESTAMP
// );`

// let query = `CREATE TABLE imgs (
//   id INT primary key NOT NULL AUTO_INCREMENT,
//   file longblob NOT NULL,
//   date_added datetime NOT NULL DEFAULT current_timestamp()
// );`

//let query = `ALTER TABLE imgs ADD COLUMN file_size int DEFAULT 0;`

const productImageFolder = './data/productImage/';
const fs = require('fs');
const { throws } = require('assert');
const { FakeDataGenerator } = require('./FakeData');

// fs.readdir(productImageFolder, (err, fileNames) => {
//   if (!fileNames || fileNames.length === 0) {
//     console.log("FOUND NONE !");
//     return;
//   }

//   fileNames.forEach(filename => {
//     let fullFileName = productImageFolder + filename;
//     fs.readFile(fullFileName, (err, fileData) => {
//       if(err) throw err;

//       let query = `INSERT INTO imgs (file_size, name, file)
//        VALUES ?`;

//       let fileSize = fs.statSync(fullFileName).size;
//       console.log('fileSize ', fileSize, 'filename ', filename);

//       if(filename.length > 45){
//         filename.length = 45;
//         filename = filename.substring(0, 45);
//       }

//       var values = [
//         [fileSize, filename, fileData.buffer]
//       ];
//       // connection.query(query, [values], (err, rows, columnInfos, any) => {
//       //    if (err) throw err;

//       //   console.log('rows ', rows)
//       //   console.log('columnInfo ', columnInfos)
//       // })
//     });
//   });
// });

var products = FakeDataGenerator.generateFakeProductDetailInfos();
products.forEach(
  product => {
    var query = `INSERT INTO products 
        (title_text, desc_text, 
        likes_count, categoryId, visit_count, download_count, price, authorId, 
        geometry, polygon_count, vertices_count, 
        has_textures, has_material, had_rigged, had_animated, had_UVMapped, is_gameReady)
       VALUES ?`;

    var values = [
      [product.title_text, product.desc_text,
      product.likes_count, product.categoryId, product.visit_count, product.download_count,
      product.price, product.authorId,
      product.geometry, product.polygon_count, product.vertices_count,
      product.has_textures, product.has_material, product.had_rigged, product.had_animated, product.had_UVMapped, product.is_gameReady,
      ]
    ];
    //callQuery(query, values )

    var query = `SELECT id FROM products WHERE (lower(title_text) LIKE '%` +product.title_text.toLowerCase()+ `%');`
    // callQuery(query, null, (row) => {
    //   //console.log("row.id ", )
    //   let productId = row.id
    //   let imgs = product.imgs;
    //   imgs.forEach(
    //     eachImgName => {
    //       var query = `UPDATE imgs SET productId = ` + productId + ` WHERE (lower(name) LIKE '%` + eachImgName.toLowerCase() + `%');`
    //       //callQuery(query )
    //     }
    //   )
    // });
  }
)



// imgs: [
//     "4716-living-room.png",
//     "6102-living-room.png",
//     "6846-living-room.png",
//     "7985-living-room.png",
// ],
// categoryId: 2,
// authorId: 0,

// files:[
//     {
//         file_name:"livingroom_blender.rar",
//         file_format: "blender",
//     },
//     {
//         file_name:"livingroom_fbx.rar",
//         file_format: "fbx",
//     },
//     {
//         file_name:"livingroom_obj.rar",
//         file_format: "obj",
//     },
// ],
// tags: [
//     "living",
//     "room",
//     "architecture",
//     "bulding",
//     "furniture",
// ],
// date_added: '15-06-2021',
// date_updated: '22-5-2022',

// let query = `DROP TABLE products`;

// let query = `SELECT * FROM products;`

// let query = `INSERT INTO users
// (username, email, role, password)
// VALUES
// ('1234', '1234@456.com','01','HSB123zxc&*'),
// ('abcde', 'abcde@456.com','01','ABC123zxc&*'),
// ('Tomn', 'tomn@123.com','01','MgR123Wrapper$'),
// ('OPJK', 'opjk@123.com','02','abcd1234@') ;`

// let query = `UPDATE users
// SET firstname = 'myFirstName', lastname = 'y0urLastName'
// WHERE id < 6;`

// let query = `ALTER TABLE imgs
// ADD COLUMN productId INT NOT NULL DEFAULT 0;`
// callQuery(query);


// let query = `ALTER TABLE products
// MODIFY COLUMN title_text VARCHAR(255);`
// callQuery(query);


// let query = `INSERT INTO products
// (username, email, role, password)
//  VALUES
//  ('1234', '1234@456.com','01','HSB123zxc&*') ;`;


// let query = `CREATE TABLE carts (
//   id INT primary key NOT NULL AUTO_INCREMENT,
//   userId INT NOT NULL,  
//   date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
//   date_updated DATETIME ON UPDATE CURRENT_TIMESTAMP
// );`

// let query = `CREATE TABLE cartAndProduct (
//     id INT primary key NOT NULL AUTO_INCREMENT,
//     cartId INT NOT NULL,  
//     productId INT NOT NULL,  
//     date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
//     date_updated DATETIME ON UPDATE CURRENT_TIMESTAMP
//   );`

//callQuery(query)
