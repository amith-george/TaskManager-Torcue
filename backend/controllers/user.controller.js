const User = require('../models/user.model');
const responseHandler = require('../utils/responseHandler');

// Syncs firebase user with database 
const syncUser = async (req,res) => {

    const { firebaseUid, email } = req.body;
    const io = req.app.get('io');

    try {
        let user = await User.findOne({ firebaseUid });
        message = "Existing user logged in";

        if(!user) {
            user = await User.create({
                firebaseUid,
                email,
                role: 'employee'
            });
            message = "New employee created";
            console.log("New employee created: ", email);

            io.emit('user_registered', user);
        }

        return responseHandler.success(res, message, user);
    } catch (error) {
        console.error("Error in syncUser: ", error);
        return responseHandler.error(res, "Server error syncing user.", 500, error);
    }
};


// Fetch all employees for the admin
const getAllUsers = async (req,res) => {
    try {

        const users = await User.find({ role: 'employee' }).select('_id email');

        return responseHandler.success(res, "Users fetched successfully.", users);
    } catch (error) {
        console.error("Error in getAllUsers: ", error);
        return responseHandler.error(res, "Server error fetching users.", 500, error);
    }
};


module.exports = {
    syncUser,
    getAllUsers
};
