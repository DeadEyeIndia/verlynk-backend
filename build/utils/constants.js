"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_COLLECTION = exports.pick = void 0;
function pick(obj, ...props) {
    return props.reduce((result, prop) => {
        result[prop] = obj[prop];
        return result;
    }, {});
}
exports.pick = pick;
exports.USER_COLLECTION = "users";
