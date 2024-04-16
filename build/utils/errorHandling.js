"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorHandler extends Error {
    constructor(message, statusCode, error) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.error = error;
        this.statusCode = statusCode;
        this.error = error;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = ErrorHandler;
