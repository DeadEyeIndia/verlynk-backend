"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const sendToken = (user, statusCode, res) => {
    const token = (0, jsonwebtoken_1.sign)({ id: user._id, email: user.email }, process.env.JWT_SECRET || "sdw5bsbf2sdawd", {
        expiresIn: process.env.JWT_EXPIRE || "1d",
    });
    const options = {
        expires: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
        httpOnly: true,
        path: "/",
        priority: "high",
        sameSite: "lax",
    };
    res
        .status(statusCode)
        .cookie("verlynk_token", token, options)
        .json({ success: true });
};
exports.sendToken = sendToken;
