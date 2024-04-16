"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (theFunc) => (req, res, next) => {
    Promise.resolve(theFunc(req, res, next)).catch(next);
};
