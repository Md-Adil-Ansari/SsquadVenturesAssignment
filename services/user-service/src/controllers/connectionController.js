// services/user-service/src/controllers/connectionController.js

const Connection = require('../models/connectionModel');
const User = require('../models/userModel');
const BadRequestError = require('../../../../shared/errors/BadRequestError');
const NotFoundError = require('../../../../shared/errors/NotFoundError');
const { sendSuccess, sendError } = require('../../../../shared/utils/responseHandler');

const createConnection = async (req, res, next) => {
    try {
        const { targetUserId } = req.body;
        const requestingUserId = req.user.id;

        if (!targetUserId) {
            throw new BadRequestError('Target user ID is required.');
        }

        if (requestingUserId === targetUserId) {
            throw new BadRequestError('You cannot connect with yourself.');
        }

        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            throw new NotFoundError('Target user not found.');
        }

        const [user1, user2] = requestingUserId < targetUserId
            ? [requestingUserId, targetUserId]
            : [targetUserId, requestingUserId];

        const existingConnection = await Connection.findOne({ user1, user2 });
        if (existingConnection) {
            throw new BadRequestError('Connection already exists.');
        }

        const newConnection = new Connection({ user1, user2 });
        await newConnection.save();

        sendSuccess(res, {
            data: {
                connectionId: newConnection._id,
                connectedUser: {
                    id: targetUser._id,
                    username: targetUser.username,
                    email: targetUser.email
                },
                createdAt: newConnection.createdAt
            },
            message: 'Connection created successfully.'
        }, 201);
    } catch (error) {
        if (error.code === 11000) { 
            return sendError(res, {
                status: 'error',
                error: {
                    code: 'CONNECTION_EXISTS',
                    message: 'Connection already exists.'
                }
            }, 400);
        }
        next(error);
    }
};



const getFriendsOfUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if(req.user.id.toString()!==userId.toString()){
            throw new BadRequestError('The user Id entered is not the logged in user...');
        }

        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new BadRequestError('Invalid user ID format.');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found.');
        }

        const connections = await Connection.find({
            $or: [
                { user1: userId },
                { user2: userId }
            ]
        })
            .populate('user1', 'username email')
            .populate('user2', 'username email')
            .lean();

        const friends = connections.map(conn => 
            conn.user1._id.toString() === userId ? { id: conn.user2._id, username: conn.user2.username } : { id: conn.user1._id, username: conn.user1.username }
        );

        const uniqueFriendsMap = new Map();
        friends.forEach(friend => {
            uniqueFriendsMap.set(friend.id.toString(), friend);
        });
        const uniqueFriends = Array.from(uniqueFriendsMap.values());

        sendSuccess(res, {
            data: {
                friends: uniqueFriends
            },
            message: 'Friends of the specified user retrieved successfully.'
        }, 200);
    } catch (error) {
        next(error);
    }
};


const getFriendsOfFriends = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if(req.user.id.toString()!==userId.toString()){
            throw new BadRequestError('The user Id entered is not the logged in user...');
        }

        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            throw new BadRequestError('Invalid user ID format.');
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found.');
        }

        const connections = await Connection.find({
            $or: [
                { user1: userId },
                { user2: userId }
            ]
        })
            .lean();

        const friends = connections.map(conn => 
            conn.user1.toString() === userId ? conn.user2.toString() : conn.user1.toString()
        );

        const friendsOfFriendsPromises = friends.map(friendId => 
            Connection.find({
                $or: [
                    { user1: friendId },
                    { user2: friendId }
                ]
            })
                .lean()
                .then(conns => conns.map(conn => 
                    conn.user1.toString() === friendId ? conn.user2.toString() : conn.user1.toString()
                ))
                .catch(err => {
                    console.error(`Error fetching connections for friend ${friendId}:`, err.message);
                    return [];
                })
        );

        const friendsOfFriendsArrays = await Promise.all(friendsOfFriendsPromises);
        let friendsOfFriends = friendsOfFriendsArrays.flat();

        friendsOfFriends = friendsOfFriends.filter(id => id !== userId && !friends.includes(id));
        friendsOfFriends = Array.from(new Set(friendsOfFriends));

        if (friendsOfFriends.length > 0) {
            const users = await User.find({ _id: { $in: friendsOfFriends } }, 'username').lean();
            const friendsOfFriendsWithDetails = users.map(user => ({
                id: user._id,
                username: user.username
            }));
            sendSuccess(res, {
                data: {
                    friendsOfFriends: friendsOfFriendsWithDetails
                },
                message: 'Friends of friends retrieved successfully.'
            }, 200);
        } else {
            sendSuccess(res, {
                data: {
                    friendsOfFriends: []
                },
                message: 'Friends of friends retrieved successfully.'
            }, 200);
        }
    } catch (error) {
        next(error);
    }
};


module.exports = {
    createConnection,
    getFriendsOfUser,
    getFriendsOfFriends
};
