const admin = require('../config/firebase-config');
const User = require('../models/user.model');

const socketMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if(!token) {
            return next(new Error("Authentication error: No token provided."));
        }

        const decodedToken = await admin.auth().verifyIdToken(token);

        const user = await User.findOne({ firebaseUid: decodedToken.uid });

        if (!user) {
            return next(new Error("Authentication error: User not found."));
        }

        socket.user = user;

        next();
    } catch (error) {
        console.error("Socket Authentication Error: ", error.message);
        next(new Error("Authentication error."));
    }
};

module.exports = socketMiddleware;