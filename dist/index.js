"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionPool = exports.ZwiftPowerAPI = exports.ZwiftAPI = void 0;
__exportStar(require("./types"), exports);
var zwiftApi_1 = require("./zwiftApi");
Object.defineProperty(exports, "ZwiftAPI", { enumerable: true, get: function () { return zwiftApi_1.ZwiftAPI; } });
var zwiftPowerApi_1 = require("./zwiftPowerApi");
Object.defineProperty(exports, "ZwiftPowerAPI", { enumerable: true, get: function () { return zwiftPowerApi_1.ZwiftPowerAPI; } });
var connectionPool_1 = require("./connectionPool");
Object.defineProperty(exports, "ConnectionPool", { enumerable: true, get: function () { return connectionPool_1.ConnectionPool; } });
