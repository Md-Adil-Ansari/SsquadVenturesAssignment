const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
    user1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
},{timestamps:true});

connectionSchema.index(
    { user1: 1, user2: 1 },
    { unique: true }
);

connectionSchema.pre('save', function (next) {
    if (this.user1 > this.user2) {
        [this.user1, this.user2] = [this.user2, this.user1];
    }
    next();
});

module.exports = mongoose.model('Connection', connectionSchema);
