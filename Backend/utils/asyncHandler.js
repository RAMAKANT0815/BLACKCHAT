const asyncHandler = (requestHandler) => async (req, res, next) => {
    try {
        await requestHandler(req, res, next);
    } catch (error) {
        // Find the code (checking ApiError's statusCode first, then MongoDB's code)
        let code = error.statusCode || error.code || 500;
        
        // If the code is not a valid HTTP status, default to 500
        if (typeof code !== "number" || code < 100 || code > 599) {
            code = 500;
        }

        res.status(code).json({ 
            message: error.message, 
            success: false 
        });
    }
}

export default asyncHandler;