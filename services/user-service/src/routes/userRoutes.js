const express = require('express');
const router = express.Router();
const { registerUser,logoutUser, loginUser,getUserById } = require('../controllers/userController');
const {createConnection, getFriendsOfUser, getFriendsOfFriends}=require('../controllers/connectionController');
const asyncWrapper = require('../../../../shared/utils/asyncWrapper');
const authMiddleware=require('../middlewares/authMiddleware')

router.post('/register', asyncWrapper(registerUser));
router.post('/login', asyncWrapper(loginUser));
router.post('/logout', authMiddleware, asyncWrapper(logoutUser));
router.get('/getUser/:id', authMiddleware, asyncWrapper(getUserById));
router.post('/connect',authMiddleware, createConnection);
router.get('/:userId/friends', authMiddleware, getFriendsOfUser );
router.get('/:userId/friends-of-friends', authMiddleware, getFriendsOfFriends);

module.exports = router;
