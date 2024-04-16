"use strict";
/// <reference path="global.d.ts" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const error_1 = __importDefault(require("./middleware/error"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3010;
app.use(body_parser_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// API Routes
app.use("/api", auth_1.default);
app.use("/api", user_1.default);
// Middleware error handling
app.use(error_1.default);
app.listen(PORT, () => {
    console.log(`Server is listening on port -> ${PORT}`);
});
