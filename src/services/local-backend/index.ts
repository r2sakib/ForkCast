// services/local-backend/index.ts
// A pretend REST API that runs ON THE PHONE (midterm only: the course midterm is frontend-only).
//
// It is plugged into Axios as an "adapter" (see services/api.ts). An adapter is the part of
// Axios that really sends a request. This one answers from AsyncStorage instead, with the
// SAME URLs, JSON and error codes the real NestJS API will use. So the services, contexts
// and screens do not know the difference, and the final term only has to switch it off.
import {
  AxiosError,
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import {
  canUseCategory,
  CATEGORIES_KEY,
  fail,
  LocalResult,
  nextId,
  ok,
  readCategories,
  readTable,
  StoredCategory,
  writeTable,
} from "./db";

const USERS_KEY = "forkcast_local_users";
const DELAY_MS = 400; // pretend network time, so loading spinners are visible
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A real server would store a password HASH. This is a demo that only lives on your phone.
interface StoredUser {
  id: number;
  name: string;
  email: string;
  password: string;
}

const publicUser = (u: StoredUser) => ({ id: u.id, name: u.name, email: u.email });
const publicCategory = (c: StoredCategory) => ({ id: c.id, name: c.name, isCustom: c.userId !== null });

// The fake token is "local-token-<userId>"
function userIdFromToken(header: unknown): number | null {
  const match = /^Bearer local-token-(\d+)$/.exec(String(header ?? ""));
  return match ? Number(match[1]) : null;
}

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

// ── The routes (same rules as Ayan's mock-api/server.js) ──
async function route(
  method: string,
  path: string,
  body: Record<string, unknown>,
  authHeader: unknown
): Promise<LocalResult> {
  if (method === "get" && path === "/health") return ok(200, { status: "ok" });

  const users = await readTable<StoredUser>(USERS_KEY, []);

  // ── Auth ────────────────────────────────────────────
  if (method === "post" && path === "/auth/register") {
    const name = text(body.name);
    const email = text(body.email);
    const password = typeof body.password === "string" ? body.password : "";
    const problems: string[] = [];
    if (!name) problems.push("name should not be empty");
    if (!EMAIL_PATTERN.test(email)) problems.push("email must be an email");
    if (password.length < 6) problems.push("password must be longer than or equal to 6 characters");
    if (problems.length) return fail(400, problems, "Bad Request");
    if (users.some((u) => u.email === email)) return fail(409, "Email already registered", "Conflict");

    const user: StoredUser = { id: nextId(users), name, email, password };
    await writeTable(USERS_KEY, [...users, user]);
    return ok(201, { token: `local-token-${user.id}`, user: publicUser(user) });
  }

  if (method === "post" && path === "/auth/login") {
    const user = users.find((u) => u.email === text(body.email) && u.password === body.password);
    if (!user) return fail(401, "Invalid email or password", "Unauthorized");
    return ok(200, { token: `local-token-${user.id}`, user: publicUser(user) });
  }

  // Everything below needs a valid token
  const me = users.find((u) => u.id === userIdFromToken(authHeader));
  if (!me) return fail(401, "Unauthorized", "Unauthorized");

  if (method === "get" && path === "/auth/me") return ok(200, publicUser(me));

  // ── Categories ──────────────────────────────────────
  if (path === "/categories" || path.startsWith("/categories/")) {
    const categories = await readCategories();

    if (method === "get" && path === "/categories") {
      return ok(200, categories.filter((c) => canUseCategory(c, me.id)).map(publicCategory));
    }

    if (method === "post" && path === "/categories") {
      const name = text(body.name);
      if (!name) return fail(400, ["name should not be empty"], "Bad Request");
      const taken = categories.some(
        (c) => canUseCategory(c, me.id) && c.name.toLowerCase() === name.toLowerCase()
      );
      if (taken) return fail(409, "Category already exists", "Conflict");
      const category: StoredCategory = { id: nextId(categories), name, userId: me.id };
      await writeTable(CATEGORIES_KEY, [...categories, category]);
      return ok(201, publicCategory(category));
    }

    const match = /^\/categories\/(\d+)$/.exec(path);
    if (method === "delete" && match) {
      const category = categories.find((c) => c.id === Number(match[1]));
      // 404 for missing or other people's categories, 403 for the fixed default ones
      if (!category || !canUseCategory(category, me.id)) {
        return fail(404, "Category not found", "Not Found");
      }
      if (category.userId === null) return fail(403, "Default categories cannot be deleted", "Forbidden");
      await writeTable(CATEGORIES_KEY, categories.filter((c) => c.id !== category.id));
      return ok(204);
    }
  }

  return fail(404, "Not found", "Not Found");
}

// Requests run ONE AT A TIME. Each route reads a table, changes it and writes it back.
// Two requests at the same moment would both read the old table, and the second write
// would erase the first one (a "lost update").
let queue: Promise<unknown> = Promise.resolve();

// The Axios adapter: config in, response out (or an AxiosError, exactly like a real server)
export async function localAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const method = (config.method ?? "get").toLowerCase();
  const path = (config.url ?? "").split("?")[0];
  // Axios has already turned the body into a JSON string
  const body: Record<string, unknown> =
    typeof config.data === "string" && config.data ? JSON.parse(config.data) : (config.data ?? {});

  const run = queue.then(async () => {
    await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    return route(method, path, body, config.headers.Authorization);
  });
  queue = run.catch(() => undefined); // one failed request must not block the next ones
  const result = await run;

  const response: AxiosResponse = {
    data: result.body,
    status: result.status,
    statusText: String(result.status),
    headers: new AxiosHeaders(),
    config,
    request: {},
  };
  if (result.status >= 400) {
    // The same kind of error a real server causes, so getErrorMessage / getStatus / the 401 logout all work
    throw new AxiosError(
      `Request failed with status code ${result.status}`,
      AxiosError.ERR_BAD_REQUEST,
      config,
      {},
      response
    );
  }
  return response;
}
