const express = require("express")
var cors = require('cors');
var app = express(); 

const path = require('path')
app.use('/static', express.static(path.join(__dirname, 'data')))

const router = require("./src/routes/router.js");
const cartRouter = require("./src/routes/cart.route.js");
const tasksRouter = require("./src/routes/tasks.route.js");
const productRouter = require("./src/routes/product.route.js");
const userRouter = require("./src/routes/user.route.js");
const pagesRouter = require("./src/routes/pages.route.js");
app.use(cors());
const multer = require('multer')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, "AtMS" + Date.now() + '.jpg') //Appending .jpg
  }
})

const upload = multer({ storage: storage });
const upload2 = multer(
  { 
    storage:   multer.memoryStorage() 
  }
);

// npm install --save cookie-parser
let cookieParser = require('cookie-parser');

// npm install --save body-parser
var bodyParser = require('body-parser')

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

//app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.json({limit: '1024mb'}));

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))
const port = 8000

app.use(cookieParser());

app.use("/api", router)
app.use("/api/user", userRouter)
app.use("/api/products", productRouter)
app.use("/api/carts", cartRouter)
app.use("/api/v1/tasks", tasksRouter)

app.post("/api/file",
  upload.single('avatar'),
  function (req, res, next) {
    console.log("123");
    res.send({});
  }
)
app.post("/api/file2",
  upload2.single('avatar'),
  function (req, res, next) {
    console.log("456");
    res.send({});
  }
)

app.use("/views", pagesRouter)

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.set("view engine", "ejs")
app.set('views', "./src/views", 'views');

app.listen(port, () => {
  console.log("--------------------------------------------------------Start serrver------------------------------------------------")
  // let str = '-';
  // let num = Math.random() * 100000;
  // while(num >= 10){
  //   str += '-'
  //   if(str.length % 134 === 0){
  //     str += '-\n'
  //   }
  //   num = Math.random() * 100000;
  //   str += convert(num)
  // }
  // console.log(str)
})

var connection = require("./src/config/dbconfig.js");
connection.query('SELECT 1 + 1 AS solution', (err, rows, fields) => {
  if (err) throw err;

  console.log('The solution is: ', rows[0].solution)
})

function convert(num) {
  return num
      .toString()    // convert number to string
      .split('')     // convert string to array of characters
      .map(Number)   // parse characters as numbers
      .map(n => (n || 10) + 64)   // convert to char code, correcting for J
      .map(c => String.fromCharCode(c))   // convert char codes to strings
      .join('');     // join values together
}

