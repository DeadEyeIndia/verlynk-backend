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
exports.userSignOut = exports.userSignIn = void 0;
const mongodb_1 = require("../models/mongodb");
const user_1 = require("../lib/data/user");
const catchAsyncError_1 = __importDefault(require("../middleware/catchAsyncError"));
const errorHandling_1 = __importDefault(require("../utils/errorHandling"));
const bcrypt_1 = require("../utils/bcrypt");
const jwt_1 = require("../utils/jwt");
exports.userSignIn = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (email === "" || password === "") {
        return next(new errorHandling_1.default("Missing Fields!", 406));
    }
    const db = yield (0, mongodb_1.getMongoDb)();
    const existingUser = yield (0, user_1.findUserByEmail)(db, email);
    if (!existingUser) {
        return next(new errorHandling_1.default("Invalid credentials!", 401));
    }
    const isMatchingPassword = yield (0, bcrypt_1.comparePassword)(password, existingUser.password);
    if (!isMatchingPassword) {
        return next(new errorHandling_1.default("Invalid credentials!", 401));
    }
    (0, jwt_1.sendToken)(existingUser, 200, res);
}));
exports.userSignOut = (0, catchAsyncError_1.default)((_req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie("verlynk_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        priority: "high",
    });
    return res.status(200).json({
        success: true,
        message: "Logged out",
    });
}));
