const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['admin','employee'],
        default: 'employee'
    }
});


module.exports = mongoose.model('User', UserSchema);