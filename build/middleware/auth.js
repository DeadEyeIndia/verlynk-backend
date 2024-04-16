"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticatedUser = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const errorHandling_1 = __importDefault(require("../utils/errorHandling"));
const mongodb_1 = require("../models/mongodb");
const user_1 = require("../lib/data/user");
const catchAsyncError_1 = __importDefault(require("./catchAsyncError"));
const constants_1 = require("../utils/constants");
exports.isAuthenticatedUser = (0, catchAsyncError_1.default)((req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { verlynk_token } = req.cookies;
    if (!verlynk_token) {
        return next(new errorHandling_1.default("Please login!", 401));
    }
    const decodeData = (0, jsonwebtoken_1.verify)(verlynk_token, process.env.JWT_SECRET || "sdw5bsbf2sdawd");
    if (!decodeData.id || !decodeData.email) {
        return next(new errorHandling_1.default("Please login!", 403));
    }
    const db = yield (0, mongodb_1.getMongoDb)();
    const existingUser = yield (0, user_1.findUserById)(db, decodeData.id);
    if (!existingUser) {
        return next(new errorHandling_1.default("User not found!", 403));
    }
    const user = (0, constants_1.pick)(existingUser, "_id", "email");
    req.user = user;
    next();
}));
