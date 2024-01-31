const express = require('express')
const { registerUser, loginUser, getAllUsers,createUser, updateUser, deleteUser, getCookie, deleteCookie, getUserById, getMatchingUser  } = require('../controllers/user.controller')
const router  = express.Router()

router.post('/register', registerUser)
router.post('/login', loginUser)


router.get('/', getMatchingUser )
router.get('/:id', getUserById )
router.get('/cookie/', getCookie )
router.delete('/cookie/', deleteCookie )
router.post('/', createUser )
router.put('/:id', updateUser )
router.delete('/:id', deleteUser )



module.exports = router