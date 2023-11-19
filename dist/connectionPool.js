"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionPool = void 0;
const zwiftApi_1 = require("./zwiftApi");
const zwiftPowerApi_1 = require("./zwiftPowerApi");
class ConnectionPool {
    _zwiftConnections = [];
    _zwiftPowerConnections = [];
    _prevZwiftConnection = 0;
    _prevZwiftPowerConnection = 0;
    constructor(configuration) {
        if ((configuration?.credentials ?? []).length === 0) {
            throw new Error("No credentials provided");
        }
        configuration.credentials.forEach((creds) => {
            this._zwiftConnections.push(new zwiftApi_1.ZwiftAPI(creds.username, creds.password));
            this._zwiftPowerConnections.push(new zwiftPowerApi_1.ZwiftPowerAPI(creds.username, creds.password));
        });
    }
    getZwiftAPI() {
        this._prevZwiftConnection = (this._prevZwiftConnection + 1) % this._zwiftConnections.length;
        return this._zwiftConnections[this._prevZwiftConnection];
    }
    async getZwiftAPIAndAuthenticate() {
        this._prevZwiftConnection = (this._prevZwiftConnection + 1) % this._zwiftConnections.length;
        const startIdx = this._prevZwiftConnection;
        let currIdx = startIdx;
        let connection;
        do {
            try {
                connection = this._zwiftConnections[currIdx];
                await connection.authenticate();
                return connection;
            }
            catch (e) {
                currIdx = (currIdx + 1) % this._zwiftConnections.length;
            }
        } while (currIdx !== startIdx);
        throw new Error("No valid connection found");
    }
    getZwiftPowerAPI() {
        this._prevZwiftPowerConnection = (this._prevZwiftPowerConnection + 1) % this._zwiftPowerConnections.length;
        return this._zwiftPowerConnections[this._prevZwiftPowerConnection];
    }
    async getZwiftPowerAPIAndAuthenticate() {
        this._prevZwiftPowerConnection = (this._prevZwiftPowerConnection + 1) % this._zwiftPowerConnections.length;
        const startIdx = this._prevZwiftPowerConnection;
        let currIdx = startIdx;
        let connection;
        do {
            try {
                connection = this._zwiftPowerConnections[currIdx];
                await connection.authenticate();
                return connection;
            }
            catch (e) {
                currIdx = (currIdx + 1) % this._zwiftPowerConnections.length;
            }
        } while (currIdx !== startIdx);
        throw new Error("No valid connection found");
    }
}
exports.ConnectionPool = ConnectionPool;
