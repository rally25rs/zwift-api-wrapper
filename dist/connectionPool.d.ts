import { ConnectionPoolConfiguration } from "./types";
import { ZwiftAPI } from "./zwiftApi";
import { ZwiftPowerAPI } from "./zwiftPowerApi";
export declare class ConnectionPool {
    private _zwiftConnections;
    private _zwiftPowerConnections;
    private _prevZwiftConnection;
    private _prevZwiftPowerConnection;
    constructor(configuration: ConnectionPoolConfiguration);
    getZwiftAPI(): ZwiftAPI;
    getZwiftAPIAndAuthenticate(): Promise<ZwiftAPI>;
    getZwiftPowerAPI(): ZwiftPowerAPI;
    getZwiftPowerAPIAndAuthenticate(): Promise<ZwiftPowerAPI>;
}
