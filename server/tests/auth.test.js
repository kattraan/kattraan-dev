/**
 * Authentication module tests: register, login, JWT middleware.
 * Uses in-memory MongoDB (mongodb-memory-server). Run with: npm run test
 */

const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

let mongod;
let app;

// Test user payload (valid for register)
const validUser = {
  userName: "Test User",
  userEmail: "testuser@gmail.com",
  password: "SecurePass@123",
};

// Seed roles required by register
async function seedRoles() {
  const Role = require("../models/Role");
  const existing = await Role.find({});
  if (existing.length > 0) return;
  await Role.insertMany([
    { roleId: new mongoose.Types.ObjectId().toString(), roleName: "learner", description: "Learner role" },
    { roleId: new mongoose.Types.ObjectId().toString(), roleName: "instructor", description: "Instructor role" },
    { roleId: new mongoose.Types.ObjectId().toString(), roleName: "admin", description: "Admin role" },
  ]);
}

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  const connectDB = require("../config/db");
  await connectDB();
  await seedRoles();
  app = require("../app");
}, 30000);

afterAll(async () => {
  if (mongoose.connection.readyState === 1) await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

afterEach(async () => {
  const User = require("../models/User");
  const Blacklist = require("../models/Blacklist");
  await User.deleteMany({});
  await Blacklist.deleteMany({});
});

// ---------- Register ----------
describe("POST /api/auth/register", () => {
  it("should register user successfully and return 201", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(validUser)
      .expect("Content-Type", /json/);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/registered/i);
  });

  it("should return 400 for duplicate email", async () => {
    await request(app).post("/api/auth/register").send(validUser);
    const res = await request(app)
      .post("/api/auth/register")
      .send(validUser)
      .expect("Content-Type", /json/);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already registered|email/i);
  });

  it("should return 400 when missing required fields", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ userName: "Only Name" })
      .expect("Content-Type", /json/);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 for non-Gmail email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, userEmail: "user@yahoo.com" })
      .expect("Content-Type", /json/);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/gmail/i);
  });

  it("should return 400 for weak password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, password: "weak" })
      .expect("Content-Type", /json/);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/password|character|uppercase|lowercase|number|special/i);
  });
});

// ---------- Login ----------
describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(validUser);
  });

  it("should login successfully and return 200 with success", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ userEmail: validUser.userEmail, password: validUser.password })
      .expect("Content-Type", /json/);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/login|success/i);
    // Cookies are set (accessToken, refreshToken)
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes("accessToken") || c.includes("refreshToken"))).toBe(true);
  });

  it("should return 401 for wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ userEmail: validUser.userEmail, password: "WrongPass@1" })
      .expect("Content-Type", /json/);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid|credential/i);
  });

  it("should return 401 for user not found (same message as wrong password)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ userEmail: "nonexistent@gmail.com", password: "SomePass@1" })
      .expect("Content-Type", /json/);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should return 400 when credentials are missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({})
      .expect("Content-Type", /json/);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email|password|required/i);
  });
});

// ---------- JWT verification middleware (protected route: GET /api/auth/check-auth) ----------
describe("JWT verification middleware (GET /api/auth/check-auth)", () => {
  let accessToken;

  beforeEach(async () => {
    await request(app).post("/api/auth/register").send(validUser);
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ userEmail: validUser.userEmail, password: validUser.password });
    const cookies = loginRes.headers["set-cookie"] || [];
    const accessCookie = cookies.find((c) => c.startsWith("accessToken="));
    if (accessCookie) {
      accessToken = accessCookie.split(";")[0].replace("accessToken=", "").trim();
    }
    if (!accessToken) {
      const User = require("../models/User");
      const Role = require("../models/Role");
      const user = await User.findOne({ userEmail: validUser.userEmail.toLowerCase() });
      const rolesData = await Role.find({ roleId: { $in: user.roles } });
      const roleNames = rolesData.map((r) => r.roleName);
      accessToken = jwt.sign(
        { _id: user._id, roles: user.roles, roleNames },
        process.env.JWT_SECRET,
        { expiresIn: "15m", algorithm: "HS256" }
      );
    }
  });

  it("should allow access with valid Bearer token", async () => {
    const res = await request(app)
      .get("/api/auth/check-auth")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect("Content-Type", /json/);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.userEmail).toBe(validUser.userEmail.toLowerCase());
  });

  it("should return 401 when no token is provided", async () => {
    const res = await request(app)
      .get("/api/auth/check-auth")
      .expect("Content-Type", /json/);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not authenticated|authenticated/i);
  });

  it("should return 401 for expired token", async () => {
    const User = require("../models/User");
    const Role = require("../models/Role");
    const user = await User.findOne({ userEmail: validUser.userEmail.toLowerCase() });
    const rolesData = await Role.find({ roleId: { $in: user.roles } });
    const roleNames = rolesData.map((r) => r.roleName);
    const expiredToken = jwt.sign(
      { _id: user._id, roles: user.roles, roleNames },
      process.env.JWT_SECRET,
      { expiresIn: "-1s", algorithm: "HS256" }
    );

    const res = await request(app)
      .get("/api/auth/check-auth")
      .set("Authorization", `Bearer ${expiredToken}`)
      .expect("Content-Type", /json/);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid|expired/i);
  });

  it("should return 401 for tampered token", async () => {
    const tampered = accessToken.slice(0, -5) + "xxxxx";
    const res = await request(app)
      .get("/api/auth/check-auth")
      .set("Authorization", `Bearer ${tampered}`)
      .expect("Content-Type", /json/);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid|expired/i);
  });

  it("should return 401 for token signed with wrong secret", async () => {
    const User = require("../models/User");
    const Role = require("../models/Role");
    const user = await User.findOne({ userEmail: validUser.userEmail.toLowerCase() });
    const rolesData = await Role.find({ roleId: { $in: user.roles } });
    const roleNames = rolesData.map((r) => r.roleName);
    const wrongSecretToken = jwt.sign(
      { _id: user._id, roles: user.roles, roleNames },
      "wrong-secret",
      { expiresIn: "15m", algorithm: "HS256" }
    );

    const res = await request(app)
      .get("/api/auth/check-auth")
      .set("Authorization", `Bearer ${wrongSecretToken}`)
      .expect("Content-Type", /json/);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid|expired/i);
  });

  it("should reject token signed with wrong algorithm (e.g. HS384)", async () => {
    const User = require("../models/User");
    const Role = require("../models/Role");
    const user = await User.findOne({ userEmail: validUser.userEmail.toLowerCase() });
    const rolesData = await Role.find({ roleId: { $in: user.roles } });
    const roleNames = rolesData.map((r) => r.roleName);
    const hs384Token = jwt.sign(
      { _id: user._id, roles: user.roles, roleNames },
      process.env.JWT_SECRET,
      { expiresIn: "15m", algorithm: "HS384" }
    );

    const res = await request(app)
      .get("/api/auth/check-auth")
      .set("Authorization", `Bearer ${hs384Token}`)
      .expect("Content-Type", /json/);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid|expired/i);
  });
});
