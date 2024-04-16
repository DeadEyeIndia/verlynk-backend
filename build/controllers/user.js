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
exports.userSignUp = void 0;
const mongodb_1 = require("mongodb");
const catchAsyncError_1 = __importDefault(require("../middleware/catchAsyncError"));
const errorHandling_1 = __importDefault(require("../utils/errorHandling"));
const mongodb_2 = require("../models/mongodb");
const user_1 = require("../lib/data/user");
const constants_1 = require("../utils/constants");
const bcrypt_1 = require("../utils/bcrypt");
exports.userSignUp = (0, catchAsyncError_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullname, email, password } = req.body;
    if (fullname === "" || email === "" || password === "")
        return next(new errorHandling_1.default("Missing fields", 406));
    const db = yield (0, mongodb_2.getMongoDb)();
    const existingUser = yield (0, user_1.findUserByEmail)(db, email);
    if (existingUser) {
        return next(new errorHandling_1.default("Email already registered!", 409));
    }
    const hashedPassword = yield (0, bcrypt_1.hashPassword)(password);
    const newUser = yield db.collection(constants_1.USER_COLLECTION).insertOne({
        _id: new mongodb_1.ObjectId(),
        fullname: fullname,
        email: email,
        password: hashedPassword,
    });
    if (!newUser.acknowledged || !newUser.insertedId) {
        return next(new errorHandling_1.default("Registration failed, Try again after sometime!", 409));
    }
    return res.status(201).json({
        message: "Registration success",
        success: true,
    });
}));
