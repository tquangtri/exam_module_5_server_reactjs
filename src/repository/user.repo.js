
const connection = require('../config/dbconfig');

let doLogin = function (email, password) {
  //console.log("doLogin ", email)
  //console.log("doLogin ", password)

  let query = "SELECT * FROM users WHERE email = '" + email + "' AND password = '" + password + "';"
  return new Promise(function (res, rej) {
    connection.query(query, (err, rows, columnInfos) => {
      if (err) return rej(err);
      res(rows, columnInfos);
    });
  });
};


let repoGetAllUsers = function () {
  let query = "SELECT * FROM users "
  return new Promise(function (res, rej) {
    connection.query(query, (err, rows, columnInfos) => {
      if (err) return rej(err);
      res(rows, columnInfos);

    });
  });
};

let repoGetMatchingUser = function (limit = 10000) {  
  limit = Number(limit);
  if(isNaN(limit)){
    limit = 10000;
  }
  
  let query = "SELECT * FROM users LIMIT " + limit + ";";
  return queryPromise(query);  
}

let repoGetUser = function (id) {
  let query = "SELECT * FROM users WHERE id = " + id + ";";

  return queryPromise(query)
}

let repoInsertUser = function (user) {
  user.role = user.role || "0"

  let query = "INSERT INTO users "
    + "(username, email, role, firstname, lastname, password) "
    + " VALUES "
    + "( '" + user.username 
    + "','" + user.email 
    + "', '" + user.role 
    + "', '" + user.firstname 
    + "', '" + user.lastname 
    + "', '" + user.password + "' );";

  return queryPromise(query)
}

let repoUpdateUser = function (id, user) {
  let query = "UPDATE users "
    + "set username = '" + user.username
    + "', email = '" + user.email
    + "', firstname = '" + user.firstname
    + "', lastname = '" + user.lastname 
    + "', role  = '" + user.role
    + "', password = '" + user.password + "'"
    + " WHERE id = '" + id + "';";

  return queryPromise(query)
}

let repoDeleteUser = function (id) {
  let query = "DELETE FROM users "
    + "WHERE id = '" + id + "';";

  return queryPromise(query)
}

let c = function () {

}
let d = function () {

}
let e = function () {

}
let f = function () {

}

module.exports = { doLogin, repoGetAllUsers, repoGetUser, repoInsertUser, repoUpdateUser, b: repoDeleteUser, repoGetMatchingUser,  c, d, e, f }

let queryPromise = function (query) {
  return new Promise(function (res, rej) {
    connection.query(query, (err, rows, columnInfos) => {
      if (err) return rej(err);
      res(rows, columnInfos);

    });
  });
}
