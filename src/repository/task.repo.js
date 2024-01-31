const connection = require('../config/dbconfig');

const CartStatusEnum = {
  BROWSING : 0, 
  AWAITING_PAYMENT : 1, 
  PAID : 2, 
}

class TaskRepo {
  static async repoGetTaskByName(taskName) {
    let query = ` 
      SELECT 
        *
      FROM
        root.Task
      WHERE name = "` + taskName + `"
    ;`
    return queryPromise(query)
  };


  static async repoGetById(id) {
    let query = ` 
      SELECT 
        *
      FROM
        root.Task
      WHERE id = ` + id + `  
    ;`
    return queryPromise(query)
  };

  static async repoGetAllTasks() {
    let query = ` 
      SELECT 
        *
      FROM
        root.Task
    ;`

    return queryPromise(query)
  };

  static async repoAddTask(task){
    let query = `INSERT INTO root.Task  
      (name, status)
      VALUES (?) `;

    let values = [task.name, "unknown"];
    return queryPromise(query, values);
  }

  static async repoDeleteTask(id){
    let query = "DELETE FROM root.task "
      + "WHERE id = '" + id + "';";

    return queryPromise(query);
  }
  static async repoUpdateTask(task){
    let query = `UPDATE root.task  
      SET name = "` + task.name
      + `", status = "` + task.status
      + `" WHERE id = ` + task.id + `;`;
    return queryPromise(query);
  }

}

module.exports = { TaskRepo }

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
