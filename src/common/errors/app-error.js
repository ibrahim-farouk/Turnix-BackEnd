import { API_RESPONSE } from "../utils/constants.js";

class AppError extends Error {
    constructor(message, statusCode, errorCode = null) {
        super(message); // Calling parent class constructor with message
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.status = API_RESPONSE.ERROR;
        this.isOperational = true; // This will be handled by global error handler

        Error.captureStackTrace(this, this.constructor); // To get the stack trace of the error
    }

}

export default AppError;