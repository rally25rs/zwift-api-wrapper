import { describe, expect, test } from "vitest";
import { ConnectionPool } from "./connectionPool";

const eventId = '3859519';

describe("ConnectionPool", () => {
  test("constructor throws if no credentials", () => {
    expect(() => new ConnectionPool({ credentials: [] })).toThrow();
  });

  describe("getZwiftAPI", () => {
    test("returns ZwiftAPI instances round-robin", () => {
      const pool = new ConnectionPool({
        credentials: [{
          username: "user1",
          password: "pass1",
        }, {
          username: "user2",
          password: "pass2",
        }],
      });
      const api1 = pool.getZwiftAPI();
      const api2 = pool.getZwiftAPI();
      const api3 = pool.getZwiftAPI();
      expect(api1).toBeDefined();
      expect(api2).toBeDefined();
      expect(api3).toBeDefined();
      expect(api1).not.toBe(api2);
      expect(api1).toBe(api3);
    });
  });

  describe("getZwiftAPIAndAuthenticate", () => {
    test("does not return a connection if it fails authentication", async () => {
      const pool = new ConnectionPool({
        credentials: [{
          username: process.env.ZWIFT_USER as string,
          password: process.env.ZWIFT_PASS as string,
        }, {
          username: "InVaLiD",
          password: "InVaLiD",
        }],
      });
      const api1 = await pool.getZwiftAPIAndAuthenticate();
      const api2 = await pool.getZwiftAPIAndAuthenticate();
      expect(api1).toBe(api2);
    });

    test("throws if no valid connection found", async () => {
      const pool = new ConnectionPool({
        credentials: [{
          username: "InVaLiD",
          password: "InVaLiD",
        }, {
          username: "InVaLiD",
          password: "InVaLiD",
        }],
      });
      await expect(pool.getZwiftAPIAndAuthenticate()).rejects.toThrow();
    });
  });

  describe("getZwiftPowerAPIAndAuthenticate", () => {
    test("generally works", async () => {
      const pool = new ConnectionPool({
        credentials: [{
          username: process.env.ZWIFT_USER as string,
          password: process.env.ZWIFT_PASS as string,
        }],
      });
      const api = await pool.getZwiftPowerAPIAndAuthenticate();
      const results = await api.getEventResults(eventId);
      expect(results).toBeDefined();
      expect(results.statusCode).toEqual(200);
      expect(results.error).toBeUndefined();
      expect(results.body).toBeDefined();
    });
  });
});
