const fs = require('fs')
const { TaskRepo } = require('../repository/task.repo');
const { matchedKey, validateUserSortParam } = require('../Utils');

class TaskController{

    static getAllTasks = async (req, res) => {
    
        let tasks = await TaskRepo.repoGetAllTasks();
        res.status(200).json({
            content: tasks,
            totalElements: tasks.length,
            totalPages: 5,
            size: 1,
        });
    }

    static addTask = async (req, res) => {
        let task = req.body.task;
        console.log("addTask", task);
        
        let taskFound = await TaskRepo.repoGetTaskByName(task.name);
        if(taskFound && taskFound.length > 0){            
            console.log("CAN'T ADD SUCH TASK CUZ Of: DUPLICATE NAME", taskFound);            
            res.status(400).send();
            return;
        }

        await TaskRepo.repoAddTask(task)
        .then(
            ()=>{
                console.log("DONE");
                res.status(200).send();
            }
        ).catch(
            () => {
                console.warn("addTask failure, req = ", req);
                res.status(400).send();
            }
        );
    }

    static updateTask = async (req, res) => {
        let task = req.body.task;
        console.log("updateTask", task);

        await TaskRepo.repoUpdateTask(task)
        .then(
            ()=>{
                console.log("DONE");
                res.status(200).send();
            }
        ).catch(
            () => {
                console.warn("addTask failure, req = ", req);
                res.status(400).send();
            }
        );
    }
    
    static deleteById = async (req, res) => {
        let id = req.params.id;
        console.log("delete by id ", id);

        await TaskRepo.repoDeleteTask(id)
        .then(
            ()=>{
                console.log("DONE");
                res.status(200).send();
            }
        ).catch(
            () => {
                console.warn("addTask failure, req = ", req);
                res.status(400).send();
            }
        );
    }

    static getTaskById = async (req, res) => {
        let id = req.params.id;
        console.log("getTaskById by id ", id);

        let taskFound = await TaskRepo.repoGetById(id);

        console.log("DONE");
        res.status(200).json({
            task: taskFound
        });
    }

}


module.exports = {
    TaskController
}
