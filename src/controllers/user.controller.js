const fs = require('fs')
const { doLogin: findMatchedUser, repoGetAllUsers, repoGetUser, repoGetMatchingUser,
    repoInsertUser, repoUpdateUser, b, c, d, e, f } = require('../repository/user.repo');
const { matchedKey, validateUserSortParam } = require('../Utils');

const DEFAULT_PASSWORD = "abc123!@#A";

const getViewUser = (req, res) => {
    console.log("getView")
    res.render('pages/users', {
        username: 'Nguyen Van A',
        num1: 10,
        num2: 5,
        arrayNumber: [0, 1, 2, 3, 4, 5, 6, 7, 8, 100, 200]
    });
}

// API Đăng ký
const registerUser = async (req, res) => {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Register User'
    // #swagger.description = 'Register user description'
    const { username, email, role, password } = req.body // get data request 
    let message = {
        username: '',
        email: '',
        password: '',
    }
    let isValidate = false

    if (!username || username.trim().length < 3) {
        message.username = 'User phải trên 3 ký tự.'
        isValidate = true
    }

    if (!email || !/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email.trim())) {
        message.email = 'Email không hợp lệ.'
        isValidate = true
    }

    if (!password || password.trim().length < 8) {
        message.password = 'Password phải trên 8 ký tự.'
        isValidate = true
    }

    if (isValidate) {
        res.status(400).json(message)
        return;
    }

    // 
    //let users = JSON.parse(fs.readFileSync('data/users.json'))
    //
    //const userExisted = users.findIndex(user => user.email === email)

    let userExisted = false;

    let matchedUsers = await findMatchedUser(email, password);
    //console.log("matchedUsers ", matchedUsers);
    userExisted = matchedUsers.length > 0;

    if (userExisted) {
        res.status(400).json({
            message: 'Tài khoản đã tồn tại.'
        })
        return;
    }

    const user = {
        username: username,
        email: email,
        role: role || "01",
        password: password
    }

    let any = repoInsertUser(user);

    res.status(200).json({
        message: 'Đăng ký thành công',
        data: req.body
    })
}

// API login
const loginUser = async (req, res) => {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Login User'
    // #swagger.description = 'Login user description'
    const { email, password } = req.body

    let message = {
        username: '',
        email: '',
        password: '',
    }
    let isValidate = false

    if (!email || !/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email.trim())) {
        message.email = 'Email không hợp lệ.'
        isValidate = true
    }

    //const users = JSON.parse(fs.readFileSync('data/users.json'))
    //const user = users.find(user => user.email === email)

    let matchedUsers = await findMatchedUser(email, password);
    let userExisted = matchedUsers.length > 0;

    if (!userExisted) {
        res.status(400).json({
            message: 'Tài khoản không tồn tại.'
        })
        return;
    }

    if (isValidate) {
        res.status(400).json(message);
        return;
    }

    res.cookie('user-cookie', matchedUsers[0]);
    res.status(200).json({
        message: 'Đăng nhập thành công',
        user: {
            id: matchedUsers[0].id,
            email: email
        }
    })
}

// API get danh sách User
const getAllUsers = async (req, res) => {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Get User'
    // #swagger.description = 'Get user description'
    //let { keyword, page, size } = req.query;
    //let users = JSON.parse(fs.readFileSync('data/users.json'));

    let users = await repoGetAllUsers();
    res.status(200).json({
        content: users,
        totalElements: users.length,
        totalPages: 5,
        size: 1,
    });
}

const getUserById = async (req, res) => {
    let user = await repoGetUser(req.params.id);

    res.status(200).json({
        user: user
    });
}

const getCookie = async (req, res) => {
    res.status(200).json({
        cookie: req.cookies
    });
}

const deleteCookie = async (req, res) => {
    res.clearCookie('user-cookie');
    res.status(200).json({
        message: "Cookies cleared"
    });
}

// API create User
const createUser = (req, res) => {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Create User'
    // #swagger.description = 'Create user description'

    if(req.body.body){
        var { username, email, role, firstname, lastname, password } = req.body.body
    }
    else
        var { username, email, role, firstname, lastname, password } = req.body

    const user = {
        username: username || "no-name",
        email: email || "unknown@unknown.com",
        firstname: firstname || "",
        lastname: lastname || "",
        role: role || "0",
        password: password || DEFAULT_PASSWORD
    }
    console.log("createUser ", user);
    repoInsertUser(user)
    
    cached_selectAllUser = null;
    res.status(200).json(user);
}

// API xóa User
const deleteUser = (req, res) => {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Delete User'
    // #swagger.description = 'Delete user description'
    let userId = req.params.id;
    if (!userId) {
        res.status(400);
        res.send("Giá trị Id không hợp lệ");
    }
    console.log("delete with id " + userId);
    let any = b(userId);
    cached_selectAllUser = null;
    res.status(200).json("Xóa thành công");
}

// API chỉnh sửa User 
const updateUser = (req, res) => {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Update User'
    // #swagger.description = 'Update user description'
    let userId = req.params.id;
    let userReq = req.body;
    if (!userId) {
        res.status(400);
        res.send(" Giá trị ID không hợp lệ");
    }

    console.log("updateUser ", userReq);
    let any = repoUpdateUser(userId, userReq);

    res.status(200).json(userReq);
}

/***
 * @type {string[]}
 */
let cached_selectAllUser = null;
let userCacheIter = null;

const getMatchingUser = async (req, res) => {
    let { key, page, size, sort } = req.query;
    console.log("getMatchingUser, query = ", req.query);
    page = Number(page);
    if (!page || isNaN(page) || page <= 0) {
        page = 1;
    }

    if (!size || isNaN(size)) {
        size = 10;
    }

    const pageSize = Number(size);

    let { sortOrder, sortBy } = validateUserSortParam(sort);

    //_allUser = await repoGetMatchingUser();
    if(!cached_selectAllUser){
        if(userCacheIter) {
            clearInterval(userCacheIter);
            userCacheIter = null;
        }
        cached_selectAllUser = await repoGetMatchingUser();
        userCacheIter = setInterval(
            () => {
                cached_selectAllUser = null;
                clearInterval(userCacheIter);
            }, 8000
        );
    }
      
    let pagedUsers = [...cached_selectAllUser];

    if (key) {
        pagedUsers = pagedUsers.filter((user) => {
            return matchedKey(user.username, key)
                || matchedKey(user.email, key)
                || matchedKey(user.role, key)
                || matchedKey(user.firstname, key)
                || matchedKey(user.lastname, key);
        })
        //console.log("pagedUsers matched key: ", pagedUsers)
    }
    let totalFound = pagedUsers.length;

    //console.log("sortOrder ", sortOrder)
    //console.log("sortBy ", sortBy)
    pagedUsers = pagedUsers.sort(
        (userA, userB) => {
            let compareElementA = userA[sortBy] || "";
            let compareElementB = userB[sortBy] || "";

            if (sortOrder === "asc") {
                return compareElementA.localeCompare(compareElementB);
            }
            return -(compareElementA.localeCompare(compareElementB));
        }
    );
    //console.log("pagedUsers with pageSize: ", pagedUsers)



    let startIndex = (page - 1) * pageSize;
    let endIndex = startIndex + (pageSize - 1);
    //console.log("startIndex ", startIndex)
    //console.log("endIndex ", endIndex)
    pagedUsers = pagedUsers.slice(startIndex, endIndex + 1);
    //console.log("pagedUsers sorted", pagedUsers)

    pagedUsers.forEach(
        user => {
            user.password = "HIDDEN";
        }
    );

    return res.status(200).json({
        content: pagedUsers,
        pageIndex: Math.floor(startIndex / pageSize) + 1,
        totalElements: totalFound,
        totalPages: Math.ceil(totalFound / pageSize),
        size: pageSize,
        sortOrder: sortOrder,
        sortBy: sortBy,
        searchKey: key,
    });
}

module.exports = {
    getMatchingUser,
    registerUser, loginUser, createUser,
    getAllUsers, updateUser, deleteUser, getViewUser,
    getCookie, deleteCookie, getUserById
}
