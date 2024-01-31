const express = require('express')
const { TaskController } = require('../controllers/task.controller')
const router  = express.Router()

router.get('/', TaskController.getAllTasks );
router.get('/:id', TaskController.getTaskById )

router.post('/', TaskController.addTask );
router.put('/', TaskController.updateTask );
router.delete('/:id', TaskController.deleteById );


module.exports = router