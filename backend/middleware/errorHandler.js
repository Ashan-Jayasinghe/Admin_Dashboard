// middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
    // Log the error (you can use a logger library like winston or morgan)
    console.error(err.stack);

    // Set the response status based on the error type
    let statusCode = 500; // Default to server error
    let message = 'Internal Server Error';

    if (err.name === 'ValidationError') {
        statusCode = 400; // Bad Request
        message = err.message; // Send the validation error message
    } else if (err.name === 'MongoError' && err.code === 11000) {
        statusCode = 409; // Conflict (e.g., duplicate key error)
        message = 'Duplicate key error. Resource already exists.';
    } else if (err.status) {
        statusCode = err.status; // Custom status from controller
        message = err.message; // Custom message from controller
    } else if (err.message) {
        message = err.message; // General error message
    }

    // Send the response
    res.status(statusCode).json({
        status: 'error',
        message: message,
        // Optionally include additional error details in development mode
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export default errorHandler;