# FORKCAST — Member 1 Frontend Guide
**Food items** · Sadman Sakib (23-52382-2) · Mobile App Development (React Native + Expo SDK 54)

This is your step-by-step coding guide. Every Part ends with a **Test** and a **Commit**, so you can push after each one.
Read **`FORKCAST_Member1_Overview.md`** first: it explains the current codebase, what is broken on `main`, and why the design looks like this.

The code style follows your lab manuals and Ayan's code: `StyleSheet`, `FlatList` + `Image` + SearchBar (Week 2), nested `Stack`, `[id].tsx`, `router.push({ pathname, params })`, filter pills, `navigation.setOptions` (Week 3), combined `formData` state + live validation in `useEffect` + `touched` (Week 4), `useReducer` + `useContext` + custom hook (Week 5).

> **How this code was checked.** Everything below was built in a throwaway copy of your repo (`main` at `7270314` + the Part 0 fixes):
> `npx tsc --noEmit` → **0 errors** · `npx expo lint` → **0 errors** · `npx expo export --platform android` → **bundle builds** · the local backend passed **24 checks** through the real Axios client (register, login, 401 auto-logout, categories, every `/foods` rule, 5 requests at once) · the Open Food Facts service ran against the **live API** · the states after Part 0 and Part 8 also compile · every temporary test snippet compiles, and the Test 3 / Test 4 outputs below are real output.
> What could **not** be checked from here: tapping through the screens on your phone. That is the Test step of each Part.

---

## How to use this guide

1. Do the Parts **in order**. Each Part leaves the app working.
2. Paths are relative to the **project root** (the folder with `package.json`). All app code is under **`src/`**, and `@/` means `src/`.
3. **Type, or at least read, every line.** The "Why" notes are your viva answers (CO3 / CO4).
4. After every Part: **Test**, then **Commit**. Commit messages are short on purpose.
5. Some tests add **temporary lines** to `src/app/(tabs)/home.tsx`. Remove them with `git restore "src/app/(tabs)/home.tsx"` **before** you commit.
6. Terminal commands work in Git Bash, PowerShell or the VS Code terminal. You never need to start a server: the data is saved on the phone by the **local backend** (Part 0.6).
7. **Never use `git add .`** in this repo. The `MATERIALS/` folder (your slides, lab manuals and these guides) is untracked and **not** ignored, so `git add .` would push it to the team repo. Every commit below names its files. To hide the folder from git **on your computer only** (nothing shared changes), run once: `echo "MATERIALS/" >> .git/info/exclude`

> **Red underline on `"/food/..."`?** `typedRoutes` is on. A route that does not exist yet is red until its file exists **and** `npx expo start` has run once (it rebuilds the route types). If it stays red: `Ctrl+C`, then `npx expo start` again.

### Files you add or change

```text
.gitignore                          FIX   one clean copy                          (Part 0)
package.json, package-lock.json     FIX   4 missing packages                      (Part 0)
app.json                            FIX   expo-secure-store plugin (automatic)    (Part 0)
src/services/api.ts                 FIX   Ayan's Axios version + local adapter    (Part 0)
src/services/local-backend/db.ts    NEW   tables in AsyncStorage (with Ayan)      (Part 0)
src/services/local-backend/index.ts NEW   adapter, /auth, /categories (with Ayan) (Part 0, +2 lines in Part 3)

src/services/local-backend/foods.ts NEW   /foods endpoints                        (Part 3)
src/types/food.ts                   NEW                                           (Part 1)
src/constants/food.ts               NEW                                           (Part 1)
src/utils/food.ts                   NEW                                           (Part 2)
src/utils/food-validation.ts        NEW                                           (Part 2)
src/utils/open-food-facts.ts        NEW                                           (Part 2)
src/services/foods.ts               NEW                                           (Part 4)
src/services/open-food-facts.ts     NEW                                           (Part 5)
src/context/foods-reducer.ts        NEW                                           (Part 6)
src/context/foods-context.tsx       NEW                                           (Part 6)
src/app/_layout.tsx                 EDIT  FoodsProvider + "food" screen           (Parts 6, 8)
src/components/search-bar.tsx       NEW                                           (Part 7)
src/components/filter-pills.tsx     NEW                                           (Part 7)
src/components/expiry-badge.tsx     NEW                                           (Part 7)
src/components/food-card.tsx        NEW                                           (Part 7)
src/components/product-row.tsx      NEW                                           (Part 7)
src/app/food/_layout.tsx            NEW                                           (Part 8)
src/app/(tabs)/home.tsx             REPLACE the placeholder                       (Part 8)
src/app/food/search.tsx             NEW   Find Product                            (Parts 8, 9)
src/app/food/form.tsx               NEW   Add / Edit Food                         (Parts 8, 10)
src/app/food/[id].tsx               NEW   Food Details                            (Parts 8, 11)
src/app/food/history.tsx            NEW   Waste History                           (Parts 8, 12)
```

### Decisions to agree with your team

| # | Topic | What this guide does | Why |
|---|---|---|---|
| 0 | No backend in the midterm | A **local backend** on the phone (AsyncStorage) behind Axios, with the real API's URLs and errors | Lecture 0: "Midterm: frontend/UI only". It keeps Ayan's idea, fixes his types, and is switched off in the final term with one `.env.local` line. |
| 1 | Where food is saved | Through `/foods`: the local backend now, the NestJS server in the final term. Open Food Facts only **fills the form**. | The proposal: "saved on a server through a REST API". OFF is a public product catalogue, not your database. |
| 2 | Product search UI | A separate **Find Product** screen opens first when the user taps "+", with "Add food by hand instead" one tap away | Search results need a full list; the form stays short. It is also a 5th screen for your report. |
| 3 | Expiry date input | A text field `YYYY-MM-DD` + quick chips (Today, +3 days, +1 week, +1 month, No date) | Same regex-validation idea as the Student ID in Week 4. No extra native package; works in Expo Go and in the browser. |
| 4 | Waste History place | A stack screen `food/history`, opened from the clock icon on Home | The tab bar is shared. Member 3 may need a tab for Statistics. |
| 5 | Delete vs Threw it away | **Delete** = added by mistake (not counted). **Threw it away** = wasted (counted in statistics). | Otherwise the waste statistics would be wrong. |
| 6 | Amount | `quantity` (number) + `unit` (`pcs g kg ml L pack`) | The backend can add up numbers; the OFF text "400.0 g" is turned into 400 + g. |

---

## Part 0 — Fix `main` after the merge (do this with Ayan)

`main` cannot run right now (see the Overview, section 5). These fixes go into **their own small pull request**, so your teammates get a working `main` before your feature work starts.

### 0.1 Tell Ayan first

Send him something like:

> "After merging your branch, `main` does not build on my laptop: `axios`, `expo-secure-store`, AsyncStorage and `expo-linear-gradient` are not in `package.json` (your `.gitignore` ignored `package.json`). Your idea of faking the server on the phone is exactly what we need for the midterm, but the new `api.ts` gives ~20 TypeScript errors, `/auth/me` always returns 'Local User', and there is no `/foods`. I'd like to keep your idea as an Axios **adapter**: restore your Axios `api.ts` from `e581620` and move your user and category rules into `services/local-backend/`. Then `tsc` is clean, your interceptors work, and I can add `/foods`. Can we do it together and can you review the PR?"

### 0.2 Branch

```bash
git checkout main
git pull
git checkout -b fix/after-merge
```

### 0.3 `.gitignore`

The merge pasted the file twice, and the second copy ignores `package.json`, `package-lock.json` and `app.json`. Those three files **must** be in git.

**📄 `.gitignore` — replace the whole file**

```text
# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# dependencies
node_modules/

# Expo
.expo/
dist/
web-build/
expo-env.d.ts
.vscode/

# Native
.kotlin/
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local

# typescript
*.tsbuildinfo

app-example

# generated native folders
/ios
/android
```

```bash
git add .gitignore
git commit -m "Clean up .gitignore after merge"
```

### 0.4 Install the 4 missing packages

```bash
npx expo install axios expo-secure-store @react-native-async-storage/async-storage expo-linear-gradient
```

`npx expo install` picks the versions that match SDK 54. Afterwards `package.json` has these lines (the `axios` number can be newer):

```json
"@react-native-async-storage/async-storage": "2.2.0",
"axios": "^1.21.1",
"expo-linear-gradient": "~15.0.8",
"expo-secure-store": "~15.0.8",
```

It also prints `› Added config plugin: expo-secure-store` and adds `"expo-secure-store"` to the `plugins` list in `app.json`. That is expected.

```bash
git add package.json package-lock.json app.json
git commit -m "Add missing packages"
```

### 0.5 Restore Ayan's Axios client

This brings back the file **exactly as Ayan wrote it** in commit `e581620` ("part 10"), the commit just before the local simulation:

```bash
git restore --source=e581620 -- src/services/api.ts
git add src/services/api.ts
git commit -m "Restore Axios API client"
```

Ayan's types, `getErrorMessage`, `getStatus` and the 401 auto-logout all work again. In 0.6 you add 4 lines to this file.

### 0.6 The local backend (the midterm has no server)

The course midterm is frontend only, so there is no NestJS server yet. Ayan solved that by faking the server on the phone, which is the right idea. But he replaced the whole Axios client, which broke the types and the auto-logout. The fix keeps his idea **one level lower**: the real Axios client stays, and only its **adapter** is replaced.

```text
screen → context → services/*.ts → api (Axios + Ayan's interceptors) → ADAPTER ─┬─ midterm: localAdapter  (answers from AsyncStorage on the phone)
                                                                                 └─ final:   Axios's normal network adapter → NestJS
```

An Axios **adapter** is the part of Axios that really sends the request. Our `localAdapter` answers with the **same URLs, JSON and error codes** as Ayan's `mock-api/server.js` (and as the real API later), so nothing above it can tell the difference.

Three files (`foods.ts` follows in Part 3). Do this part **together with Ayan**, because `/auth` and `/categories` are his endpoints. His rules are copied from his `mock-api/server.js`.

**📄 `src/services/local-backend/db.ts` — create this file**

```ts
// services/local-backend/db.ts
// The "database" of the local backend: tables saved as JSON in AsyncStorage,
// plus the small helpers every route uses.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_CATEGORY_NAMES } from "@/utils/categories";

// What a route answers: an HTTP status and an optional JSON body
export interface LocalResult {
  status: number;
  body?: unknown;
}

export function ok(status: number, body?: unknown): LocalResult {
  return { status, body };
}

// Same error shape as NestJS: { statusCode, message, error }
export function fail(status: number, message: string | string[], error: string): LocalResult {
  return { status, body: { statusCode: status, message, error } };
}

// ── Tables ─────────────────────────────────────────────
// One AsyncStorage key per table. The "forkcast_local_" prefix keeps them apart
// from anything else the app saves.
export async function readTable<T>(key: string, fallback: T[]): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : fallback;
  } catch {
    return fallback; // broken data -> start again from the fallback
  }
}

export async function writeTable<T>(key: string, rows: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(rows));
}

// Like an auto-increment id in a database: biggest id + 1
export function nextId(rows: { id: number }[]): number {
  return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

// ── Categories table (used by the categories AND the foods routes) ──
export const CATEGORIES_KEY = "forkcast_local_categories";

// userId null = one of the 9 default categories, a number = a user's own category
export interface StoredCategory {
  id: number;
  name: string;
  userId: number | null;
}

export async function readCategories(): Promise<StoredCategory[]> {
  const defaults = DEFAULT_CATEGORY_NAMES.map((name, i) => ({ id: i + 1, name, userId: null }));
  return readTable<StoredCategory>(CATEGORIES_KEY, defaults);
}

// A user may use the default categories and their own ones
export function canUseCategory(category: StoredCategory, userId: number): boolean {
  return category.userId === null || category.userId === userId;
}
```

**📄 `src/services/local-backend/index.ts` — create this file**

```ts
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
```

Now switch it on in `api.ts`. Compared with Ayan's file, only 4 things are new: the `localAdapter` import, `API_URL` / `USE_LOCAL_BACKEND`, `baseURL: API_URL || undefined`, and the `adapter:` line.

**📄 `src/services/api.ts` — replace the whole file**

```ts
// services/api.ts
// The one Axios instance for the whole app. Every request goes through it.
import axios from "axios";
import { localAdapter } from "./local-backend";
import { getToken } from "./storage";

// Midterm: no backend yet. When EXPO_PUBLIC_API_URL is NOT set, every request is answered
// on the phone by the local backend (services/local-backend). Final term: put the NestJS
// address in .env.local and the same requests go to the real server. Nothing else changes.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
export const USE_LOCAL_BACKEND = API_URL === "";

export const api = axios.create({
  baseURL: API_URL || undefined,
  timeout: 10000, // give up after 10 seconds
  headers: { "Content-Type": "application/json" },
  // The adapter is the part of Axios that sends the request. undefined = the normal network one.
  adapter: USE_LOCAL_BACKEND ? localAdapter : undefined,
});

// Before EVERY request: read the token and send it as  Authorization: Bearer <token>
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// The auth context registers a function here. We call it when the API says 401
// (token expired or invalid) so the user is logged out and sent to Login.
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const url = error.config?.url ?? "";
      // A 401 from /auth/login only means "wrong password" - not an expired session
      const isLoginCall = url.startsWith("/auth/login");
      if (error.response?.status === 401 && !isLoginCall && unauthorizedHandler) {
        unauthorizedHandler();
      }
    }
    return Promise.reject(error);
  }
);
```

**`.env.local`:** leave it **empty** (it already exists in the project root). No `EXPO_PUBLIC_API_URL` means the local backend is on. In the final term you put the NestJS address there, restart with `npx expo start -c`, and the same app talks to the real server. (Ayan's `mock-api/server.js` still works the same way: `EXPO_PUBLIC_API_URL=http://<laptop-IPv4>:3000/api`.)

> **Why fake the adapter and not the whole `api` object (Ayan's version)?** Everything above the adapter is real code that will also run in the final term: the token interceptor, the 401 auto-logout, `getErrorMessage`, the services, the contexts, the screens. Only the very last step ("send it over the network") is swapped. Faking the whole client meant his typed calls (`api.post<AuthResponse>`) and the 401 handling no longer worked.
>
> **Why throw a real `AxiosError` for 400 / 401 / 404 / 409?** That is exactly what Axios does when a real server answers with an error code. So `getErrorMessage` shows the server's message, `getStatus` returns the code, and Ayan's interceptor logs the user out on 401, all without special cases.
>
> **Why the `queue`?** Every route reads a table, changes it and writes it back. If two requests run at the same time, both read the **old** table, and the second write erases the first one (a "lost update"). Chaining every request onto `queue` makes them run one after another, like a real database handles it with transactions.
>
> **Why `DELAY_MS = 400`?** AsyncStorage answers in a few milliseconds, so you would never see your loading spinners. A small pretend delay lets you test and show the loading state (feature definition ③).
>
> **Is it safe to keep passwords like this?** No, and it does not have to be: it is a demo that only lives on one phone. The real server will store a password **hash**. Say this in the viva before you are asked.
>
> **Where is the data?** In AsyncStorage of the app on that phone (or in the browser's local storage when you press `w`). Every phone / browser has its **own** users and foods. Closing the app keeps the data. Uninstalling Expo Go or clearing its data deletes it.

```bash
git add src/services/local-backend src/services/api.ts
git commit -m "Add local backend for the midterm"
```

### Test 0

```bash
npx expo start -c       # -c rebuilds the cache and the route types
```

Then, in a second terminal:

```bash
npx tsc --noEmit        # must print nothing
npx expo lint           # 0 errors (warnings about "axios also has a named export" are fine)
```

No server to start. Open the app on the phone (or press `w` for the browser) and check Ayan's screens:

| Do | Expected |
|---|---|
| Register "Sadman Sakib", `sadman@example.com`, `secret123` | a short spinner, then the Home placeholder "Hello, Sadman Sakib!" |
| Reload (`r` in the terminal) | still logged in, with **your** name (not "Local User") |
| Settings → Manage categories | the 9 default categories; add "Spices", delete it again; defaults have no delete button |
| Log out, register the same e-mail again | "Email already registered" |
| Log in with a wrong password | "Wrong email or password." |
| Log in correctly | Home again |

> If `tsc` still shows `'"/register"' is not assignable …`: the route types were not rebuilt yet. Run `npx expo start` once, then `tsc` again.

### Push and pull request

```bash
git push -u origin fix/after-merge
```

On GitHub open a pull request **`fix/after-merge` → `main`**, title "Fix build after merge and add local backend", and ask **Ayan to review** it. After it is merged:

```bash
git checkout main
git pull
git checkout -b feature/food-items
```

All the following Parts are on **`feature/food-items`**.

---

## Part 1 — Types and constants

Pure TypeScript, no screens yet.

**📄 `src/types/food.ts` — create this file**

```ts
// types/food.ts
// Shapes of the food data that comes from our REST API (GET /foods ...)
// and from Open Food Facts. Kept in its own file so Member 2's types/index.ts is not touched.

export type StoragePlace = "fridge" | "freezer" | "pantry";
export type FoodStatus = "active" | "used" | "wasted";
export type Unit = "pcs" | "g" | "kg" | "ml" | "L" | "pack";

export interface Food {
  id: number;
  name: string;
  quantity: number;
  unit: Unit;
  storage: StoragePlace;
  categoryId: number;
  expiryDate: string | null; // "YYYY-MM-DD"; null = no date (grey badge)
  status: FoodStatus; // "active" = still in the kitchen
  brand: string | null;
  barcode: string | null;
  imageUrl: string | null; // picture from Open Food Facts
  createdAt: string; // ISO date-time, set by the server
  finishedAt: string | null; // set by the server when marked used / wasted
}

// What the app sends for POST /foods
export interface FoodInput {
  name: string;
  quantity: number;
  unit: Unit;
  storage: StoragePlace;
  categoryId: number;
  expiryDate: string | null;
  brand?: string | null;
  barcode?: string | null;
  imageUrl?: string | null;
}

// What the app sends for PATCH /foods/:id
// Any field can change, or only the status ("Mark as used").
export type FoodUpdate = Partial<FoodInput> & { status?: FoodStatus };

// A product found on Open Food Facts, already cleaned up for our app
export interface OffProduct {
  barcode: string;
  name: string;
  brand: string; // "" when unknown
  quantity: string; // as printed on the package, e.g. "400 g"
  imageUrl: string | null;
  categoryTags: string[]; // e.g. ["en:dairies", "en:milks"]
}
```

**📄 `src/constants/food.ts` — create this file**

```ts
// constants/food.ts
// Fixed lists and colours for the food screens (Member 1).
import { StoragePlace, Unit } from "@/types/food";

export const STORAGE_OPTIONS: { value: StoragePlace; label: string }[] = [
  { value: "fridge", label: "Fridge" },
  { value: "freezer", label: "Freezer" },
  { value: "pantry", label: "Pantry" },
];

export const UNIT_OPTIONS: Unit[] = ["pcs", "g", "kg", "ml", "L", "pack"];

// An item turns orange this many days before it expires.
// Same number as the "2 days before" reminder in the proposal.
export const SOON_DAYS = 2;

// Badge colours: red = expired / today, orange = soon, green = fine, grey = no date
export const EXPIRY_COLOURS = {
  red: { bg: "#FEE2E2", text: "#B91C1C" },
  orange: { bg: "#FFEDD5", text: "#C2410C" },
  green: { bg: "#DCFCE7", text: "#15803D" },
  grey: { bg: "#E2E8F0", text: "#475569" },
};
```

> **Why a new `types/food.ts` instead of adding to `types/index.ts`?** `types/index.ts` is Ayan's file. If you both edit it in different pull requests, git may show a merge conflict. Your own file means no conflict.
>
> **Why is `expiryDate` a string `"YYYY-MM-DD"` and not a `Date`?** JSON has no date type: the API sends text anyway. This format also **sorts correctly as text** (`"2026-11-09" < "2026-11-25"`), so sorting and "is it in the past?" need no conversion. `null` means "no date" (the grey badge from the proposal).
>
> **Why `FoodUpdate = Partial<FoodInput> & { status?: FoodStatus }`?** `PATCH` sends only what changes. `Partial` makes every field optional, so `{ status: "used" }` alone is a valid update, and TypeScript still rejects `{ status: "eaten" }`.
>
> **Why `SOON_DAYS = 2`?** The proposal sends a notification two days before expiry. The badge turns orange at the same moment, so the colour and the reminder agree.

### Test 1

```bash
npx tsc --noEmit        # must print nothing
```

### Commit

```bash
git add src/types/food.ts src/constants/food.ts
git commit -m "Add food types and constants"
```

---

## Part 2 — Helpers (pure functions)

### 2A. Dates, badges and validation

**📄 `src/utils/food.ts` — create this file**

```ts
// utils/food.ts
// Small pure helpers for dates and labels. No React here, so they are easy to test.
import { EXPIRY_COLOURS, SOON_DAYS, STORAGE_OPTIONS } from "@/constants/food";
import { Category } from "@/types";
import { Food, StoragePlace } from "@/types/food";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-11-25" -> Date at LOCAL midnight, or null when the text is not a real date.
// (new Date("2026-11-25") would be UTC midnight, which is the wrong day in some time zones.)
export function parseDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  // new Date(2026, 1, 30) silently becomes 2 March, so check it did not roll over
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

// Date -> "2026-11-25"
export function toDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayString(): string {
  return toDateString(new Date());
}

// Today + n days, as "YYYY-MM-DD" (used by the quick date chips in the form)
export function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

// Whole days from today: 0 = today, 1 = tomorrow, -1 = yesterday, null = no date
export function daysUntil(dateString: string | null): number | null {
  if (!dateString) return null;
  const date = parseDate(dateString);
  const today = parseDate(todayString());
  if (!date || !today) return null;
  return Math.round((date.getTime() - today.getTime()) / MS_PER_DAY);
}

export type ExpiryLevel = "red" | "orange" | "green" | "grey";

export interface ExpiryInfo {
  level: ExpiryLevel;
  label: string;
  colors: { bg: string; text: string };
}

// The badge for one food: colour + text
export function getExpiryInfo(expiryDate: string | null): ExpiryInfo {
  const days = daysUntil(expiryDate);
  if (days === null) {
    return { level: "grey", label: "No date", colors: EXPIRY_COLOURS.grey };
  }
  if (days < 0) {
    const ago = -days;
    return {
      level: "red",
      label: `Expired ${ago} day${ago === 1 ? "" : "s"} ago`,
      colors: EXPIRY_COLOURS.red,
    };
  }
  if (days === 0) {
    return { level: "red", label: "Expires today", colors: EXPIRY_COLOURS.red };
  }
  const label = `${days} day${days === 1 ? "" : "s"} left`;
  if (days <= SOON_DAYS) {
    return { level: "orange", label, colors: EXPIRY_COLOURS.orange };
  }
  return { level: "green", label, colors: EXPIRY_COLOURS.green };
}

// Home order: soonest date first, items without a date last, then A-Z
export function sortByExpiry(foods: Food[]): Food[] {
  return [...foods].sort((a, b) => {
    if (a.expiryDate === b.expiryDate) return a.name.localeCompare(b.name);
    if (a.expiryDate === null) return 1;
    if (b.expiryDate === null) return -1;
    // "YYYY-MM-DD" text sorts in the same order as the dates
    return a.expiryDate.localeCompare(b.expiryDate);
  });
}

export function storageLabel(storage: StoragePlace): string {
  return STORAGE_OPTIONS.find((s) => s.value === storage)?.label ?? storage;
}

export function categoryName(categories: Category[], categoryId: number): string {
  return categories.find((c) => c.id === categoryId)?.name ?? "Other";
}

export function formatQuantity(food: Pick<Food, "quantity" | "unit">): string {
  return `${food.quantity} ${food.unit}`;
}

// "2026-11-25" or an ISO date-time -> "25 Nov 2026"
export function formatDate(value: string | null): string {
  if (!value) return "No date";
  const date = parseDate(value) ?? new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
```

**📄 `src/utils/food-validation.ts` — create this file**

```ts
// utils/food-validation.ts
// Pure validation for the Add / Edit Food form (same idea as validateForm in the Week 4 lab).
import { StoragePlace, Unit } from "@/types/food";
import { parseDate, todayString } from "./food";

// The form's own state. quantity and expiryDate are text while the user types;
// they become a number / null only when the form is sent.
export interface FoodFormData {
  name: string;
  quantity: string;
  unit: Unit;
  storage: StoragePlace;
  categoryId: number | null; // null = nothing chosen yet
  expiryDate: string; // "" = no date
}

export interface FoodFormErrors {
  name?: string;
  quantity?: string;
  categoryId?: string;
  expiryDate?: string;
}

// 2, 0.5, 1.25 (at most 2 decimals)
const QUANTITY_PATTERN = /^\d+(\.\d{1,2})?$/;

// allowPastDate: true in Edit mode (an old item may already be expired)
export function validateFood(data: FoodFormData, allowPastDate: boolean): FoodFormErrors {
  const errors: FoodFormErrors = {};

  const name = data.name.trim();
  if (name.length === 0) {
    errors.name = "Food name is required.";
  } else if (name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  } else if (name.length > 60) {
    errors.name = "Name must be 60 characters or less.";
  }

  const quantity = data.quantity.trim();
  if (quantity.length === 0) {
    errors.quantity = "Quantity is required.";
  } else if (!QUANTITY_PATTERN.test(quantity)) {
    errors.quantity = "Use a number, e.g. 2 or 0.5";
  } else if (Number(quantity) <= 0) {
    errors.quantity = "Quantity must be more than 0.";
  } else if (Number(quantity) > 9999) {
    errors.quantity = "Quantity is too large.";
  }

  if (data.categoryId === null) {
    errors.categoryId = "Choose a category.";
  }

  // The date is optional. When it is given it must be real and (when adding) not in the past.
  const expiry = data.expiryDate.trim();
  if (expiry.length > 0) {
    if (!parseDate(expiry)) {
      errors.expiryDate = "Use the format YYYY-MM-DD, e.g. 2026-11-25";
    } else if (!allowPastDate && expiry < todayString()) {
      errors.expiryDate = "This date is already in the past.";
    }
  }

  return errors;
}
```

> **Why not `new Date("2026-11-25")`?** A date-only text is read as **UTC midnight**. In some time zones that is still the day before, so a badge could say "1 day left" on the wrong day. `parseDate` builds the date from its parts at **local** midnight.
>
> **Why the "rolled over" check?** `new Date(2026, 1, 30)` does not fail: JavaScript silently makes it 2 March. Comparing the year, month and day back catches `2026-02-30`.
>
> **Why `Math.round` in `daysUntil`?** Both dates are at midnight, so the difference is a whole number of days. `round` protects against a 23- or 25-hour day in countries with daylight saving.
>
> **Why `validateFood(data, allowPastDate)`?** Adding food that already expired is almost always a typing mistake, so Add blocks it. In Edit mode the item may really be expired now, so it must still be saveable.
>
> **Why is `quantity` a string in the form?** While typing, `"0."` or `""` are normal states but not numbers. The form keeps the text, validates it with a regex (like the Student ID in Week 4), and turns it into a number only on Save.

### 2B. Open Food Facts mapping

**📄 `src/utils/open-food-facts.ts` — create this file**

```ts
// utils/open-food-facts.ts
// Pure helpers that turn Open Food Facts data into values for our form.
import { Unit } from "@/types/food";

// Units written on packages -> our units. Anything else ("oz", "Quart") is counted as 1 pack.
const UNIT_MAP: Record<string, Unit> = {
  g: "g",
  gr: "g",
  kg: "kg",
  ml: "ml",
  l: "L",
  lt: "L",
  pc: "pcs",
  pcs: "pcs",
};

// "400.0 g" -> 400 g   |   "1l" -> 1 L   |   "6" -> 6 pcs   |   "1 Quart" -> 1 pack
export function parseOffQuantity(text: string): { quantity: string; unit: Unit } {
  const match = /^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]*)/.exec(text.trim());
  if (!match) return { quantity: "1", unit: "pcs" };

  const amount = Math.round(Number(match[1].replace(",", ".")) * 100) / 100;
  const unitText = match[2].toLowerCase();

  if (unitText === "") return { quantity: String(amount), unit: "pcs" };
  const unit = UNIT_MAP[unitText];
  if (!unit) return { quantity: "1", unit: "pack" };
  return { quantity: String(amount), unit };
}

// Open Food Facts category tags -> one of our 9 default category names.
// The order matters: "Eggs" is checked before "Dairy", "Bakery" before "Rice and Grains".
const CATEGORY_RULES: { name: string; tags: string[] }[] = [
  { name: "Eggs", tags: ["en:eggs"] },
  { name: "Dairy", tags: ["en:dairies", "en:milks", "en:cheeses", "en:yogurts", "en:butters"] },
  { name: "Fish", tags: ["en:fishes", "en:seafood"] },
  { name: "Meat", tags: ["en:meats", "en:poultries", "en:sausages"] },
  { name: "Bakery", tags: ["en:breads", "en:biscuits-and-cakes", "en:pastries", "en:viennoiseries"] },
  { name: "Rice and Grains", tags: ["en:rices", "en:cereal-grains", "en:pastas", "en:cereals-and-their-products"] },
  { name: "Fruits", tags: ["en:fruits", "en:fruits-based-foods"] },
  { name: "Vegetables", tags: ["en:vegetables", "en:vegetables-based-foods"] },
];

export function guessCategoryName(tags: string[]): string {
  const rule = CATEGORY_RULES.find((r) => r.tags.some((tag) => tags.includes(tag)));
  return rule?.name ?? "Other";
}
```

> **Why is this a separate file from the service?** These are **pure** functions (text in, value out, no network). You can test them in the console without the internet. The service in Part 5 only talks to the network.
>
> **Why does the rule order matter?** A product can have several tags. Eggs are listed under farming products, and chocolate milk under both beverages and dairies. The first matching rule wins, so the more specific rules come first.

### Test 2

Add these lines **under the imports** of `src/app/(tabs)/home.tsx` (temporary):

```ts
import { addDays, daysUntil, getExpiryInfo, parseDate } from "@/utils/food";
import { validateFood } from "@/utils/food-validation";
import { guessCategoryName, parseOffQuantity } from "@/utils/open-food-facts";

console.log("D1", parseDate("2026-02-30"), parseDate("2026-13-01"), parseDate("2026-11-25") !== null);
console.log("D2", daysUntil(addDays(0)), daysUntil(addDays(3)), daysUntil(addDays(-2)), daysUntil(null));
console.log("E1", [-1, 0, 2, 3].map((d) => getExpiryInfo(addDays(d)).label), getExpiryInfo(null).label);
console.log("V1", validateFood({ name: "M", quantity: "abc", unit: "pcs", storage: "fridge", categoryId: null, expiryDate: "2026-02-30" }, false));
console.log("V2", validateFood({ name: "Milk", quantity: "2", unit: "L", storage: "fridge", categoryId: 1, expiryDate: addDays(5) }, false));
console.log("V3", validateFood({ name: "Milk", quantity: "0", unit: "L", storage: "fridge", categoryId: 1, expiryDate: addDays(-1) }, false));
console.log("Q1", parseOffQuantity("400.0 g"), parseOffQuantity("1l"), parseOffQuantity("6"), parseOffQuantity("1 Quart"));
console.log("C1", guessCategoryName(["en:dairies", "en:milks"]), guessCategoryName(["en:farming-products", "en:eggs"]), guessCategoryName(["en:spreads"]));
```

Run `npx expo start`, open the app, and read the terminal. You must see (the layout of objects may differ a little):

```text
D1 null null true
D2 0 3 -2 null
E1 [ 'Expired 1 day ago', 'Expires today', '2 days left', '3 days left' ] No date
V1 { name: 'Name must be at least 2 characters.',
     quantity: 'Use a number, e.g. 2 or 0.5',
     categoryId: 'Choose a category.',
     expiryDate: 'Use the format YYYY-MM-DD, e.g. 2026-11-25' }
V2 {}
V3 { quantity: 'Quantity must be more than 0.', expiryDate: 'This date is already in the past.' }
Q1 { quantity: '400', unit: 'g' } { quantity: '1', unit: 'L' } { quantity: '6', unit: 'pcs' } { quantity: '1', unit: 'pack' }
C1 Dairy Eggs Other
```

Remove the lines, then commit (two commits):

```bash
git restore "src/app/(tabs)/home.tsx"
git add src/utils/food.ts src/utils/food-validation.ts
git commit -m "Add food date and validation helpers"
git add src/utils/open-food-facts.ts
git commit -m "Add Open Food Facts mapping helpers"
```

---

## Part 3 — `/foods` in the local backend

Ayan's `/auth` and `/categories` live in `local-backend/index.ts`. You add yours in **your own file** and plug it in with 2 lines.

**📄 `src/services/local-backend/foods.ts` — create this file**

```ts
// services/local-backend/foods.ts  -  Member 1 (food items)
// The /foods endpoints of the local backend. They follow the same rules the
// real NestJS API must follow (see the API contract in the Overview).
import { STORAGE_OPTIONS, UNIT_OPTIONS } from "@/constants/food";
import { Food, FoodStatus, StoragePlace, Unit } from "@/types/food";
import { canUseCategory, fail, LocalResult, nextId, ok, readCategories, readTable, writeTable } from "./db";

const FOODS_KEY = "forkcast_local_foods";
const STORAGES = STORAGE_OPTIONS.map((s) => s.value);
const STATUSES: FoodStatus[] = ["active", "used", "wasted"];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Every stored food remembers its owner. The app never receives userId.
interface StoredFood extends Food {
  userId: number;
}

function publicFood(stored: StoredFood): Food {
  const { userId, ...food } = stored;
  return food;
}

// Returns a list of problems, like NestJS ValidationPipe.
// partial = true for PATCH: only the fields that were sent are checked.
function checkFood(
  body: Record<string, unknown>,
  partial: boolean,
  categoryIsUsable: (id: unknown) => boolean
): string[] {
  const problems: string[] = [];
  const sent = (key: string) => body[key] !== undefined;

  if (!partial || sent("name")) {
    if (typeof body.name !== "string" || !body.name.trim()) problems.push("name should not be empty");
  }
  if (!partial || sent("quantity")) {
    if (typeof body.quantity !== "number" || !(body.quantity > 0)) {
      problems.push("quantity must be a positive number");
    }
  }
  if (!partial || sent("unit")) {
    if (!UNIT_OPTIONS.includes(body.unit as Unit)) problems.push(`unit must be one of: ${UNIT_OPTIONS.join(", ")}`);
  }
  if (!partial || sent("storage")) {
    if (!STORAGES.includes(body.storage as StoragePlace)) {
      problems.push(`storage must be one of: ${STORAGES.join(", ")}`);
    }
  }
  if (!partial || sent("categoryId")) {
    if (!categoryIsUsable(body.categoryId)) problems.push("categoryId must be one of your categories");
  }
  if (sent("expiryDate") && body.expiryDate !== null) {
    if (typeof body.expiryDate !== "string" || !DATE_PATTERN.test(body.expiryDate)) {
      problems.push("expiryDate must be YYYY-MM-DD or null");
    }
  }
  if (sent("status") && !STATUSES.includes(body.status as FoodStatus)) {
    problems.push(`status must be one of: ${STATUSES.join(", ")}`);
  }
  return problems;
}

const optionalText = (value: unknown) => (typeof value === "string" && value ? value : null);

// Returns null when the path is not /foods, so index.ts can try other routes
export async function handleFoods(
  method: string,
  path: string,
  body: Record<string, unknown>,
  userId: number
): Promise<LocalResult | null> {
  if (path !== "/foods" && !path.startsWith("/foods/")) return null;

  const foods = await readTable<StoredFood>(FOODS_KEY, []);
  const categories = await readCategories();
  const categoryIsUsable = (id: unknown) =>
    categories.some((c) => c.id === id && canUseCategory(c, userId));

  // GET /foods -> all of this user's foods (active, used and wasted), newest first
  if (method === "get" && path === "/foods") {
    const mine = foods.filter((f) => f.userId === userId).reverse();
    return ok(200, mine.map(publicFood));
  }

  // POST /foods -> create
  if (method === "post" && path === "/foods") {
    const problems = checkFood(body, false, categoryIsUsable);
    if (problems.length) return fail(400, problems, "Bad Request");
    const food: StoredFood = {
      id: nextId(foods),
      userId,
      name: String(body.name).trim(),
      quantity: body.quantity as number,
      unit: body.unit as Unit,
      storage: body.storage as StoragePlace,
      categoryId: body.categoryId as number,
      expiryDate: (body.expiryDate as string | null | undefined) ?? null,
      status: "active",
      brand: optionalText(body.brand),
      barcode: optionalText(body.barcode),
      imageUrl: optionalText(body.imageUrl),
      createdAt: new Date().toISOString(),
      finishedAt: null,
    };
    await writeTable(FOODS_KEY, [...foods, food]);
    return ok(201, publicFood(food));
  }

  // Everything below works on one food: /foods/:id
  const match = /^\/foods\/(\d+)$/.exec(path);
  const food = match ? foods.find((f) => f.id === Number(match[1]) && f.userId === userId) : undefined;
  // Missing, or it belongs to somebody else: both are 404
  if (!food) return fail(404, "Food not found", "Not Found");

  if (method === "get") return ok(200, publicFood(food));

  if (method === "patch") {
    const problems = checkFood(body, true, categoryIsUsable);
    if (problems.length) return fail(400, problems, "Bad Request");
    const updated: StoredFood = { ...food };
    if (body.name !== undefined) updated.name = String(body.name).trim();
    if (body.quantity !== undefined) updated.quantity = body.quantity as number;
    if (body.unit !== undefined) updated.unit = body.unit as Unit;
    if (body.storage !== undefined) updated.storage = body.storage as StoragePlace;
    if (body.categoryId !== undefined) updated.categoryId = body.categoryId as number;
    if (body.expiryDate !== undefined) updated.expiryDate = body.expiryDate as string | null;
    if (body.brand !== undefined) updated.brand = optionalText(body.brand);
    if (body.barcode !== undefined) updated.barcode = optionalText(body.barcode);
    if (body.imageUrl !== undefined) updated.imageUrl = optionalText(body.imageUrl);
    if (body.status !== undefined) {
      updated.status = body.status as FoodStatus;
      // The server, not the phone, decides when the food was finished
      updated.finishedAt = updated.status === "active" ? null : new Date().toISOString();
    }
    await writeTable(FOODS_KEY, foods.map((f) => (f.id === food.id ? updated : f)));
    return ok(200, publicFood(updated));
  }

  if (method === "delete") {
    await writeTable(FOODS_KEY, foods.filter((f) => f.id !== food.id));
    return ok(204);
  }

  return fail(405, "Method not allowed", "Method Not Allowed");
}
```

**📄 `src/services/local-backend/index.ts` — 2 small edits**

1. Under the `import { … } from "./db";` block, add:

```ts
import { handleFoods } from "./foods"; // Member 1: /foods endpoints
```

2. In `route(...)`, directly **above** its last line `return fail(404, "Not found", "Not Found");`, add:

```ts
  // ── Foods (Member 1) ────────────────────────────────
  const foodsResult = await handleFoods(method, path, body, me.id);
  if (foodsResult) return foodsResult;
```

It must be **below** `if (!me) return fail(401, …)` (so only logged-in users reach it) and **above** the final 404.

> **Why does `handleFoods` return `null` for other paths?** `index.ts` asks each part "is this yours?". `null` means "not mine, try the next one", and in the end the request falls through to 404. Member 3 can add `/notifications` the same way: a new file + 2 lines.
>
> **Why `StoredFood extends Food` with a `userId`, and `publicFood`?** The "database row" must know its owner. The app's `Food` type has no owner, so `publicFood` removes `userId` before answering, like a real API hides internal columns.
>
> **Why 404 (not 403) for someone else's food?** A 403 would tell an attacker "this id exists". 404 says nothing. Ayan's categories do the same.
>
> **Why does the backend set `finishedAt`, not the screen?** The server decides when something happened. The app only sends `{ status: "used" }`.
>
> **Why `UNIT_OPTIONS` and `STORAGE_OPTIONS` from `constants/food.ts`?** The form's pills and the backend's checks use the **same** lists, so they can never disagree.
>
> **Why check everything again when the form already validates?** A server must never trust the client (in the final term anyone can send requests with any tool). The form's checks are for a friendly UX; the backend's checks protect the data.

### Test 3

Logged in in the app. Add **temporarily** to `src/app/(tabs)/home.tsx`: the imports at the top, the `useEffect` inside `HomeScreen`.

```ts
import { useEffect } from "react";
import { api } from "@/services/api";
import { getErrorMessage, getStatus } from "@/utils/errors";

// inside HomeScreen:
useEffect(() => {
  async function test() {
    const created = await api.post("/foods", { name: "Milk", quantity: 1, unit: "L", storage: "fridge", categoryId: 1, expiryDate: "2026-11-20" });
    console.log("L1", created.status, created.data.name, created.data.status);
    try {
      await api.post("/foods", { name: "", quantity: 0, unit: "cups", storage: "roof", categoryId: 99 });
    } catch (e) {
      console.log("L2", getStatus(e), getErrorMessage(e).split("\n").length, "problems");
    }
    const wasted = await api.patch(`/foods/${created.data.id}`, { status: "wasted" });
    console.log("L3", wasted.data.status, wasted.data.finishedAt !== null);
    const removed = await api.delete(`/foods/${created.data.id}`);
    console.log("L4", removed.status);
    try {
      await api.get(`/foods/${created.data.id}`);
    } catch (e) {
      console.log("L5", getStatus(e));
    }
  }
  test().catch((e) => console.log("test failed:", e.message));
}, []);
```

Expected in the terminal:

```text
L1 201 Milk active
L2 400 5 problems
L3 wasted true
L4 204
L5 404
```

| Line | It proves |
|---|---|
| L1 | `POST /foods` creates an active food (201) |
| L2 | bad data is refused with 400 and a list of 5 messages, like NestJS |
| L3 | `PATCH` changes the status and the backend sets `finishedAt` |
| L4 / L5 | `DELETE` answers 204; afterwards the food is 404 |

`test failed: Request failed with status code 404` on L1 → the 2 lines in `index.ts` are missing or below the final 404.

```bash
git restore "src/app/(tabs)/home.tsx"
git add src/services/local-backend
git commit -m "Add /foods to the local backend"
```

---

## Part 4 — Foods service

One function per endpoint. Screens never call Axios directly (same rule as Ayan's `services/categories.ts`).

**📄 `src/services/foods.ts` — create this file**

```ts
// services/foods.ts
// One function per endpoint (Member 1):
// GET /foods, POST /foods, GET /foods/:id, PATCH /foods/:id, DELETE /foods/:id
// The login token is added automatically by the interceptor in services/api.ts.
import { Food, FoodInput, FoodUpdate } from "@/types/food";
import { api } from "./api";

export async function fetchFoods(): Promise<Food[]> {
  const response = await api.get<Food[]>("/foods");
  return response.data;
}

export async function fetchFood(id: number): Promise<Food> {
  const response = await api.get<Food>(`/foods/${id}`);
  return response.data;
}

export async function createFood(input: FoodInput): Promise<Food> {
  const response = await api.post<Food>("/foods", input);
  return response.data;
}

export async function updateFood(id: number, changes: FoodUpdate): Promise<Food> {
  const response = await api.patch<Food>(`/foods/${id}`, changes);
  return response.data;
}

export async function deleteFood(id: number): Promise<void> {
  await api.delete(`/foods/${id}`);
}
```

> **Why `api.get<Food[]>(...)`?** The `<Food[]>` tells TypeScript what `response.data` is, so every screen gets autocomplete and type checks. TypeScript cannot check what the server **really** sends; that is what the API contract is for.
>
> **Why PATCH and not PUT?** PUT means "replace the whole object". PATCH means "change these fields". "Mark as used" changes one field.

### Test 4

Logged in in the app. Add this **temporarily** to `src/app/(tabs)/home.tsx`: the imports at the top, the `useEffect` inside `HomeScreen`.

```ts
import { useEffect } from "react";
import { createFood, deleteFood, fetchFood, fetchFoods, updateFood } from "@/services/foods";
import { getStatus } from "@/utils/errors";

// inside HomeScreen:
useEffect(() => {
  async function test() {
    const created = await createFood({ name: "Milk", quantity: 1, unit: "L", storage: "fridge", categoryId: 1, expiryDate: null });
    console.log("F1 created:", created.name, created.status);
    console.log("F2 list:", (await fetchFoods()).length);
    const used = await updateFood(created.id, { status: "used" });
    console.log("F3 status:", used.status, used.finishedAt !== null);
    console.log("F4 one:", (await fetchFood(created.id)).name);
    await deleteFood(created.id);
    try {
      await fetchFood(created.id);
    } catch (e) {
      console.log("F5 after delete:", getStatus(e));
    }
  }
  test().catch((e) => console.log("test failed:", e.message));
}, []);
```

Expected (F2 can be bigger if you kept foods from Part 3):

```text
F1 created: Milk active
F2 list: 1
F3 status: used true
F4 one: Milk
F5 after delete: 404
```

`test failed: Request failed with status code 404` → the 2 lines of Part 3 in `local-backend/index.ts` are missing. `… status code 401` → you are not logged in.

```bash
git restore "src/app/(tabs)/home.tsx"
git add src/services/foods.ts
git commit -m "Add foods service"
```

---

## Part 5 — Open Food Facts API

This Part is the full guideline for the external API.

### 5.1 What it is, and what ForkCast uses it for

[Open Food Facts](https://openfoodfacts.github.io/openfoodfacts-server/api/) is a free, open database of food products, filled in by volunteers. ForkCast uses it **only to fill the Add Food form**: name, brand, quantity, unit, category guess and a picture. The user's food list is still stored on your server.

### 5.2 Try it in the browser first

Paste these into a browser. Seeing the raw JSON makes the code easy to understand.

**Barcode lookup** (product API v2):

```text
https://world.openfoodfacts.org/api/v2/product/3017624010701?fields=code,product_name,brands,quantity,image_front_small_url,categories_tags
```

Real answer (shortened):

```json
{
  "code": "3017624010701",
  "product": {
    "brands": "Ferrero",
    "categories_tags": ["en:breakfasts", "en:spreads", "en:sweet-spreads", "en:hazelnut-spreads"],
    "code": "3017624010701",
    "image_front_small_url": "https://images.openfoodfacts.org/images/products/301/762/401/0701/front_en.100.200.jpg",
    "product_name": "Nutella",
    "quantity": "400.0 g"
  },
  "status": 1,
  "status_verbose": "product found"
}
```

An unknown or invalid barcode answers `{"code":"00000017","status":0,"status_verbose":"no code or invalid code"}`. Note `status: 0`: it is **not** an HTTP error, so the code checks `status`. Some unknown barcodes answer HTTP **404** instead; the code treats both as "not found".

**Search by name** ("search-a-licious", the Open Food Facts search service):

```text
https://search.openfoodfacts.org/search?q=milk&page_size=3&langs=en&fields=code,product_name,brands,quantity,image_front_small_url,categories_tags
```

Real answer (shortened):

```json
{
  "hits": [
    {
      "code": "5000316000256",
      "brands": ["Moo Milk"],
      "quantity": "1l",
      "categories_tags": ["en:beverages", "en:dairies", "en:milks", "en:chocolate-milks"],
      "product_name": "Moo Milk chocolate flavoured",
      "image_front_small_url": "https://images.openfoodfacts.org/images/products/500/031/600/0256/front_en.21.200.jpg"
    }
  ],
  "page": 1,
  "page_size": 3,
  "count": 10000
}
```

Look closely: here **`brands` is a list** (`["Moo Milk"]`), while the barcode API sends **text** (`"Ferrero"`). The code handles both.

> **Why not `/cgi/search.pl` or `/api/v2/search`?** The old `cgi/search.pl` full-text search answered **HTTP 503** when tested. `/api/v2/search` only filters by tags (category, nutrition grade) and cannot search by a typed name. The OFF documentation points to search-a-licious for full-text search.

### 5.3 The rules (from the official docs)

| Rule | What the docs say | What the code does |
|---|---|---|
| Authentication | Reading needs no account and no API key | nothing to set up |
| User-Agent | "always use a custom User-Agent … in the form of `AppName/Version (ContactEmail)`" | sends `ForkCast/1.0 (…)` from the phone. **Put your team's e-mail in `USER_AGENT`.** Browsers do not allow this header, so on web it is not sent. |
| Rate limits | **15 req/min** per IP for product reads, **10 req/min** per IP for searches. Do not use search for search-as-you-type. | searches only when **Search** is pressed; caches results in memory; shows "busy, wait a minute" on HTTP 429 / 503 |
| Licence | Data: Open Database License (ODbL). Images: Creative Commons BY-SA | "Product data from Open Food Facts" under the results |
| Staging server | `world.openfoodfacts.net` (login `off` / `off`) is for testing **writes** | not needed: ForkCast only reads |
| Browser (CORS) | — (tested) the product API allows browser calls; `search.openfoodfacts.org` does **not** for `localhost` | test name search **on the phone**. In the browser it shows "Cannot reach Open Food Facts". |

### 5.4 The service

**📄 `src/services/open-food-facts.ts` — create this file**

```ts
// services/open-food-facts.ts
// Talks to the public Open Food Facts API: https://openfoodfacts.github.io/openfoodfacts-server/api/
//
// This is a SEPARATE Axios instance from services/api.ts on purpose:
// api.ts adds our login token to every request, and that token must never
// be sent to a third-party server.
import axios from "axios";
import { Platform } from "react-native";
import { OffProduct } from "@/types/food";

// Open Food Facts asks every app to say who it is:  AppName/Version (contact e-mail)
// TODO: replace the e-mail with your team's real contact address.
const USER_AGENT = "ForkCast/1.0 (forkcast.team@example.com)";

// Ask only for the fields we show. A smaller answer is faster on mobile data.
const FIELDS = "code,product_name,brands,quantity,image_front_small_url,categories_tags";

// Browsers do not allow a custom User-Agent header, so we only send it on the phone
const headers: Record<string, string> = Platform.OS === "web" ? {} : { "User-Agent": USER_AGENT };

// 1) Barcode lookup: one product by its barcode
const productApi = axios.create({
  baseURL: "https://world.openfoodfacts.org/api/v2",
  timeout: 15000,
  headers,
});

// 2) Search by name: "search-a-licious", the Open Food Facts search service
const searchApi = axios.create({
  baseURL: "https://search.openfoodfacts.org",
  timeout: 15000,
  headers,
});

// The raw shape Open Food Facts sends. Every field can be missing, and
// "brands" is a text in the product API but a list in the search API.
interface OffRawProduct {
  code?: string;
  product_name?: string;
  brands?: string | string[];
  quantity?: string;
  image_front_small_url?: string;
  categories_tags?: string[];
}

interface OffProductResponse {
  code: string;
  status: number; // 1 = found, 0 = not found
  status_verbose: string;
  product?: OffRawProduct;
}

interface OffSearchResponse {
  hits: OffRawProduct[];
  count: number;
  page: number;
  page_size: number;
}

// Raw product -> our clean OffProduct. Products without a name are skipped (null).
function toOffProduct(raw: OffRawProduct): OffProduct | null {
  const name = raw.product_name?.trim();
  if (!raw.code || !name) return null;
  const brand = Array.isArray(raw.brands) ? raw.brands.join(", ") : (raw.brands ?? "");
  return {
    barcode: raw.code,
    name,
    brand: brand.trim(),
    quantity: raw.quantity?.trim() ?? "",
    imageUrl: raw.image_front_small_url ?? null,
    categoryTags: raw.categories_tags ?? [],
  };
}

// 8 to 14 digits = a barcode number (EAN-8, UPC-A, EAN-13 ...)
export function isBarcode(text: string): boolean {
  return /^\d{8,14}$/.test(text.trim());
}

// GET https://world.openfoodfacts.org/api/v2/product/{barcode}?fields=...
// Returns null when Open Food Facts does not know the barcode.
export async function getProductByBarcode(barcode: string): Promise<OffProduct | null> {
  try {
    const response = await productApi.get<OffProductResponse>(`/product/${barcode.trim()}`, {
      params: { fields: FIELDS },
    });
    if (response.data.status !== 1 || !response.data.product) return null;
    return toOffProduct({ code: response.data.code, ...response.data.product });
  } catch (error) {
    // An unknown barcode can also come back as HTTP 404: that is "not found", not a failure
    if (axios.isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}

// Results are kept in memory, so searching "milk" twice costs only one request.
// (Open Food Facts allows only 10 searches per minute.)
const searchCache = new Map<string, OffProduct[]>();

// GET https://search.openfoodfacts.org/search?q=milk&page_size=20&langs=en&fields=...
export async function searchProducts(query: string): Promise<OffProduct[]> {
  const key = query.trim().toLowerCase();
  const cached = searchCache.get(key);
  if (cached) return cached;

  const response = await searchApi.get<OffSearchResponse>("/search", {
    params: { q: key, page_size: 20, langs: "en", fields: FIELDS },
  });
  const products = response.data.hits
    .map(toOffProduct)
    .filter((product): product is OffProduct => product !== null);

  searchCache.set(key, products);
  return products;
}

// One readable sentence for the screen
export function getOffErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Cannot reach Open Food Facts. Check your internet connection.";
    }
    if (error.response.status === 429 || error.response.status === 503) {
      return "Open Food Facts is busy right now. Wait a minute and try again.";
    }
  }
  return "The product search failed. You can still add the food by hand.";
}
```

> **Why a second Axios instance and not Ayan's `api`?** `api` has an interceptor that adds `Authorization: Bearer <your token>` to **every** request. Sending your login token to a third-party server would be a security leak. A separate instance has no interceptor and its own `baseURL`.
>
> **Why `params: { q: key, … }` instead of building the URL by hand?** Axios encodes the values. A search like `rice & dal` would break a hand-made URL (`&` starts a new parameter). With `params` it is sent correctly as `rice%20%26%20dal`.
>
> **Why the `Map` cache?** 10 searches per minute is not much. A user often searches the same word again (after going back, or after a typo). The second time costs no request and is instant.
>
> **What is `(product): product is OffProduct => product !== null`?** A **type guard**. `.map(toOffProduct)` gives `(OffProduct | null)[]`; a normal `filter` would still be typed with `| null`. The `is` tells TypeScript that after this filter, only `OffProduct` is left.
>
> **Why `fields=…`?** A full OFF product has hundreds of fields (ingredients, nutrients …). Asking only for 6 makes the answer about 50× smaller, which matters on mobile data.

### 5.5 How OFF data becomes form values

| Open Food Facts | Example | In the form |
|---|---|---|
| `product_name` | `Nutella` | Food name |
| `brands` | `Ferrero` / `["Moo Milk"]` | shown on the product card, saved as `brand` |
| `quantity` | `400.0 g` → `parseOffQuantity` | Quantity `400`, Unit `g` |
| `categories_tags` | `["en:dairies", …]` → `guessCategoryName` | Category pill "Dairy" pre-selected |
| `image_front_small_url` | `https://images.openfoodfacts.org/…200.jpg` | picture on the card, saved as `imageUrl` |
| `code` | `3017624010701` | saved as `barcode` |

### Test 5 (on the phone, not in the browser)

Add **temporarily** to `src/app/(tabs)/home.tsx`:

```ts
import { useEffect } from "react";
import { getProductByBarcode, searchProducts } from "@/services/open-food-facts";

// inside HomeScreen:
useEffect(() => {
  async function test() {
    const nutella = await getProductByBarcode("3017624010701");
    console.log("O1", nutella?.name, "|", nutella?.brand, "|", nutella?.quantity);
    console.log("O2", await getProductByBarcode("0000000000017"));
    const eggs = await searchProducts("eggs");
    console.log("O3", eggs.length, eggs[0]?.name);
  }
  test().catch((e) => console.log("OFF test failed:", e.message));
}, []);
```

Expected (O3's first name can change, OFF data changes every day):

```text
O1 Nutella | Ferrero | 400.0 g
O2 null
O3 20 Organic free range eggs
```

```bash
git restore "src/app/(tabs)/home.tsx"
git add src/services/open-food-facts.ts
git commit -m "Add Open Food Facts service"
```

---

## Part 6 — State: foods reducer and context

Same pattern as Week 5 and Ayan's `categories-*`: a pure reducer + a context with a provider and a guarded custom hook.

### 6A. Reducer

**📄 `src/context/foods-reducer.ts` — create this file**

```ts
// context/foods-reducer.ts
// Pure TypeScript, no React imports (same as students-reducer.ts in Week 5).
import { Food } from "@/types/food";

export type FoodsStatus = "idle" | "loading" | "ready" | "error";

export interface FoodsState {
  items: Food[]; // ALL of the user's foods: active, used and wasted
  status: FoodsStatus;
  error: string | null;
}

export const initialFoodsState: FoodsState = {
  items: [],
  status: "idle",
  error: null,
};

export type FoodsAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: Food[] }
  | { type: "LOAD_ERROR"; payload: string }
  | { type: "ADD"; payload: Food }
  | { type: "UPDATE"; payload: Food } // replace the food with the same id
  | { type: "REMOVE"; payload: number } // payload = food id
  | { type: "CLEAR" };

export function foodsReducer(state: FoodsState, action: FoodsAction): FoodsState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, status: "loading", error: null };
    case "LOAD_SUCCESS":
      return { items: action.payload, status: "ready", error: null };
    case "LOAD_ERROR":
      return { ...state, status: "error", error: action.payload };
    case "ADD":
      // Newest first, like ADD_STUDENT in Week 5
      return { ...state, items: [action.payload, ...state.items] };
    case "UPDATE": {
      const exists = state.items.some((f) => f.id === action.payload.id);
      return {
        ...state,
        items: exists
          ? state.items.map((f) => (f.id === action.payload.id ? action.payload : f))
          : [action.payload, ...state.items],
      };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter((f) => f.id !== action.payload) };
    case "CLEAR":
      return initialFoodsState;
    default:
      return state;
  }
}
```

> **Why one `items` list with all statuses?** Home shows `active`, History shows `used` + `wasted`. Both are **derived** from one list with `filter` during render. One `GET /foods` loads both screens, and marking an item as used moves it from Home to History with no extra request.
>
> **Why does `UPDATE` also add the food when it is missing?** Food Details calls `GET /foods/:id`. If that food is not in the list yet (for example the list failed to load), the result is still stored.

### Test 6A

Temporary lines under the imports of `src/app/(tabs)/home.tsx`:

```ts
import { foodsReducer, initialFoodsState } from "@/context/foods-reducer";
import { Food } from "@/types/food";

const f = (id: number, name: string): Food => ({
  id, name, quantity: 1, unit: "pcs", storage: "fridge", categoryId: 1, expiryDate: null,
  status: "active", brand: null, barcode: null, imageUrl: null, createdAt: "", finishedAt: null,
});
let s = foodsReducer(initialFoodsState, { type: "LOAD_SUCCESS", payload: [f(1, "Milk")] });
s = foodsReducer(s, { type: "ADD", payload: f(2, "Eggs") });
console.log("R1", s.status, s.items.map((x) => x.name));
s = foodsReducer(s, { type: "UPDATE", payload: { ...f(1, "Milk"), status: "used" } });
console.log("R2", s.items.map((x) => `${x.name}:${x.status}`));
s = foodsReducer(s, { type: "REMOVE", payload: 2 });
console.log("R3", s.items.map((x) => x.name));
console.log("R4", foodsReducer(s, { type: "CLEAR" }));
```

Expected:

```text
R1 ready [ 'Eggs', 'Milk' ]
R2 [ 'Eggs:active', 'Milk:used' ]
R3 [ 'Milk' ]
R4 { items: [], status: 'idle', error: null }
```

```bash
git restore "src/app/(tabs)/home.tsx"
git add src/context/foods-reducer.ts
git commit -m "Add foods reducer"
```

### 6B. Context, provider and hook

**📄 `src/context/foods-context.tsx` — create this file**

```tsx
// context/foods-context.tsx
// The food list for the whole app. Member 3 can read it too: const { items } = useFoods();
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { createFood, deleteFood, fetchFood, fetchFoods, updateFood } from "@/services/foods";
import { Food, FoodInput, FoodUpdate } from "@/types/food";
import { getErrorMessage } from "@/utils/errors";
import { useAuth } from "./auth-context";
import { foodsReducer, FoodsStatus, initialFoodsState } from "./foods-reducer";

interface FoodsContextValue {
  items: Food[];
  status: FoodsStatus;
  error: string | null;
  refresh: () => Promise<void>; // GET /foods
  loadFood: (id: number) => Promise<void>; // GET /foods/:id   (throws when the API fails)
  addFood: (input: FoodInput) => Promise<void>; // POST /foods   (throws when the API fails)
  editFood: (id: number, changes: FoodUpdate) => Promise<void>; // PATCH (throws)
  removeFood: (id: number) => Promise<void>; // DELETE (throws)
}

const FoodsContext = createContext<FoodsContextValue | null>(null);

export function FoodsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [state, dispatch] = useReducer(foodsReducer, initialFoodsState);

  const refresh = useCallback(async () => {
    dispatch({ type: "LOAD_START" });
    try {
      const items = await fetchFoods();
      dispatch({ type: "LOAD_SUCCESS", payload: items });
    } catch (error) {
      dispatch({ type: "LOAD_ERROR", payload: getErrorMessage(error) });
    }
  }, []);

  // Load when somebody logs in, clear when they log out (same as CategoriesProvider)
  useEffect(() => {
    if (userId === undefined) {
      dispatch({ type: "CLEAR" });
      return;
    }
    refresh();
  }, [userId, refresh]);

  // The list only changes AFTER the server said yes (dispatch runs after await)
  const loadFood = useCallback(async (id: number) => {
    const food = await fetchFood(id);
    dispatch({ type: "UPDATE", payload: food });
  }, []);

  const addFood = useCallback(async (input: FoodInput) => {
    const created = await createFood(input);
    dispatch({ type: "ADD", payload: created });
  }, []);

  const editFood = useCallback(async (id: number, changes: FoodUpdate) => {
    const updated = await updateFood(id, changes);
    dispatch({ type: "UPDATE", payload: updated });
  }, []);

  const removeFood = useCallback(async (id: number) => {
    await deleteFood(id);
    dispatch({ type: "REMOVE", payload: id });
  }, []);

  const value = useMemo(
    () => ({
      items: state.items,
      status: state.status,
      error: state.error,
      refresh,
      loadFood,
      addFood,
      editFood,
      removeFood,
    }),
    [state.items, state.status, state.error, refresh, loadFood, addFood, editFood, removeFood]
  );

  return <FoodsContext.Provider value={value}>{children}</FoodsContext.Provider>;
}

export function useFoods(): FoodsContextValue {
  const ctx = useContext(FoodsContext);
  if (!ctx) {
    throw new Error("useFoods must be used inside a FoodsProvider");
  }
  return ctx;
}
```

**📄 `src/app/_layout.tsx` — 2 small edits in Ayan's file**

1. Add the import next to the other context imports:

```tsx
import { FoodsProvider } from "@/context/foods-context";
```

2. Put `<FoodsProvider>` **inside** `<CategoriesProvider>`:

```tsx
        <CategoriesProvider>
          <FoodsProvider>
            <RootNavigator />
          </FoodsProvider>
        </CategoriesProvider>
```

> **Why inside `AuthProvider`?** `FoodsProvider` calls `useAuth()` to know **who** is logged in. A hook can only read a context from a provider **above** it.
>
> **Why `[userId, refresh]` in the effect?** When user A logs out, `userId` becomes `undefined` and the list is cleared. When user B logs in, `userId` changes and B's list is loaded. B never sees A's food.
>
> **Why do `addFood`, `editFood`, `removeFood` throw?** `dispatch` runs only **after** `await` succeeded. If the server fails, the error goes up to the screen, which shows it, and the list stays correct.
>
> **Why `useCallback` + `useMemo`?** Every screen that calls `useFoods()` re-renders when `value` is a new object. `useMemo` keeps the same object until something really changes.

### Test 6B

Temporary, inside `HomeScreen` in `src/app/(tabs)/home.tsx`:

```ts
import { useFoods } from "@/context/foods-context";
// inside HomeScreen:
const { items, status } = useFoods();
console.log("FOODS", status, items.length);
```

Log in. The terminal shows `FOODS idle 0` and/or `FOODS loading 0`, then `FOODS ready 0` (or a bigger number if foods exist). Run `npx tsc --noEmit` (nothing printed).

```bash
git restore "src/app/(tabs)/home.tsx"
git add src/context/foods-context.tsx src/app/_layout.tsx
git commit -m "Add FoodsProvider and useFoods hook"
```

---

## Part 7 — Components

Five small components. Each one is used by at least one screen in Parts 8 to 12.

**📄 `src/components/search-bar.tsx` — create this file**

```tsx
// components/search-bar.tsx
// The Week 2 SearchBar + theme colours, a search icon, a clear (x) button
// and an optional onSubmit for the keyboard's "search" key.
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useAppTheme } from "@/hooks/use-app-theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder,
  onSubmit,
  autoFocus = false,
}: SearchBarProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.box, { backgroundColor: colors.inputBackground }]}>
      <Ionicons name="search" size={18} color={colors.subtext} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder ?? "Search..."}
        placeholderTextColor={colors.subtext}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        returnKeyType="search"
      />
      {/* Our own clear button, because clearButtonMode only works on iOS */}
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText("")} hitSlop={10} accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={18} color={colors.subtext} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 15 },
});
```

**📄 `src/components/filter-pills.tsx` — create this file**

```tsx
// components/filter-pills.tsx
// A horizontal row of pills, like the category filter in Week 3 (Exercise 1).
// One component for: storage filter, unit, storage place, category and history filter.
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Palette } from "@/constants/palette";
import { useAppTheme } from "@/hooks/use-app-theme";

export interface PillOption<T> {
  value: T;
  label: string;
}

interface FilterPillsProps<T> {
  options: PillOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

// <T> = the type of the values (a string union, a number id ...).
// TypeScript then checks that `selected` and `onSelect` use the same type as `options`.
export default function FilterPills<T extends string | number | null>({
  options,
  selected,
  onSelect,
}: FilterPillsProps<T>) {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {options.map((option) => {
        const active = option.value === selected;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onSelect(option.value)}
            style={[
              styles.pill,
              {
                backgroundColor: active ? Palette.accent : colors.surface,
                borderColor: active ? Palette.accent : colors.border,
              },
            ]}
          >
            <Text style={[styles.text, { color: active ? "#FFFFFF" : colors.text }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  pill: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  text: { fontSize: 13, fontWeight: "700" },
});
```

**📄 `src/components/expiry-badge.tsx` — create this file**

```tsx
// components/expiry-badge.tsx
// The green / orange / red / grey badge. The colour logic lives in utils/food.ts.
import { StyleSheet, Text, View } from "react-native";
import { getExpiryInfo } from "@/utils/food";

interface ExpiryBadgeProps {
  expiryDate: string | null;
}

export default function ExpiryBadge({ expiryDate }: ExpiryBadgeProps) {
  const info = getExpiryInfo(expiryDate);

  return (
    <View style={[styles.badge, { backgroundColor: info.colors.bg }]}>
      <Text style={[styles.text, { color: info.colors.text }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: "flex-start" },
  text: { fontSize: 11, fontWeight: "800" },
});
```

**📄 `src/components/food-card.tsx` — create this file**

```tsx
// components/food-card.tsx
// One food in a list (Home and Waste History). Same idea as ArticleCard in Week 3.
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Palette } from "@/constants/palette";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Food, StoragePlace } from "@/types/food";
import ExpiryBadge from "./expiry-badge";

const STORAGE_ICONS: Record<StoragePlace, React.ComponentProps<typeof Ionicons>["name"]> = {
  fridge: "snow-outline",
  freezer: "cube-outline",
  pantry: "file-tray-stacked-outline",
};

interface FoodCardProps {
  food: Food;
  subtitle: string; // e.g. "2 L · Fridge · Dairy"
  onPress: (food: Food) => void;
  right?: React.ReactNode; // default: the expiry badge
}

export default function FoodCard({ food, subtitle, onPress, right }: FoodCardProps) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => onPress(food)}
      activeOpacity={0.7}
    >
      {food.imageUrl ? (
        <Image source={{ uri: food.imageUrl }} style={styles.image} />
      ) : (
        // No picture (added by hand): show the storage icon instead
        <View style={[styles.image, styles.placeholder]}>
          <Ionicons name={STORAGE_ICONS[food.storage]} size={24} color={Palette.gold} />
        </View>
      )}

      <View style={styles.texts}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {food.name}
        </Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      {right ?? <ExpiryBadge expiryDate={food.expiryDate} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  image: { width: 52, height: 52, borderRadius: 10 },
  placeholder: {
    backgroundColor: "rgba(210, 132, 40, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  texts: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700" },
  subtitle: { fontSize: 12, marginTop: 3 },
});
```

**📄 `src/components/product-row.tsx` — create this file**

```tsx
// components/product-row.tsx
// One Open Food Facts search result on the Find Product screen.
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Palette } from "@/constants/palette";
import { useAppTheme } from "@/hooks/use-app-theme";
import { OffProduct } from "@/types/food";

interface ProductRowProps {
  product: OffProduct;
  onPress: (product: OffProduct) => void;
}

export default function ProductRow({ product, onPress }: ProductRowProps) {
  const { colors } = useAppTheme();
  // "Ferrero · 400 g" (skip the parts that are empty)
  const details = [product.brand, product.quantity].filter((part) => part.length > 0).join(" · ");

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Ionicons name="image-outline" size={22} color={Palette.muted} />
        </View>
      )}
      <View style={styles.texts}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {product.name}
        </Text>
        {details ? (
          <Text style={[styles.details, { color: colors.subtext }]} numberOfLines={1}>
            {details}
          </Text>
        ) : null}
      </View>
      <Ionicons name="add-circle" size={26} color={Palette.accent} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    gap: 12,
  },
  image: { width: 48, height: 48, borderRadius: 8, backgroundColor: "#FFFFFF" },
  placeholder: { alignItems: "center", justifyContent: "center", backgroundColor: "rgba(193, 106, 60, 0.12)" },
  texts: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700" },
  details: { fontSize: 12, marginTop: 2 },
});
```

> **Why is `FilterPills` generic (`<T>`)?** It is used for 5 different things: storage filter (`"all" | "fridge" …`), unit (`"pcs" | "g" …`), storage place, category (`number | null`) and the history filter. With `<T>`, TypeScript checks that `selected`, `options` and `onSelect` all use the **same** type. One component, five correct uses (CO2: reusable components).
>
> **Why does `FoodCard` take `right`?** Home shows the expiry badge on the right; History shows an Undo button there. Same idea as `right` in Ayan's `SettingsRow`.
>
> **Why `width` and `height` on every `Image`?** A remote image has no size until it is downloaded. Without a size React Native draws it 0 × 0, so you see nothing (Week 2).
>
> **Why our own clear (x) button?** `clearButtonMode` only works on iOS. Most of your users have Android.

### Test 7

```bash
npx tsc --noEmit        # must print nothing
```

### Commit

```bash
git add src/components
git commit -m "Add food list components"
```

---

## Part 8 — Food stack and Home screen

### 8.1 The food Stack

**📄 `src/app/food/_layout.tsx` — create this file**

```tsx
// app/food/_layout.tsx
// A Stack for all food screens (same idea as the (home) Stack in Week 3).
// screenOptions = the default for every food screen; options on one screen override it.
import { Stack } from "expo-router";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function FoodLayout() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="search" options={{ title: "Find Product" }} />
      <Stack.Screen name="form" options={{ title: "Add Food" }} />
      <Stack.Screen name="[id]" options={{ title: "Food Details" }} />
      <Stack.Screen name="history" options={{ title: "Waste History" }} />
    </Stack>
  );
}
```

### 8.2 Four placeholder screens

They exist only so every route works and compiles now. Each one is replaced later.

**📄 `src/app/food/search.tsx` — create this file**

```tsx
// app/food/search.tsx  -  TEMPORARY placeholder, replaced in Part 9
import { StyleSheet, Text, View } from "react-native";

export default function FindProductScreen() {
  return (
    <View style={styles.center}>
      <Text>Find Product comes in Part 9.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
});
```

**📄 `src/app/food/form.tsx` — create this file**

```tsx
// app/food/form.tsx  -  TEMPORARY placeholder, replaced in Part 10
// It prints the route params, so you can check what Find Product sends (Part 9 test).
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function FoodFormScreen() {
  const params = useLocalSearchParams();
  return (
    <View style={styles.center}>
      <Text>Add / Edit Food comes in Part 10. Params received:</Text>
      <Text style={styles.code}>{JSON.stringify(params, null, 2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  code: { fontFamily: "monospace", fontSize: 12, marginTop: 12 },
});
```

**📄 `src/app/food/[id].tsx` — create this file**

```tsx
// app/food/[id].tsx  -  TEMPORARY placeholder, replaced in Part 11
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function FoodDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.center}>
      <Text>Details of food {id} come in Part 11.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
});
```

**📄 `src/app/food/history.tsx` — create this file**

```tsx
// app/food/history.tsx  -  TEMPORARY placeholder, replaced in Part 12
import { StyleSheet, Text, View } from "react-native";

export default function WasteHistoryScreen() {
  return (
    <View style={styles.center}>
      <Text>Waste History comes in Part 12.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
});
```

### 8.3 Register the stack in the root layout

**📄 `src/app/_layout.tsx` — 1 line inside the signed-in group**, under Ayan's `categories` screen:

```tsx
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="categories"
            options={{ /* … Ayan's options, unchanged … */ }}
          />
          <Stack.Screen name="food" />
        </Stack.Protected>
```

For reference, the whole file after Parts 6B and 8.3:

**📄 `src/app/_layout.tsx` — for reference**

```tsx
// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { Palette } from "@/constants/palette";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { CategoriesProvider } from "@/context/categories-context";
import { FoodsProvider } from "@/context/foods-context";
import { SettingsProvider, useSettings } from "@/context/settings-context";
import { useAppTheme } from "@/hooks/use-app-theme";

function RootNavigator() {
  const { status } = useAuth();
  const { loaded } = useSettings();
  const { colors, isDark } = useAppTheme();

  // Wait until we know (1) the saved settings and (2) if a saved login exists
  if (status === "loading" || !loaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Palette.authBackground }}>
        <ActivityIndicator size="large" color={Palette.primary} />
      </View>
    );
  }

  const signedIn = status === "signedIn";

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Screens only a logged-in user can open */}
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="categories"
            options={{
              headerShown: true,
              title: "Manage Categories",
              headerStyle: { backgroundColor: colors.header },
              headerTintColor: "#FFFFFF",
              headerTitleStyle: { fontWeight: "700" },
            }}
          />
          <Stack.Screen name="food" />
        </Stack.Protected>

        {/* Screens only a logged-out user can open */}
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  // Order matters: Categories needs Auth (it reads the user), the theme needs Settings
  return (
    <SettingsProvider>
      <AuthProvider>
        <CategoriesProvider>
          <FoodsProvider>
            <RootNavigator />
          </FoodsProvider>
        </CategoriesProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
```

### 8.4 Home

**📄 `src/app/(tabs)/home.tsx` — replace the whole file**

```tsx
// app/(tabs)/home.tsx  -  Member 1: the food list (search, filter, colour badges)
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton from "@/components/app-button";
import FilterPills, { PillOption } from "@/components/filter-pills";
import FoodCard from "@/components/food-card";
import SearchBar from "@/components/search-bar";
import { SOON_DAYS, STORAGE_OPTIONS } from "@/constants/food";
import { Palette } from "@/constants/palette";
import { useAuth } from "@/context/auth-context";
import { useCategories } from "@/context/categories-context";
import { useFoods } from "@/context/foods-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Food, StoragePlace } from "@/types/food";
import { categoryName, daysUntil, formatQuantity, sortByExpiry, storageLabel } from "@/utils/food";

type StorageFilter = StoragePlace | "all";

const STORAGE_FILTERS: PillOption<StorageFilter>[] = [
  { value: "all", label: "All" },
  ...STORAGE_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
];

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { items: categories } = useCategories();
  const { items, status, error, refresh } = useFoods();

  // Local state: only this screen needs it (Week 5 rule)
  const [query, setQuery] = useState("");
  const [storage, setStorage] = useState<StorageFilter>("all");

  // Derived values: calculated during render, never copied into state
  const activeFoods = items.filter((f) => f.status === "active");
  const q = query.trim().toLowerCase();
  const visible = sortByExpiry(
    activeFoods.filter((f) => {
      const matchesStorage = storage === "all" || f.storage === storage;
      const matchesQuery =
        q.length === 0 ||
        f.name.toLowerCase().includes(q) ||
        (f.brand ?? "").toLowerCase().includes(q) ||
        categoryName(categories, f.categoryId).toLowerCase().includes(q);
      return matchesStorage && matchesQuery;
    })
  );
  const urgentCount = activeFoods.filter((f) => {
    const days = daysUntil(f.expiryDate);
    return days !== null && days <= SOON_DAYS;
  }).length;
  const firstName = (user?.name ?? "").trim().split(" ")[0];

  const openFood = (food: Food) => {
    router.push({ pathname: "/food/[id]", params: { id: String(food.id) } });
  };

  // Loading state: first load, nothing to show yet
  if (status === "loading" && items.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Palette.accent} />
      </View>
    );
  }

  // Error state: first load failed
  if (status === "error" && items.length === 0) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Could not load your food</Text>
        <Text style={[styles.errorText, { color: colors.subtext }]}>{error}</Text>
        <View style={styles.retry}>
          <AppButton title="TRY AGAIN" onPress={refresh} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={visible}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <FoodCard
            food={item}
            subtitle={`${formatQuantity(item)} · ${storageLabel(item.storage)} · ${categoryName(categories, item.categoryId)}`}
            onPress={openFood}
          />
        )}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={status === "loading"}
            onRefresh={refresh}
            tintColor={Palette.accent}
            colors={[Palette.accent]}
          />
        }
        // A JSX element (not a component function), so the search box keeps focus while typing
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.titleTexts}>
                <Text style={[styles.hello, { color: colors.subtext }]}>Hello, {firstName}!</Text>
                <Text style={[styles.title, { color: colors.text }]}>My Kitchen</Text>
              </View>
              <Pressable
                style={[styles.historyButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push("/food/history")}
                accessibilityLabel="Waste history"
              >
                <Ionicons name="time-outline" size={22} color={Palette.gold} />
              </Pressable>
            </View>

            <Text style={[styles.summary, { color: colors.subtext }]}>
              {activeFoods.length} item{activeFoods.length === 1 ? "" : "s"}
              {urgentCount > 0 ? ` · ${urgentCount} to use soon` : ""}
            </Text>

            <SearchBar value={query} onChangeText={setQuery} placeholder="Search food, brand or category" />
            <View style={styles.pills}>
              <FilterPills options={STORAGE_FILTERS} selected={storage} onSelect={setStorage} />
            </View>

            {status === "error" ? (
              <Text style={[styles.banner, { color: colors.danger }]}>{error}</Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="nutrition-outline" size={44} color={Palette.muted} />
            <Text style={[styles.emptyText, { color: colors.subtext }]}>
              {activeFoods.length === 0
                ? "Your kitchen is empty.\nTap + to add the food you bought."
                : "No food matches your search."}
            </Text>
          </View>
        }
      />

      {/* Floating "+" button: start with the Open Food Facts search */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push("/food/search")}
        accessibilityLabel="Add food"
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  list: { padding: 16, paddingBottom: 110 },
  header: { marginBottom: 8 },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  titleTexts: { flex: 1 },
  hello: { fontSize: 14, fontWeight: "600" },
  title: { fontSize: 28, fontWeight: "900" },
  historyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  summary: { fontSize: 13, marginBottom: 12 },
  pills: { marginTop: 10, marginBottom: 6 },
  banner: { fontSize: 13, fontWeight: "600", marginTop: 6 },
  empty: { alignItems: "center", marginTop: 48, gap: 10 },
  emptyText: { textAlign: "center", fontSize: 14, lineHeight: 20 },
  errorTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  errorText: { fontSize: 14, textAlign: "center" },
  retry: { marginTop: 18, alignSelf: "stretch" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Palette.accent,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabPressed: { opacity: 0.85 },
});
```

> **Why a nested Stack in `app/food/`?** Same as the `(home)` Stack in Week 3: one `_layout.tsx` gives all food screens the same navy header (`screenOptions`), and each `Stack.Screen` sets its own title (`options`). The root layout needs only one line: `<Stack.Screen name="food" />`.
>
> **Does the first food screen get a Back arrow?** Yes. React Navigation passes the parent stack's "back" to a nested stack's first screen, so Find Product shows a back arrow to Home.
>
> **Why `name="food"` inside `Stack.Protected guard={signedIn}`?** A logged-out user must not open `/food/12` from a link. The guard removes the route when nobody is signed in.
>
> **Why are `activeFoods`, `visible`, `urgentCount` not in `useState`?** They come from `items`, `query` and `storage`. Copying them into state means keeping two copies in sync. Calculating them during render is always correct (Week 5, Feature 2).
>
> **Why `edges={["top"]}` on `SafeAreaView`?** The tab bar already handles the bottom edge. Without it, there would be a double gap above the tabs.

### Test 8

1. `npx expo start`, log in. Home shows **"My Kitchen"** and the empty state "Your kitchen is empty."
2. **Commit now**, so the temporary seed lines of step 3 can be removed with `git restore`:

```bash
git add src/app
git commit -m "Add food stack and Home screen"
```

3. Add sample foods. In `src/app/(tabs)/home.tsx` add 2 import lines under the other imports:

```ts
import { useEffect } from "react";
import { addDays } from "@/utils/food";
```

and **directly under** `const [storage, setStorage] = useState<StorageFilter>("all");` (before any `return`):

```ts
  // TEMPORARY (Test 8): add 4 sample foods once, when the list is empty
  const { addFood } = useFoods();
  useEffect(() => {
    if (status !== "ready" || items.length > 0) return;
    async function seed() {
      await addFood({ name: "Milk", quantity: 1, unit: "L", storage: "fridge", categoryId: 1, expiryDate: addDays(1) });
      await addFood({ name: "Yogurt", quantity: 2, unit: "pcs", storage: "fridge", categoryId: 1, expiryDate: addDays(-1) });
      await addFood({ name: "Chicken", quantity: 1, unit: "kg", storage: "freezer", categoryId: 4, expiryDate: addDays(20) });
      await addFood({ name: "Rice", quantity: 5, unit: "kg", storage: "pantry", categoryId: 7, expiryDate: null });
    }
    seed().catch((e) => console.log("seed failed:", e.message));
  }, [status, items.length, addFood]);
```

Save. The 4 foods appear one by one (each takes the pretend 400 ms). They are saved on the phone, so now remove the lines:

```bash
git restore "src/app/(tabs)/home.tsx"
```

4. Check:

| Check | Expected |
|---|---|
| Order | Yogurt (red "Expired 1 day ago") → Milk (orange "1 day left") → Chicken (green "20 days left") → Rice (grey "No date") |
| Summary | "4 items · 2 to use soon" |
| Search `ch` | only Chicken |
| Search `dairy` | Milk and Yogurt (search also matches the category name) |
| Pill **Pantry** | only Rice |
| Pull down | the spinner shows briefly, the list stays |
| Tap a food | the Details placeholder "Details of food *id* come in Part 11." with a back arrow |
| Clock icon / "+" | the History / Find Product placeholders |
| Settings → Dark mode | Home turns dark too |
| Reload the app (`r`) | the 4 foods are still there (saved in AsyncStorage) |

5. **See the error state** (the local backend never fails by itself, so force it for a moment). In `src/services/foods.ts` make the first line inside `fetchFoods` `throw new Error("Test");`, save, then:
   - pull down on Home → the list stays and a red line says "Something went wrong. Please try again."
   - reload the app (`r`) → "Could not load your food" + **TRY AGAIN**

   Undo it: `git restore src/services/foods.ts`, then tap TRY AGAIN → the list is back.

---

## Part 9 — Find Product screen (Open Food Facts)

**📄 `src/app/food/search.tsx` — replace the whole file**

```tsx
// app/food/search.tsx  -  Find Product: search Open Food Facts, then open the form pre-filled
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import AppButton from "@/components/app-button";
import ProductRow from "@/components/product-row";
import SearchBar from "@/components/search-bar";
import { Palette } from "@/constants/palette";
import { useAppTheme } from "@/hooks/use-app-theme";
import {
  getOffErrorMessage,
  getProductByBarcode,
  isBarcode,
  searchProducts,
} from "@/services/open-food-facts";
import { OffProduct } from "@/types/food";
import { guessCategoryName, parseOffQuantity } from "@/utils/open-food-facts";

type SearchStatus = "idle" | "loading" | "success" | "error";

export default function FindProductScreen() {
  const { colors } = useAppTheme();

  const [query, setQuery] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  // The search that was submitted. A NEW object every time, so the effect
  // runs again even when the user searches the same word twice.
  const [submitted, setSubmitted] = useState<{ text: string } | null>(null);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [results, setResults] = useState<OffProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Runs the request when a search is submitted (same idea as the Week 4 submit effect)
  useEffect(() => {
    if (!submitted) return;
    let cancelled = false;

    async function runSearch(text: string) {
      try {
        let found: OffProduct[];
        if (isBarcode(text)) {
          const product = await getProductByBarcode(text);
          found = product ? [product] : [];
        } else {
          found = await searchProducts(text);
        }
        if (!cancelled) {
          setResults(found);
          setStatus("success");
        }
      } catch (e) {
        if (!cancelled) {
          setError(getOffErrorMessage(e));
          setStatus("error");
        }
      }
    }

    runSearch(submitted.text);
    // Cleanup: if the user searches again or leaves the screen,
    // the old answer must not overwrite the screen.
    return () => {
      cancelled = true;
    };
  }, [submitted]);

  // We search only when the user presses Search: Open Food Facts allows
  // only 10 searches per minute, so search-as-you-type is not allowed.
  const handleSearch = () => {
    const text = query.trim();
    if (text.length < 2) {
      setInputError("Type at least 2 letters, or a barcode number.");
      return;
    }
    setInputError(null);
    setError(null);
    setStatus("loading");
    setSubmitted({ text });
  };

  // Tap a product: open the form with the product's data as route params (Week 3)
  const handlePick = (product: OffProduct) => {
    const { quantity, unit } = parseOffQuantity(product.quantity);
    router.replace({
      pathname: "/food/form",
      params: {
        name: product.name,
        brand: product.brand,
        barcode: product.barcode,
        imageUrl: product.imageUrl ?? "",
        quantity,
        unit,
        categoryHint: guessCategoryName(product.categoryTags),
      },
    });
  };

  const addByHand = () => router.replace("/food/form");

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.list}
      data={status === "success" ? results : []}
      keyExtractor={(item) => item.barcode}
      renderItem={({ item }) => <ProductRow product={item} onPress={handlePick} />}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.header}>
          <SearchBar
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              setInputError(null);
            }}
            onSubmit={handleSearch}
            placeholder="e.g. milk, Nutella or 3017624010701"
            autoFocus
          />
          {inputError ? (
            <Text style={[styles.inputError, { color: colors.danger }]}>{inputError}</Text>
          ) : null}
          <View style={styles.searchButton}>
            <AppButton title="SEARCH" onPress={handleSearch} loading={status === "loading"} />
          </View>
          <Pressable style={styles.manual} onPress={addByHand}>
            <Ionicons name="create-outline" size={16} color={Palette.accent} />
            <Text style={styles.manualText}>Add food by hand instead</Text>
          </Pressable>
          {status === "success" && results.length > 0 ? (
            <Text style={[styles.count, { color: colors.subtext }]}>
              {results.length} product{results.length === 1 ? "" : "s"} found. Tap one to add it.
            </Text>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <View style={styles.state}>
          {status === "idle" ? (
            <Text style={[styles.stateText, { color: colors.subtext }]}>
              Search by product name, or type the barcode number printed under the bar lines.
            </Text>
          ) : null}
          {status === "loading" ? <ActivityIndicator size="large" color={Palette.accent} /> : null}
          {status === "error" ? (
            <>
              <Text style={[styles.stateTitle, { color: colors.text }]}>Search failed</Text>
              <Text style={[styles.stateText, { color: colors.subtext }]}>{error}</Text>
              <View style={styles.retry}>
                <AppButton title="TRY AGAIN" variant="dark" onPress={handleSearch} />
              </View>
            </>
          ) : null}
          {status === "success" ? (
            <Text style={[styles.stateText, { color: colors.subtext }]}>
              No products found for &quot;{submitted?.text}&quot;. Try another word, or add it by hand.
            </Text>
          ) : null}
        </View>
      }
      ListFooterComponent={
        // Open Food Facts data is free under the ODbL licence, which asks us to credit it
        <Text style={[styles.credit, { color: colors.subtext }]}>
          Product data from Open Food Facts (openfoodfacts.org)
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 12 },
  inputError: { fontSize: 12, fontWeight: "600", marginTop: 6 },
  searchButton: { marginTop: 12 },
  manual: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 },
  manualText: { color: Palette.accent, fontWeight: "800", fontSize: 14 },
  count: { fontSize: 12, marginTop: 16 },
  state: { alignItems: "center", marginTop: 32, paddingHorizontal: 12 },
  stateTitle: { fontSize: 17, fontWeight: "800", marginBottom: 6 },
  stateText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  retry: { marginTop: 16, alignSelf: "stretch" },
  credit: { fontSize: 11, textAlign: "center", marginTop: 24 },
});
```

> **Why does the search start from a `useEffect` and not inside `handleSearch`?** It is the Week 4 submit pattern: the handler sets "loading" and a trigger (`submitted`), and an effect does the slow work. The effect's **cleanup** (`cancelled = true`) solves two real bugs: (1) the user leaves the screen while waiting, so no state update on a closed screen; (2) the user searches "milk" and then quickly "eggs". If the "milk" answer arrives last, it must not overwrite the "eggs" results. The cleanup of the old run marks it as cancelled.
>
> **Why is `submitted` an object `{ text }` and not just the text?** React runs an effect only when a dependency **changes**. Searching "milk" twice gives the same string, so the effect would not run again (for example "Try again" after an error). A new object is always "changed".
>
> **Why `router.replace` and not `push`?** After saving the form, **Back** should go to Home, not back to the search results. `replace` swaps the search screen for the form.
>
> **Why are all params strings?** Route params live in the URL (`/food/form?name=Nutella&quantity=400`). A URL only has text, so the form turns them back into the right types.

### Test 9 (on the phone)

| Do | Expected |
|---|---|
| Home → **+** | Find Product with the keyboard open and a back arrow |
| Press Search with `m` | "Type at least 2 letters …", no request sent |
| Search `milk` | spinner on the button, then up to 20 products with pictures |
| Search `3017624010701` | exactly one result: Nutella, Ferrero · 400.0 g |
| Search `zzqqxx` | "No products found for "zzqqxx" …" |
| Airplane mode, search `bread` | "Search failed — Cannot reach Open Food Facts …" + TRY AGAIN |
| Search `milk` again | instant (cached) |
| Tap Nutella | the form placeholder shows params: `name: Nutella, brand: Ferrero, quantity: 400, unit: g, categoryHint: Other, …` |
| Back on the form placeholder | goes to **Home** (not to the search) |
| "Add food by hand instead" | form placeholder with empty params |

```bash
git add "src/app/food/search.tsx"
git commit -m "Add Find Product screen"
```

---

## Part 10 — Add / Edit Food form

**📄 `src/app/food/form.tsx` — replace the whole file**

```tsx
// app/food/form.tsx  -  Add / Edit Food
// Add mode:  /food/form                      (empty form)
//            /food/form?name=...&barcode=... (pre-filled from Find Product)
// Edit mode: /food/form?id=12
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AppButton from "@/components/app-button";
import FilterPills, { PillOption } from "@/components/filter-pills";
import FormField from "@/components/form-field";
import { STORAGE_OPTIONS, UNIT_OPTIONS } from "@/constants/food";
import { Palette } from "@/constants/palette";
import { useCategories } from "@/context/categories-context";
import { useFoods } from "@/context/foods-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Category } from "@/types";
import { Food, FoodInput, StoragePlace, Unit } from "@/types/food";
import { getErrorMessage } from "@/utils/errors";
import { addDays } from "@/utils/food";
import { FoodFormData, FoodFormErrors, validateFood } from "@/utils/food-validation";

// Route params are always text (or missing)
type FormParams = {
  id?: string;
  name?: string;
  brand?: string;
  barcode?: string;
  imageUrl?: string;
  quantity?: string;
  unit?: string;
  categoryHint?: string;
};

const UNIT_PILLS: PillOption<Unit>[] = UNIT_OPTIONS.map((u) => ({ value: u, label: u }));
const STORAGE_PILLS: PillOption<StoragePlace>[] = STORAGE_OPTIONS.map((s) => ({
  value: s.value,
  label: s.label,
}));
const DATE_CHIPS = [
  { label: "Today", days: 0 },
  { label: "+3 days", days: 3 },
  { label: "+1 week", days: 7 },
  { label: "+1 month", days: 30 },
];

// The first values of the form: from the food (Edit), from Open Food Facts (Add), or empty
function initialFormData(food: Food | undefined, params: FormParams, categories: Category[]): FoodFormData {
  if (food) {
    return {
      name: food.name,
      quantity: String(food.quantity),
      unit: food.unit,
      storage: food.storage,
      categoryId: food.categoryId,
      expiryDate: food.expiryDate ?? "",
    };
  }
  const hinted = categories.find((c) => c.name === params.categoryHint);
  const unit = UNIT_OPTIONS.find((u) => u === params.unit) ?? "pcs";
  return {
    name: params.name ?? "",
    quantity: params.quantity ?? "1",
    unit,
    storage: "fridge",
    categoryId: hinted?.id ?? null,
    expiryDate: "",
  };
}

export default function FoodFormScreen() {
  const params = useLocalSearchParams<FormParams>();
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const { items: categories } = useCategories();
  const { items, addFood, editFood } = useFoods();

  const editId = params.id ? Number(params.id) : null;
  const isEdit = editId !== null;
  const food = isEdit ? items.find((f) => f.id === editId) : undefined;

  // Combined state for the field values (Week 4). The () => ... form runs only on the first render.
  const [formData, setFormData] = useState<FoodFormData>(() =>
    initialFormData(food, params, categories)
  );
  // Separate state for everything that is not a field value
  const [errors, setErrors] = useState<FoodFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Product info from Open Food Facts. Not editable: it is saved as it is.
  const brand = food ? food.brand : params.brand || null;
  const barcode = food ? food.barcode : params.barcode || null;
  const imageUrl = food ? food.imageUrl : params.imageUrl || null;

  // Header title (Week 3: setOptions inside useEffect, never directly in render)
  useEffect(() => {
    navigation.setOptions({ title: isEdit ? "Edit Food" : "Add Food" });
  }, [navigation, isEdit]);

  // Live validation (Week 4): runs again every time a field changes
  useEffect(() => {
    setErrors(validateFood(formData, isEdit));
  }, [formData, isEdit]);

  // One updater for every field. <K> makes TypeScript check that the value fits the field:
  // updateField("unit", "kg") is fine, updateField("unit", 5) is an error.
  const updateField = <K extends keyof FoodFormData>(field: K, value: FoodFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setServerError(null);
  };

  const markTouched = (field: keyof FoodFormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Show an error only after the field was touched OR Save was pressed (Week 4)
  const getFieldError = (field: keyof FoodFormErrors) =>
    touched[field] || submitAttempted ? errors[field] : undefined;

  const isFormValid = Object.keys(errors).length === 0;

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    if (!isFormValid || formData.categoryId === null) return;

    const input: FoodInput = {
      name: formData.name.trim(),
      quantity: Number(formData.quantity),
      unit: formData.unit,
      storage: formData.storage,
      categoryId: formData.categoryId,
      expiryDate: formData.expiryDate.trim() || null,
      brand,
      barcode,
      imageUrl,
    };

    setIsSubmitting(true);
    setServerError(null);
    try {
      if (editId !== null) {
        await editFood(editId, input); // PATCH /foods/:id
      } else {
        await addFood(input); // POST /foods
      }
      // Success: Home and Details read the list from the context, so they are already up to date.
      // This screen closes, so we do NOT call setIsSubmitting(false) here.
      router.back();
    } catch (e) {
      setServerError(getErrorMessage(e));
      setIsSubmitting(false);
    }
  };

  // Edit mode, but the food is not in the list (for example it was deleted meanwhile)
  if (isEdit && !food) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.subtext }]}>This food no longer exists.</Text>
      </View>
    );
  }

  const categoryPills: PillOption<number | null>[] = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const categoryError = getFieldError("categoryId");

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      {/* Only when the food came from Open Food Facts */}
      {imageUrl || brand ? (
        <View style={[styles.product, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="contain" /> : null}
          <View style={styles.productTexts}>
            <Text style={[styles.productLabel, { color: colors.subtext }]}>From Open Food Facts</Text>
            {brand ? <Text style={[styles.productBrand, { color: colors.text }]}>{brand}</Text> : null}
            {barcode ? <Text style={[styles.productBarcode, { color: colors.subtext }]}>Barcode {barcode}</Text> : null}
          </View>
        </View>
      ) : null}

      <FormField
        label="Food name"
        value={formData.name}
        onChangeText={(text) => updateField("name", text)}
        onBlur={() => markTouched("name")}
        error={getFieldError("name")}
        placeholder="e.g. Milk"
      />

      <FormField
        label="Quantity"
        value={formData.quantity}
        onChangeText={(text) => updateField("quantity", text)}
        onBlur={() => markTouched("quantity")}
        error={getFieldError("quantity")}
        placeholder="e.g. 2"
        keyboardType="decimal-pad"
      />

      <Text style={[styles.label, { color: colors.text }]}>Unit</Text>
      <FilterPills options={UNIT_PILLS} selected={formData.unit} onSelect={(u) => updateField("unit", u)} />

      <Text style={[styles.label, styles.spaced, { color: colors.text }]}>Stored in</Text>
      <FilterPills
        options={STORAGE_PILLS}
        selected={formData.storage}
        onSelect={(s) => updateField("storage", s)}
      />

      <View style={[styles.labelRow, styles.spaced]}>
        <Text style={[styles.label, { color: colors.text }]}>Category</Text>
        {/* Member 2's screen: the new category appears here at once (shared context) */}
        <Pressable onPress={() => router.push("/categories")} hitSlop={8}>
          <Text style={styles.link}>Manage</Text>
        </Pressable>
      </View>
      <FilterPills
        options={categoryPills}
        selected={formData.categoryId}
        onSelect={(id) => updateField("categoryId", id)}
      />
      {categoryError ? <Text style={styles.error}>{categoryError}</Text> : null}

      <View style={styles.spaced}>
        <FormField
          label="Expiry date (optional)"
          value={formData.expiryDate}
          onChangeText={(text) => updateField("expiryDate", text)}
          onBlur={() => markTouched("expiryDate")}
          error={getFieldError("expiryDate")}
          placeholder="YYYY-MM-DD, e.g. 2026-11-25"
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.chips}>
        {DATE_CHIPS.map((chip) => (
          <Pressable
            key={chip.label}
            style={[styles.chip, { borderColor: colors.border }]}
            onPress={() => updateField("expiryDate", addDays(chip.days))}
          >
            <Text style={[styles.chipText, { color: colors.text }]}>{chip.label}</Text>
          </Pressable>
        ))}
        <Pressable
          style={[styles.chip, { borderColor: colors.border }]}
          onPress={() => updateField("expiryDate", "")}
        >
          <Text style={[styles.chipText, { color: colors.subtext }]}>No date</Text>
        </Pressable>
      </View>

      {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

      <View style={styles.submit}>
        <AppButton
          title={isEdit ? "SAVE CHANGES" : "SAVE FOOD"}
          onPress={handleSubmit}
          loading={isSubmitting}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 48 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  notFound: { fontSize: 15 },
  product: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
    gap: 12,
  },
  productImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: "#FFFFFF" },
  productTexts: { flex: 1 },
  productLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  productBrand: { fontSize: 15, fontWeight: "700", marginTop: 2 },
  productBarcode: { fontSize: 12, marginTop: 2 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  spaced: { marginTop: 14 },
  link: { color: Palette.accent, fontWeight: "800", fontSize: 13 },
  error: { fontSize: 12, color: "#DC2626", marginTop: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: -4 },
  chip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { fontSize: 12, fontWeight: "700" },
  serverError: { color: "#DC2626", fontWeight: "700", textAlign: "center", marginTop: 16 },
  submit: { marginTop: 22 },
});
```

> **Week 4, line by line:** `formData` = combined state for related fields · `errors`, `touched`, `submitAttempted`, `isSubmitting`, `serverError` = separate state · `useEffect(() => setErrors(validateFood(...)), [formData, isEdit])` = live validation · `getFieldError` shows an error only after blur **or** Save.
>
> **Why `useState(() => initialFormData(...))` with an arrow?** That is a **lazy initializer**: React calls it only on the first render. The form must start from the product / the food **once**. After that, the user's typing is the truth.
>
> **Why `updateField<K extends keyof FoodFormData>`?** Week 4's `updateField` took only strings. Here `unit` is a `Unit`, `categoryId` is a `number | null`. The generic makes TypeScript check that each value fits its field.
>
> **Why `router.back()` after saving, with no "refresh"?** `addFood` / `editFood` already put the server's answer into the shared list. Home and Details read that list, so they are up to date the moment you go back. No extra request (Week 5: global state, no callbacks).
>
> **Why the "Manage" link to `/categories`?** It is Ayan's screen. A category added there appears in your pills at once, because both screens read the same `CategoriesProvider`.

### Test 10

| Do | Expected |
|---|---|
| Home → + → "Add food by hand" → SAVE FOOD with an empty form | red errors under name and category, nothing sent |
| Name `M`, tap elsewhere | "Name must be at least 2 characters." |
| Quantity `abc` | "Use a number, e.g. 2 or 0.5" |
| Date `2026-02-30` | "Use the format YYYY-MM-DD …" |
| Date chip **+1 week** | the field shows the date in 7 days, no error |
| Type yesterday's date | "This date is already in the past." |
| Fill correctly → SAVE FOOD | spinner, back to Home, the new food is there with the right badge |
| + → search `nutella` → tap it | form pre-filled: Nutella, 400, g, picture card "From Open Food Facts · Ferrero" |
| Category **Manage** → add "Spreads" → back | "Spreads" is in the pills |
| **Server error:** Manage categories → add "Test" → give one food the category "Test" → delete "Test" in Manage categories → Edit that food → SAVE CHANGES | the backend refuses it: red "categoryId must be one of your categories", the button works again. Pick another category and save. |

```bash
git add "src/app/food/form.tsx"
git commit -m "Add Add/Edit Food form"
```

---

## Part 11 — Food Details

**📄 `src/app/food/[id].tsx` — replace the whole file**

```tsx
// app/food/[id].tsx  -  Food Details (dynamic route, Week 3)
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AppButton from "@/components/app-button";
import ExpiryBadge from "@/components/expiry-badge";
import { Palette } from "@/constants/palette";
import { useCategories } from "@/context/categories-context";
import { useFoods } from "@/context/foods-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { FoodStatus } from "@/types/food";
import { confirmAction } from "@/utils/confirm";
import { getErrorMessage } from "@/utils/errors";
import { categoryName, formatDate, formatQuantity, storageLabel } from "@/utils/food";

type DetailParams = { id: string };

export default function FoodDetailsScreen() {
  const { id } = useLocalSearchParams<DetailParams>();
  const foodId = Number(id);
  const navigation = useNavigation();
  const { colors } = useAppTheme();
  const { items: categories } = useCategories();
  const { items, loadFood, editFood, removeFood } = useFoods();

  // The food comes from the shared list, so every change shows here at once
  const food = items.find((f) => f.id === foodId);

  const [loading, setLoading] = useState(true); // GET /foods/:id is running
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0); // "Try again" adds 1, which re-runs the effect
  const [busy, setBusy] = useState(false); // used / wasted / delete is running
  const [actionError, setActionError] = useState<string | null>(null);

  // Ask the server for the newest version (GET /foods/:id). Cleanup = Week 4 idea.
  useEffect(() => {
    let cancelled = false;
    loadFood(foodId)
      .then(() => {
        if (!cancelled) setLoadError(null);
      })
      .catch((e) => {
        if (!cancelled) setLoadError(getErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [foodId, loadFood, reloadCount]);

  // Header: the food's name + an edit button on the right (Week 3, Exercise 2)
  useEffect(() => {
    navigation.setOptions({
      title: food?.name ?? "Food Details",
      headerRight:
        food && food.status === "active"
          ? () => (
              <Pressable
                onPress={() => router.push({ pathname: "/food/form", params: { id: String(food.id) } })}
                hitSlop={10}
                accessibilityLabel="Edit food"
              >
                <Ionicons name="create-outline" size={22} color="#FFFFFF" />
              </Pressable>
            )
          : undefined,
    });
  }, [navigation, food]);

  const retry = () => {
    setLoading(true);
    setLoadError(null);
    setReloadCount((n) => n + 1);
  };

  // Not in the list yet: loading, failed, or the id does not exist
  if (!food) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        {loading ? (
          <ActivityIndicator size="large" color={Palette.accent} />
        ) : (
          <>
            <Text style={[styles.errorTitle, { color: colors.text }]}>Food not found</Text>
            <Text style={[styles.errorText, { color: colors.subtext }]}>
              {loadError ?? "It may have been deleted."}
            </Text>
            <View style={styles.retry}>
              <AppButton title="TRY AGAIN" onPress={retry} />
            </View>
          </>
        )}
      </View>
    );
  }

  // PATCH /foods/:id { status } and go back to the list
  const changeStatus = async (status: FoodStatus) => {
    setBusy(true);
    setActionError(null);
    try {
      await editFood(food.id, { status });
      router.back();
    } catch (e) {
      setActionError(getErrorMessage(e));
      setBusy(false);
    }
  };

  const handleUsed = () => changeStatus("used");

  const handleWasted = () => {
    confirmAction(
      "Threw it away?",
      `Mark "${food.name}" as wasted? It will count in your waste statistics.`,
      "Wasted",
      () => changeStatus("wasted")
    );
  };

  const handleDelete = () => {
    confirmAction(
      "Delete food",
      `Delete "${food.name}" for good? Use this only for mistakes. It will not count as used or wasted.`,
      "Delete",
      async () => {
        setBusy(true);
        setActionError(null);
        try {
          await removeFood(food.id);
          router.back();
        } catch (e) {
          setActionError(getErrorMessage(e));
          setBusy(false);
        }
      }
    );
  };

  const isActive = food.status === "active";
  const rows: { label: string; value: string }[] = [
    { label: "Quantity", value: formatQuantity(food) },
    { label: "Category", value: categoryName(categories, food.categoryId) },
    { label: "Stored in", value: storageLabel(food.storage) },
    { label: "Expiry date", value: formatDate(food.expiryDate) },
    { label: "Added on", value: formatDate(food.createdAt) },
  ];
  if (!isActive) {
    rows.push({ label: food.status === "used" ? "Used on" : "Thrown away on", value: formatDate(food.finishedAt) });
  }
  if (food.barcode) rows.push({ label: "Barcode", value: food.barcode });

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {food.imageUrl ? (
          <Image source={{ uri: food.imageUrl }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Ionicons name="nutrition-outline" size={48} color={Palette.gold} />
          </View>
        )}
        <Text style={[styles.name, { color: colors.text }]}>{food.name}</Text>
        {food.brand ? <Text style={[styles.brand, { color: colors.subtext }]}>{food.brand}</Text> : null}
        <View style={styles.badgeRow}>
          {isActive ? (
            <ExpiryBadge expiryDate={food.expiryDate} />
          ) : (
            <View style={[styles.status, food.status === "wasted" ? styles.statusWasted : styles.statusUsed]}>
              <Text style={styles.statusText}>{food.status === "wasted" ? "Wasted" : "Used"}</Text>
            </View>
          )}
        </View>
      </View>

      {/* A refresh failed, but we still have the saved copy */}
      {loadError ? (
        <Text style={[styles.warning, { color: colors.subtext }]}>Could not refresh: {loadError}</Text>
      ) : null}

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {rows.map((row, index) => (
          <View
            key={row.label}
            style={[
              styles.row,
              index < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
          >
            <Text style={[styles.rowLabel, { color: colors.subtext }]}>{row.label}</Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}

      <View style={styles.actions}>
        {isActive ? (
          <>
            <AppButton title="MARK AS USED" onPress={handleUsed} loading={busy} />
            <AppButton title="THREW IT AWAY" variant="danger" onPress={handleWasted} disabled={busy} />
          </>
        ) : (
          <AppButton title="MOVE BACK TO MY LIST" onPress={() => changeStatus("active")} loading={busy} />
        )}
        <Pressable onPress={handleDelete} disabled={busy} style={styles.delete}>
          <Text style={[styles.deleteText, { color: colors.subtext }]}>Delete (added by mistake)</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  errorTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  errorText: { fontSize: 14, textAlign: "center" },
  retry: { marginTop: 18, alignSelf: "stretch" },
  content: { padding: 20, paddingBottom: 48 },
  hero: { alignItems: "center", borderWidth: 1, borderRadius: 18, padding: 20 },
  image: { width: 120, height: 120, borderRadius: 14, backgroundColor: "#FFFFFF", marginBottom: 12 },
  placeholder: { alignItems: "center", justifyContent: "center", backgroundColor: "rgba(210, 132, 40, 0.15)" },
  name: { fontSize: 22, fontWeight: "900", textAlign: "center" },
  brand: { fontSize: 14, marginTop: 2 },
  badgeRow: { marginTop: 10 },
  status: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  statusUsed: { backgroundColor: "#DCFCE7" },
  statusWasted: { backgroundColor: "#FEE2E2" },
  statusText: { fontSize: 12, fontWeight: "800", color: Palette.primary },
  warning: { fontSize: 12, textAlign: "center", marginTop: 10 },
  card: { borderWidth: 1, borderRadius: 14, marginTop: 16, paddingHorizontal: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 13, gap: 12 },
  rowLabel: { fontSize: 14 },
  rowValue: { fontSize: 14, fontWeight: "700", flexShrink: 1, textAlign: "right" },
  actionError: { color: "#DC2626", fontWeight: "700", textAlign: "center", marginTop: 14 },
  actions: { marginTop: 22, gap: 12 },
  delete: { alignItems: "center", paddingVertical: 8 },
  deleteText: { fontSize: 13, fontWeight: "700", textDecorationLine: "underline" },
});
```

> **Why `GET /foods/:id` when the list already has the food?** The screen shows the list's copy **at once** (no spinner) and asks the server for the newest version in the background. If the list was empty or old (another phone changed it), Details still shows the truth. It is also your `GET /foods/:id` endpoint.
>
> **Why the `reloadCount` state?** "Try again" must run the effect again. Adding 1 to a number in the dependency list is the simplest way to say "run once more".
>
> **Why `headerRight` inside `useEffect`?** Week 3, Exercise 2: `setOptions` changes the header, which re-renders. Inside an effect with `[navigation, food]` it runs only when the food changes, not on every render.
>
> **Why are the handlers below the `if (!food) return …`?** Hooks must be called in the same order on every render, so all hooks are above the early return. The handlers are plain functions, not hooks, so they can be below.

### Test 11

| Do | Expected |
|---|---|
| Tap Milk on Home | Details: picture or icon, badge, rows Quantity / Category / Stored in / Expiry date / Added on; title "Milk" |
| Pencil (top right) | the form in **Edit** mode, title "Edit Food", fields filled |
| Change quantity to 2 → SAVE CHANGES | back on Details, Quantity "2 L" |
| MARK AS USED | back to Home, Milk is gone |
| Another food → THREW IT AWAY | a confirm dialog; Wasted → back to Home, the food is gone |
| Another food → "Delete (added by mistake)" | confirm → gone, and it will **not** appear in History |
| Make the first line inside `fetchFood` in `src/services/foods.ts` `throw new Error("Test");`, open a food | it still shows (list copy) + "Could not refresh: Something went wrong. Please try again." Then `git restore src/services/foods.ts`. |

```bash
git add "src/app/food/[id].tsx"
git commit -m "Add Food Details screen"
```

---

## Part 12 — Waste History

**📄 `src/app/food/history.tsx` — replace the whole file**

```tsx
// app/food/history.tsx  -  Waste History: food marked as used or wasted
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import AppButton from "@/components/app-button";
import FilterPills, { PillOption } from "@/components/filter-pills";
import FoodCard from "@/components/food-card";
import { Palette } from "@/constants/palette";
import { useFoods } from "@/context/foods-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Food } from "@/types/food";
import { getErrorMessage } from "@/utils/errors";
import { formatDate, formatQuantity } from "@/utils/food";

type HistoryFilter = "all" | "used" | "wasted";

const FILTERS: PillOption<HistoryFilter>[] = [
  { value: "all", label: "All" },
  { value: "wasted", label: "Wasted" },
  { value: "used", label: "Used" },
];

export default function WasteHistoryScreen() {
  const { colors } = useAppTheme();
  const { items, status, error, refresh, editFood } = useFoods();

  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [undoingId, setUndoingId] = useState<number | null>(null); // the row whose Undo is running
  const [actionError, setActionError] = useState<string | null>(null);

  // Derived during render (Week 5: never copy context data into useState)
  const finished = items.filter((f) => f.status !== "active");
  const usedCount = finished.filter((f) => f.status === "used").length;
  const wastedCount = finished.length - usedCount;
  const wasteRate = finished.length === 0 ? 0 : Math.round((wastedCount / finished.length) * 100);
  const visible = finished
    .filter((f) => filter === "all" || f.status === filter)
    // newest first; ISO date-times sort correctly as text
    .sort((a, b) => (b.finishedAt ?? "").localeCompare(a.finishedAt ?? ""));

  // Undo = PATCH /foods/:id { status: "active" }. The food goes back to Home.
  const handleUndo = async (food: Food) => {
    setUndoingId(food.id);
    setActionError(null);
    try {
      await editFood(food.id, { status: "active" });
    } catch (e) {
      setActionError(getErrorMessage(e));
    } finally {
      setUndoingId(null);
    }
  };

  const openFood = (food: Food) => {
    router.push({ pathname: "/food/[id]", params: { id: String(food.id) } });
  };

  // One red line: a failed Undo, or a failed refresh while the list is on screen
  const bannerError = actionError ?? (status === "error" ? error : null);

  if (status === "loading" && items.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Palette.accent} />
      </View>
    );
  }

  if (status === "error" && items.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Could not load your history</Text>
        <Text style={[styles.errorText, { color: colors.subtext }]}>{error}</Text>
        <View style={styles.retry}>
          <AppButton title="TRY AGAIN" onPress={refresh} />
        </View>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.list}
      data={visible}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <FoodCard
          food={item}
          subtitle={`${formatQuantity(item)} · ${item.status === "wasted" ? "Wasted" : "Used"} on ${formatDate(item.finishedAt)}`}
          onPress={openFood}
          right={
            <Pressable
              style={[styles.undo, { borderColor: colors.border }]}
              onPress={() => handleUndo(item)}
              disabled={undoingId !== null}
              accessibilityLabel={`Move ${item.name} back to my list`}
            >
              {undoingId === item.id ? (
                <ActivityIndicator size="small" color={Palette.accent} />
              ) : (
                <Text style={styles.undoText}>Undo</Text>
              )}
            </Pressable>
          }
        />
      )}
      refreshControl={
        <RefreshControl
          refreshing={status === "loading"}
          onRefresh={refresh}
          tintColor={Palette.accent}
          colors={[Palette.accent]}
        />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          {/* Summary: the "how much do I waste?" answer from the proposal */}
          <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, styles.used]}>{usedCount}</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Used</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, styles.wasted]}>{wastedCount}</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Wasted</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{wasteRate}%</Text>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>Waste rate</Text>
            </View>
          </View>

          <FilterPills options={FILTERS} selected={filter} onSelect={setFilter} />

          {bannerError ? (
            <Text style={[styles.banner, { color: colors.danger }]}>{bannerError}</Text>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <Text style={[styles.empty, { color: colors.subtext }]}>
          {finished.length === 0
            ? "Nothing here yet.\nFood you mark as used or wasted appears here."
            : "No food in this filter."}
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  errorTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  errorText: { fontSize: 14, textAlign: "center" },
  retry: { marginTop: 18, alignSelf: "stretch" },
  list: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 12, gap: 12 },
  summary: { flexDirection: "row", borderWidth: 1, borderRadius: 16, paddingVertical: 16 },
  stat: { flex: 1, alignItems: "center" },
  statNumber: { fontSize: 26, fontWeight: "900" },
  statLabel: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  used: { color: "#15803D" },
  wasted: { color: "#B91C1C" },
  banner: { fontSize: 13, fontWeight: "600" },
  undo: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 60,
    alignItems: "center",
  },
  undoText: { color: Palette.accent, fontWeight: "800", fontSize: 12 },
  empty: { textAlign: "center", marginTop: 40, fontSize: 14, lineHeight: 20 },
});
```

> **Why is the waste rate calculated on the phone?** It is derived from the list you already have, so it is always in sync after an Undo. Member 3's `GET /foods/stats` will do the full statistics on the server; this screen only shows a quick summary.
>
> **Why `undoingId` and not one `isUndoing` boolean?** The spinner must appear on **the row you tapped**, not on every row. Storing the id says which one.
>
> **Why `finally { setUndoingId(null) }`?** It runs after success **and** after failure, so the buttons are never stuck disabled.

### Test 12

| Do | Expected |
|---|---|
| Home → clock icon | Waste History: Used / Wasted / Waste rate numbers, newest first |
| Pills **Wasted** / **Used** | only that kind |
| Undo on a row | small spinner on that row, then it disappears here and is back on Home |
| Tap a row | Details with a "Used" / "Wasted" chip, "Used on …", and MOVE BACK TO MY LIST |
| Nothing finished yet | "Nothing here yet. Food you mark as used or wasted appears here." |

```bash
git add "src/app/food/history.tsx"
git commit -m "Add Waste History screen"
```

---

## Part 13 — Final checks, pull request and hand-off

### 13.1 Quality checks

```bash
npx tsc --noEmit        # must print nothing
npx expo lint           # must show 0 errors
```

Lint shows **8 warnings**, all `import/no-named-as-default-member` ("`axios` also has a named export `create`"): 2 in Ayan's `api.ts`, 2 in his `errors.ts`, 4 in your `open-food-facts.ts`. They are style hints, not bugs. The code uses `axios.create` like the official Axios docs and like Ayan, so the team style stays the same.

### 13.2 Acceptance criteria (for your midterm report, CO1)

| Feature | Done when |
|---|---|
| Add and store food items | A food can be added by hand or from an Open Food Facts result. Invalid input shows a message under the field and nothing is sent. A saved food appears on Home at once and is still there after an app restart (it is on the server). Edit saves the changes. |
| Search and filter | Typing filters by name, brand or category. The pills filter by fridge / freezer / pantry. The list is sorted by expiry date with the correct colour (red ≤ today, orange ≤ 2 days, green, grey = no date). |
| Mark used or wasted | "Mark as used" / "Threw it away" removes the food from Home and shows it in Waste History with the date. The numbers and waste rate update. Undo brings it back. "Delete" removes it without counting it. |
| Product search (Open Food Facts) | Name and barcode search work. An unknown barcode shows "No products found". No internet shows a clear message and Try again. Picking a product fills the form. |
| Loading / error / success | Every screen shows a spinner while waiting, a clear message when the API fails (with Try again where it makes sense), and the result when it works. |

### 13.3 Push and open the pull request

```bash
git push -u origin feature/food-items
```

On GitHub open a pull request **`feature/food-items` → `main`**. Put the screen table from the Overview in the description, and ask **Ayan or Shourov** to review it. Do not merge your own pull request.

### 13.4 Hand-off

| Who | What they use from your part |
|---|---|
| **Shourov (Member 3)** | `const { items } = useFoods();` gives every food with `status`, `expiryDate`, `finishedAt`. Recipes: `items.filter(f => f.status === "active")`. Alerts: `daysUntil(f.expiryDate)` from `@/utils/food`. Statistics: count `used` / `wasted`. |
| **Ayan (Member 2)** | Your 2 edits in `app/_layout.tsx` and the 2 lines in `local-backend/index.ts`. Still open: what happens to food when its category is deleted? Your screens show "Other", and saving such a food shows the backend's 400 message, so nothing breaks. |
| **Shourov (Member 3), local backend** | His `/notifications` and `/foods/stats` can be added for the midterm like yours: a new `local-backend/<name>.ts` that returns `null` for other paths + 2 lines in `index.ts`. |
| **Backend (final term)** | The API contract in the Overview, section 7. `local-backend/foods.ts` is a working example of every rule. When the real API is ready, put its address in `.env.local` as `EXPO_PUBLIC_API_URL=…` and restart with `npx expo start -c`. The local backend switches itself off. |

### 13.5 Viva questions you can now answer

| Question | Short answer |
|---|---|
| Where is the data saved in the midterm? | In AsyncStorage on the phone, through a local backend that answers the same URLs, JSON and error codes as the real API will. |
| What is an Axios adapter, and why replace only that? | The part of Axios that really sends the request. Swapping only it keeps every layer above (interceptors, error handling, services, contexts, screens) real, so the final term only changes one `.env.local` line. |
| Why does the local backend run requests one at a time? | Each route reads a table, changes it and writes it back. Two at once would both read the old table and the second write would erase the first (a lost update). |
| Why does the local backend validate again when the form already does? | A server must never trust the client. The form's checks are for UX; the backend's checks protect the data. |
| Why does Open Food Facts have its own Axios instance? | `api` adds our login token to every request. The token must never go to a third-party server. |
| Why search only when Search is pressed? | OFF allows 10 searches per minute. Search-as-you-type would hit that limit after a few words. The cache also saves repeated searches. |
| What does `cancelled` do in Find Product and Details? | The effect's cleanup sets it. An old request that finishes late (after leaving the screen or after a newer search) does not update the state. |
| How does the product get from Find Product to the form? | As route params (`router.replace({ pathname: "/food/form", params })`), read with `useLocalSearchParams()`. Params are always strings. |
| Why `router.replace` there? | So Back from the form goes to Home, not to old search results. |
| Why is the date stored as `"YYYY-MM-DD"`? | JSON has no date type, it sorts correctly as text, and comparing with `<` works. |
| Why `parseDate` and not `new Date("2026-11-25")`? | The latter is UTC midnight, which can be the previous day locally. |
| Why one list for active, used and wasted food? | One request loads Home and History. Both are derived with `filter`, so they can never disagree. Member 3 can read it too. |
| Why does the list change only after the server answers? | `dispatch` runs after `await`. If the server fails, the screen shows the error and the list stays correct. |
| Why is `FilterPills` generic? | One component for 5 uses; TypeScript checks the value type for each use. |
| Why the lazy initializer `useState(() => ...)`? | The form is filled from the product / the food only on the first render. |
| What is the difference between Delete and Threw it away? | Delete = a mistake, not counted. Threw it away = wasted, counted in statistics. |
| How does dark mode reach your screens? | Every screen reads `colors` from Ayan's `useAppTheme()`. |
| How is a logged-out user kept out of `/food/12`? | The `food` stack is declared inside `Stack.Protected guard={signedIn}` in the root layout. |

---

## Quick reference: common errors

| Problem | Cause and fix |
|---|---|
| `Cannot find module 'axios'` (or `expo-secure-store` …) | Part 0.4 was not done on this computer. Run `npm install` after pulling. |
| Red underline on `"/food/..."` | The route file does not exist yet, or the route types are old. Create the file, then `npx expo start`. |
| Product search works on the phone but not in the browser | Expected: `search.openfoodfacts.org` blocks browser calls from `localhost` (CORS). Barcode search works in both. |
| "Open Food Facts is busy right now" | You hit the rate limit (10 searches / minute). Wait one minute. |
| `Network Error` on every request | `.env.local` has an `EXPO_PUBLIC_API_URL` line, so the local backend is off and the app looks for a real server. Delete the line (or empty the file) and restart with `npx expo start -c`. |
| "I registered on my phone, but the browser says wrong password" | Expected. Every phone and every browser has its **own** local data. Register on each one. |
| All users and foods are gone | The data lives in Expo Go's storage on that device. Uninstalling Expo Go or clearing its data (or clearing the browser's site data) deletes it. Register again. |
| `useFoods must be used inside a FoodsProvider` | `<FoodsProvider>` is missing or outside `<AuthProvider>` in `app/_layout.tsx` (Part 6B). |
| The keyboard closes after each letter in Home search | `ListHeaderComponent` must be a JSX element `<View>…</View>`, not a component function. |
| No category pills in the form | Categories did not load. Pull to refresh on Ayan's Manage Categories screen. |
| `400 categoryId must be one of your categories` | The category was deleted. Pick another one. |
| A product picture does not show | The picture comes from the internet. Without a connection the card shows the icon instead. |
| `typedRoutes` error on `router.push({ pathname: "/food/[id]", params: { id: food.id } })` | Params must be strings: `String(food.id)`. |
