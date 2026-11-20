// mock-api/server.js
// A tiny fake API for testing the app BEFORE the real NestJS backend is ready.
// No packages needed: run it with   node mock-api/server.js
// It keeps everything in memory, so the data is gone when you stop it.

const http = require("http");

const PORT = 3000;

const DEFAULT_CATEGORIES = [
  "Dairy", "Vegetables", "Fruits", "Meat", "Fish",
  "Eggs", "Rice and Grains", "Bakery", "Other",
];

const users = []; // { id, name, email, password }
let nextUserId = 1;

// Default categories belong to nobody (userId null). Custom ones have the user's id.
const categories = DEFAULT_CATEGORIES.map((name, i) => ({ id: i + 1, name, userId: null }));
let nextCategoryId = categories.length + 1;

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*", // lets the web version (press w) call us too
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  });
  res.end(body === undefined ? undefined : JSON.stringify(body));
}

// Same error shape as NestJS: { statusCode, message, error }
function fail(res, status, message, error) {
  send(res, status, { statusCode: status, message, error });
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { resolve({}); }
    });
  });
}

// The fake token is  "mock-token-<userId>"
function authUser(req) {
  const header = req.headers.authorization || "";
  const match = /^Bearer mock-token-(\d+)$/.exec(header);
  if (!match) return null;
  return users.find((u) => u.id === Number(match[1])) || null;
}

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });
const publicCategory = (c) => ({ id: c.id, name: c.name, isCustom: c.userId !== null });

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204);

  const url = req.url.split("?")[0];
  console.log(req.method, url);

  if (req.method === "GET" && url === "/api/health") return send(res, 200, { status: "ok" });

  // ── Auth ────────────────────────────────────────────
  if (req.method === "POST" && url === "/api/auth/register") {
    const { name, email, password } = await readBody(req);
    const problems = [];
    if (!name || !String(name).trim()) problems.push("name should not be empty");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push("email must be an email");
    if (!password || String(password).length < 6) problems.push("password must be longer than or equal to 6 characters");
    if (problems.length) return fail(res, 400, problems, "Bad Request");
    if (users.some((u) => u.email === email)) return fail(res, 409, "Email already registered", "Conflict");

    const user = { id: nextUserId++, name: String(name).trim(), email, password };
    users.push(user);
    return send(res, 201, { token: `mock-token-${user.id}`, user: publicUser(user) });
  }

  if (req.method === "POST" && url === "/api/auth/login") {
    const { email, password } = await readBody(req);
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) return fail(res, 401, "Invalid email or password", "Unauthorized");
    return send(res, 200, { token: `mock-token-${user.id}`, user: publicUser(user) });
  }

  // Everything below needs a valid token
  const me = authUser(req);
  if (!me) return fail(res, 401, "Unauthorized", "Unauthorized");

  if (req.method === "GET" && url === "/api/auth/me") return send(res, 200, publicUser(me));

  // ── Categories ──────────────────────────────────────
  if (req.method === "GET" && url === "/api/categories") {
    const visible = categories.filter((c) => c.userId === null || c.userId === me.id);
    return send(res, 200, visible.map(publicCategory));
  }

  if (req.method === "POST" && url === "/api/categories") {
    const { name } = await readBody(req);
    const clean = String(name || "").trim();
    if (!clean) return fail(res, 400, ["name should not be empty"], "Bad Request");
    const taken = categories.some(
      (c) => (c.userId === null || c.userId === me.id) && c.name.toLowerCase() === clean.toLowerCase()
    );
    if (taken) return fail(res, 409, "Category already exists", "Conflict");

    const category = { id: nextCategoryId++, name: clean, userId: me.id };
    categories.push(category);
    return send(res, 201, publicCategory(category));
  }

  const deleteMatch = /^\/api\/categories\/(\d+)$/.exec(url);
  if (req.method === "DELETE" && deleteMatch) {
    const index = categories.findIndex((c) => c.id === Number(deleteMatch[1]));
    const category = categories[index];
    // 404 for missing or other people's categories, 403 for the fixed default ones
    if (!category || (category.userId !== null && category.userId !== me.id)) {
      return fail(res, 404, "Category not found", "Not Found");
    }
    if (category.userId === null) return fail(res, 403, "Default categories cannot be deleted", "Forbidden");
    categories.splice(index, 1);
    return send(res, 204);
  }

  return fail(res, 404, "Not found", "Not Found");
});

server.listen(PORT, () => console.log(`Mock API running on http://localhost:${PORT}/api`));
