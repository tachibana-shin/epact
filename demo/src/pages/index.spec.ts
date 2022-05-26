import app from "epact:app";
import request from "supertest";
import { expect, it } from "vitest";

it("GET /", async function (): Promise<void> {
  const res = await request(app).get("/");

  expect(res.body).toEqual({
    message: "Hello express",
  });
});
