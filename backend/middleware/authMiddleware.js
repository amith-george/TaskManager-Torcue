const admin = require('../config/firebase-config');
const User = require('../models/user.model');

const protect = async (req,res,next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decodedToken = await admin.auth().verifyIdToken(token);

            req.user = await User.findOne({ firebaseUid: decodedToken.uid });

            if (!req.user) {
                return res.status(401).json({ message: 'User not found in database.'});
            }

            req.firebaseUid = decodedToken.uid;
            
            next();
        } catch (error) {
            console.log(error);
            res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token.' });
    }
};


const adminOnly = (req,res,next) => {
    if (req.user && req.user.role == 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Admins only.'});
    }
};

module.exports = { protect, adminOnly };