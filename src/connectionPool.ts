import { lookup } from "dns";
import { ConnectionPoolConfiguration } from "./types";
import { ZwiftAPI } from "./zwiftApi";
import { ZwiftPowerAPI } from "./zwiftPowerApi";

export class ConnectionPool {
  private _zwiftConnections: Array<ZwiftAPI> = [];
  private _zwiftPowerConnections: Array<ZwiftPowerAPI> = [];
  private _prevZwiftConnection = 0;
  private _prevZwiftPowerConnection = 0;

  constructor(configuration: ConnectionPoolConfiguration) {
    if((configuration?.credentials ?? []).length === 0) {
      throw new Error("No credentials provided");
    }

    configuration.credentials.forEach((creds) => {
      this._zwiftConnections.push(new ZwiftAPI(creds.username, creds.password));
      this._zwiftPowerConnections.push(new ZwiftPowerAPI(creds.username, creds.password));
    });
  }

  getZwiftAPI(): ZwiftAPI {
    this._prevZwiftConnection = (this._prevZwiftConnection + 1) % this._zwiftConnections.length;
    return this._zwiftConnections[this._prevZwiftConnection];
  }

  async getZwiftAPIAndAuthenticate(): Promise<ZwiftAPI> {
    this._prevZwiftConnection = (this._prevZwiftConnection + 1) % this._zwiftConnections.length;
    const startIdx = this._prevZwiftConnection;
    let currIdx = startIdx;
    let connection: ZwiftAPI;

    do {
      try {
        connection = this._zwiftConnections[currIdx];
        await connection.authenticate();
        return connection;
      } catch(e) {
        currIdx = (currIdx + 1) % this._zwiftConnections.length;
      }
    } while(currIdx !== startIdx);

    throw new Error("No valid connection found");
  }

  getZwiftPowerAPI(): ZwiftPowerAPI {
    this._prevZwiftPowerConnection = (this._prevZwiftPowerConnection + 1) % this._zwiftPowerConnections.length;
    return this._zwiftPowerConnections[this._prevZwiftPowerConnection];
  }

  async getZwiftPowerAPIAndAuthenticate(): Promise<ZwiftPowerAPI> {
    this._prevZwiftPowerConnection = (this._prevZwiftPowerConnection + 1) % this._zwiftPowerConnections.length;
    const startIdx = this._prevZwiftPowerConnection;
    let currIdx = startIdx;
    let connection: ZwiftPowerAPI;

    do {
      try {
        connection = this._zwiftPowerConnections[currIdx];
        await connection.authenticate();
        return connection;
      } catch(e) {
        currIdx = (currIdx + 1) % this._zwiftPowerConnections.length;
      }
    } while(currIdx !== startIdx);

    throw new Error("No valid connection found");  }
}
