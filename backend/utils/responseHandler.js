const responseHandler = {
    success: (res, message, data = null, statusCode = 200) => {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    },

    error: (res, message, statusCode = 500, errorDetails = null) => {
        const response = {
            success: false,
            message
        };

        if (errorDetails && process.env.NODE_ENV === 'development') {
            response.error = errorDetails.message || errorDetails;
        }

        return res.status(statusCode).json(response);
    }
};

module.exports = responseHandler;