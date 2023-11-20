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
    _debug = false;
    constructor(configuration) {
        this._debug = configuration.debug || false;
        if ((configuration?.credentials ?? []).length === 0) {
            throw new Error("No credentials provided");
        }
        configuration.credentials.forEach((creds) => {
            this._zwiftConnections.push(new zwiftApi_1.ZwiftAPI(creds.username, creds.password));
            this._zwiftPowerConnections.push(new zwiftPowerApi_1.ZwiftPowerAPI(creds.username, creds.password));
        });
        if (this._debug) {
            console.log(`ConnectionPool: Constructed ${this._zwiftConnections.length} connections.`);
        }
    }
    getZwiftAPI() {
        this._prevZwiftConnection = (this._prevZwiftConnection + 1) % this._zwiftConnections.length;
        if (this._debug) {
            console.log(`ConnectionPool: getZwiftApi returning connection [${this._prevZwiftConnection}].`);
        }
        return this._zwiftConnections[this._prevZwiftConnection];
    }
    async getZwiftAPIAndAuthenticate() {
        const startIdx = (this._prevZwiftConnection + 1) % this._zwiftConnections.length;
        for (let i = 0; i < this._zwiftConnections.length; i++) {
            const tryIdx = (startIdx + i) % this._zwiftConnections.length;
            const connection = this._zwiftConnections[tryIdx];
            try {
                if (this._debug) {
                    console.log(`ConnectionPool: getZwiftAPIAndAuthenticate trying connection [${tryIdx}].`);
                }
                if (!connection.isAuthenticated()) {
                    await connection.authenticate();
                }
                this._prevZwiftConnection = tryIdx;
                if (this._debug) {
                    console.log(`ConnectionPool: getZwiftAPIAndAuthenticate returning connection [${tryIdx}].`);
                }
                return connection;
            }
            catch (e) {
                // do nothing
            }
        }
        throw new Error("No valid connection found");
    }
    getZwiftPowerAPI() {
        this._prevZwiftPowerConnection = (this._prevZwiftPowerConnection + 1) % this._zwiftPowerConnections.length;
        if (this._debug) {
            console.log(`ConnectionPool: getZwiftPowerApi returning connection [${this._prevZwiftConnection}].`);
        }
        return this._zwiftPowerConnections[this._prevZwiftPowerConnection];
    }
    async getZwiftPowerAPIAndAuthenticate() {
        const startIdx = (this._prevZwiftPowerConnection + 1) % this._zwiftPowerConnections.length;
        for (let i = 0; i < this._zwiftPowerConnections.length; i++) {
            const tryIdx = (startIdx + i) % this._zwiftPowerConnections.length;
            const connection = this._zwiftPowerConnections[tryIdx];
            try {
                if (this._debug) {
                    console.log(`ConnectionPool: getZwiftPowerAPIAndAuthenticate trying connection [${tryIdx}].`);
                }
                if (!connection.isAuthenticated()) {
                    await connection.authenticate();
                }
                this._prevZwiftPowerConnection = tryIdx;
                if (this._debug) {
                    console.log(`ConnectionPool: getZwiftPowerAPIAndAuthenticate returning connection [${tryIdx}].`);
                }
                return connection;
            }
            catch (e) {
                // do nothing
            }
        }
        throw new Error("No valid connection found");
    }
}
exports.ConnectionPool = ConnectionPool;
