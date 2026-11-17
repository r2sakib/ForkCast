# FORKCAST — Member 2 Frontend Guide
**Accounts and Categories** · Mosabbir Hossain Ayan (23-52949-2) · Mobile App Development (React Native + Expo SDK 54)

This is your step-by-step coding guide. Every Part ends with **Test** and **Commit**, so you can push after each one.
The code style follows your lab manuals: `StyleSheet`, `useState` forms with live validation in `useEffect` (Week 4), `useReducer` + `useContext` + custom hook (Week 5), Expo Router groups, `Stack` and `Tabs` (Week 3).

All the code below was built and checked in a clean SDK 54 project: `tsc --noEmit` passes, `expo lint` passes, the Android bundle builds, and the mock API was tested with curl.

---

## What you are building

| Screen | Route file | Feature | API |
|---|---|---|---|
| Welcome | `app/(auth)/index.tsx` | First screen for logged-out users | none |
| Register | `app/(auth)/register.tsx` | Create account (JWT) | `POST /auth/register` |
| Login | `app/(auth)/login.tsx` | Log in, stay logged in after restart | `POST /auth/login`, `GET /auth/me` |
| Settings | `app/(tabs)/settings.tsx` | Dark mode, reminders switch, logout | none (saved on the phone) |
| Manage Categories | `app/categories.tsx` | Add and delete your own categories | `GET / POST / DELETE /categories` |

The proposal says you need at least 4 screens, 2 features and 2 endpoints. You have 4 screens (+ Welcome), 2 features, and 6 endpoint calls.

**Shared pieces you also build** (your teammates will use them): the Axios client with token, the login state (`useAuth`), the theme (`useAppTheme`), the settings (`useSettings`), the categories list (`useCategories`), and the root layout with the login guard.

## Your design (from the image you gave me)

Your image is the **UI design** (PNG, not JPG). I used these parts of it:

- **Colours:** `381A0B`, `613117`, `FF7026`, `C16A3C`, `2A2D3F`, `D28428` → `constants/palette.ts`
- **Login / Sign Up screens:** orange background, cake pattern at the bottom, brown bordered fields. I **cropped the cake pattern from the bottom of your Log In screen** and saved it as `auth-pattern.png` (I give you this file next to this guide). You cannot use the whole image as a background because the text and buttons are baked into it.
- **Welcome screen:** the dark brown screen with the orange title box and the two buttons.
- **Settings:** the "My Place" profile style: dark header, avatar circle, white sheet with rounded corners.
- **Tab bar:** dark `2A2D3F` footer with orange icons.

The search, product list and product detail screens in the design are not part of your 4 screens, so I did not build them.

---

## How to use this guide

1. Do the Parts **in order**. Each Part leaves the app in a working state.
2. Create each file in VS Code (right-click folder → New File; typing `services/api.ts` creates the folder too).
3. **Type, or at least read every line.** The "Why" notes explain the mechanism. You will need them for the viva (CO3/CO4).
4. After every Part: run the **Test**, then **Commit**.
5. Paths are relative to the **Expo project root** (the folder with `app.json` and `package.json`).

> **Red underline on a route like `"/register"`?** The Expo template has `typedRoutes` turned on. A route that does not exist yet is underlined red until you create its file. It is expected in Parts 6, 7 and 9. It disappears when the file exists. If it stays, press `Ctrl+C` and run `npx expo start` again so the route types are regenerated.

### Final folder structure (files you add or change)

```text
mock-api/server.js                  # fake API for testing (Part 2)
assets/images/auth-pattern.png      # cake pattern (Part 0)
docs/design/ui-design.png           # your design image, for reference (Part 0)
.env.local                          # API address (Part 2, not pushed to git)

constants/palette.ts                # colours + light / dark theme
types/index.ts                      # User, Category, AuthResponse
utils/                              # validation.ts, errors.ts, confirm.ts, categories.ts
services/                           # storage.ts, api.ts, auth.ts, categories.ts
context/                            # auth-*, settings-*, categories-*  (reducer + context)
hooks/use-app-theme.ts
components/                         # app-button, form-field, auth-background, settings-row, category-row

app/_layout.tsx                     # providers + login guard
app/(auth)/_layout.tsx
app/(auth)/index.tsx                # Welcome
app/(auth)/login.tsx
app/(auth)/register.tsx
app/(tabs)/_layout.tsx              # shared with the team (see Part 5 note)
app/(tabs)/home.tsx                 # placeholder, Member 1 replaces
app/(tabs)/alerts.tsx               # placeholder, Member 3 replaces
app/(tabs)/settings.tsx
app/categories.tsx
```

> ⚠️ **The Expo template already has `constants/theme.ts`.** Do not overwrite it. Your colours go in `constants/palette.ts`.

---

## Decisions to agree with your team before you push

| # | Topic | What this guide does | Why |
|---|---|---|---|
| 1 | State management | `useReducer` + `useContext` (Week 5), plain `useState` forms (Week 4) | That is what the course taught and what you are asked about in the viva. `PROJECT_GUIDE.md` mentions Zustand, React Hook Form and Zod. Those are not in your labs, so I did not use them. Tell your teammates so the whole app uses one style. |
| 2 | New packages | `axios`, `expo-secure-store`, `@react-native-async-storage/async-storage`, `expo-linear-gradient` | Axios is needed for the API (guide section 5). Secure-store keeps the token safely. AsyncStorage keeps the settings (the proposal's feature definition names it). Linear-gradient fades the cake picture. |
| 3 | Folder layout | Lab layout: `app/`, `components/` ... at the project root, import alias `@/` | Your labs and the SDK 54 template do it this way. `PROJECT_GUIDE.md` shows `src/app`. Keep whatever the repo already uses. |
| 4 | Custom categories in the database | The API must let each user own categories | The ER diagram's `CATEGORY` table has no `user_id`. For **custom** categories the backend needs a nullable `user_id` (null = the 9 default categories). Ask your backend teammate. See "API contract" in Part 11. |
| 5 | Password rule | Minimum 6 characters | Make the backend `ValidationPipe` use the same rule. |

---

## Part 0 — Project, branch and packages

### 0.1 Get the project

**Case A: the Expo project is already in the team repo** (`r2sakib/forkcast`)

```bash
git clone https://github.com/r2sakib/forkcast.git
cd forkcast            # if there is a mobile/ folder, cd mobile
git checkout -b feature/accounts-categories
npm install
```

**Case B: nobody has created it yet.** Tell the team first, so only one project is pushed. Then create it exactly like your Week 1 lab:

```bash
npx create-expo-app@latest forkcast --template default@sdk54
cd forkcast
git checkout -b feature/accounts-categories
```

> **Keep `@sdk54`.** The newest Expo template on npm is SDK 58 today. Your course uses SDK 54 and the matching Expo Go app, so a newer template will not open on your phone.

### 0.2 Install the packages

```bash
npx expo install axios expo-secure-store @react-native-async-storage/async-storage expo-linear-gradient
```

| Package | What it is for |
|---|---|
| `axios` | Calls the REST API |
| `expo-secure-store` | Keeps the login token encrypted on the phone |
| `@react-native-async-storage/async-storage` | Keeps the dark mode and reminders settings |
| `expo-linear-gradient` | Fades the top of the cake picture into the orange |

`npx expo install` picks the version that matches SDK 54, which is why we use it instead of `npm install`.

### 0.3 Add the design files

1. Create the folder `assets/images/` if it is missing and put **`auth-pattern.png`** (the file I gave you) inside.
2. Create `docs/design/` and save your design image there as **`ui-design.png`**. It is only a reference for the team.

### 0.4 Test

```bash
npx expo start
```

Scan the QR code. You should see the normal template screen. Stop the server with `Ctrl+C`.

### 0.5 Commit

```bash
git add .
git commit -m "Add packages and design assets for accounts and categories"
git push -u origin feature/accounts-categories
```

---

## Part 1 — Colours, types and helper functions

These files have no screens yet. They are pure TypeScript, so they are easy to test.

### 1A. Palette and types
**📄 `constants/palette.ts` — create this file**

```ts
// constants/palette.ts
// Colours taken from the design file (Primary, Secondary, Buttons, Muted, BG 2).
// NOTE: the Expo template already has constants/theme.ts - do not overwrite it.

export const Palette = {
  primary: "#381A0B", // darkest brown
  secondary: "#613117", // text brown
  accent: "#FF7026", // buttons / highlights
  muted: "#C16A3C", // muted details
  footer: "#2A2D3F", // dark navy: footer, headers
  gold: "#D28428", // brand orange
  // The orange of the auth-pattern.png picture. It is a tiny bit different from
  // the design's D28428, so we use the picture's own colour to make the edges blend.
  authBackground: "#D78829",
};

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  subtext: string;
  border: string;
  inputBackground: string;
  header: string;
  tint: string;
  danger: string;
}

export const LightColors: ThemeColors = {
  background: "#F7F4F0",
  surface: "#FFFFFF",
  text: Palette.primary,
  subtext: "#8A6A55",
  border: "#E8DDD3",
  inputBackground: "#F1EBE4",
  header: Palette.footer,
  tint: Palette.accent,
  danger: "#DC2626",
};

export const DarkColors: ThemeColors = {
  background: "#1B1D2B",
  surface: Palette.footer,
  text: "#F3E6D8",
  subtext: "#B9A593",
  border: "#3C4058",
  inputBackground: "#1F2132",
  header: Palette.footer,
  tint: Palette.accent,
  danger: "#F87171",
};
```
**📄 `types/index.ts` — create this file**

```ts
// types/index.ts
// Shapes of the data that come from the REST API (camelCase, see PROJECT_GUIDE section 7).

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  // true = created by the user. The API may not send it, see utils/categories.ts
  isCustom?: boolean;
}
```
> **Why `ThemeColors`, `LightColors`, `DarkColors`?** Dark mode needs every screen to read its colours from one place. Later `useAppTheme()` returns `LightColors` or `DarkColors`, and the whole app changes when the switch changes. Fixed brand colours (`Palette.*`) never change between modes.

**Commit 1A**

```bash
git add constants/palette.ts types/index.ts
git commit -m "Add colour palette with light and dark themes, and API types"
```

### 1B. Helpers
**📄 `utils/categories.ts` — create this file**

```ts
// utils/categories.ts
import { Category } from "@/types";

// The 9 fixed categories from the ER diagram (CATEGORY.name)
export const DEFAULT_CATEGORY_NAMES = [
  "Dairy",
  "Vegetables",
  "Fruits",
  "Meat",
  "Fish",
  "Eggs",
  "Rice and Grains",
  "Bakery",
  "Other",
];

// A category is custom when the API says so. If the API does not send
// isCustom, we treat every name that is not in the default list as custom.
export function isCustomCategory(category: Category): boolean {
  return category.isCustom ?? !DEFAULT_CATEGORY_NAMES.includes(category.name);
}
```
**📄 `utils/errors.ts` — create this file**

```ts
// utils/errors.ts
import axios from "axios";

// Turns any error into one readable sentence for the screen.
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (axios.isAxiosError(error)) {
    // No response at all = the phone could not reach the API
    if (!error.response) {
      return "Cannot reach the server. Check your Wi-Fi and the API address.";
    }
    // NestJS sends { statusCode, message, error }; message can be a string or a list
    const message = (error.response.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(message)) return message.join("\n");
    if (typeof message === "string") return message;
  }
  return fallback;
}

// HTTP status of a failed request (400, 401, 409 ...) or undefined
export function getStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}
```
**📄 `utils/confirm.ts` — create this file**

```ts
// utils/confirm.ts
import { Alert, Platform } from "react-native";

// Alert.alert does nothing on the web version, so use window.confirm there.
export function confirmAction(
  title: string,
  message: string,
  confirmText: string,
  onConfirm: () => void
) {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: confirmText, style: "destructive", onPress: onConfirm },
  ]);
}
```
**📄 `utils/validation.ts` — create this file**

```ts
// utils/validation.ts
// Pure validation functions (same idea as validateForm in the Week 4 lab),
// moved here so Login, Register and Categories can share them.
import { Category } from "@/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Login ──────────────────────────────────────────────
export interface LoginData {
  email: string;
  password: string;
}
export interface LoginErrors {
  email?: string;
  password?: string;
}

export function validateLogin(data: LoginData): LoginErrors {
  const errors: LoginErrors = {};

  if (data.email.trim().length === 0) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(data.email.trim())) {
    errors.email = "Enter a valid email, e.g. nila@example.com";
  }

  if (data.password.length === 0) {
    errors.password = "Password is required.";
  }

  return errors;
}

// ── Register ───────────────────────────────────────────
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}
export interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
}

export function validateRegister(data: RegisterData): RegisterErrors {
  const errors: RegisterErrors = {};

  if (data.name.trim().length === 0) {
    errors.name = "Name is required.";
  } else if (data.name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters.";
  }

  if (data.email.trim().length === 0) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(data.email.trim())) {
    errors.email = "Enter a valid email, e.g. nila@example.com";
  }

  if (data.password.length === 0) {
    errors.password = "Password is required.";
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  return errors;
}

// ── Category name ──────────────────────────────────────
export function validateCategoryName(name: string, existing: Category[]): string | undefined {
  const clean = name.trim();
  if (clean.length === 0) return "Category name is required.";
  if (clean.length < 2) return "Name must be at least 2 characters.";
  if (clean.length > 30) return "Name must be 30 characters or less.";

  // Block duplicates (ignore upper / lower case), same idea as Week 5 Feature 3
  const lower = clean.toLowerCase();
  if (existing.some((c) => c.name.toLowerCase() === lower)) {
    return "This category already exists.";
  }
  return undefined;
}
```
> **Why is validation in `utils/` and not inside the screen?** In Week 4 `validateForm` was a **pure function** (data in, errors out, no React). Keeping it that way means Login and Register share the email rule, and you can test it without a screen.
>
> **Why `getErrorMessage`?** The server can fail in three ways: no connection (Axios gets no `response`), a validation error (NestJS sends `message` as a **list**), or a single message. One helper turns all of them into one sentence, so no screen repeats this logic.
>
> **Why `confirmAction`?** `Alert.alert` does nothing on the web version. This helper uses `window.confirm` there, so you can still test in the browser if you do not have the phone with you.

### Test 1

Open `app/(tabs)/index.tsx` (the template screen) and add these lines **under the imports**. They are temporary.

```ts
import { validateCategoryName, validateLogin, validateRegister } from "@/utils/validation";
import { isCustomCategory } from "@/utils/categories";

console.log("V1", validateRegister({ name: "Al", email: "nila@", password: "123" }));
console.log("V2", validateRegister({ name: "Nila", email: "nila@example.com", password: "secret123" }));
console.log("V3", validateCategoryName("dairy", [{ id: 1, name: "Dairy" }]));
console.log("V4", validateLogin({ email: "", password: "" }));
console.log("V5", validateCategoryName("Spices", [{ id: 1, name: "Dairy" }]));
console.log("C1", isCustomCategory({ id: 1, name: "Dairy" }), isCustomCategory({ id: 9, name: "Spices" }));
```

Run `npx expo start`, open the app, and read the terminal. You must see:

```text
V1 { name: 'Name must be at least 3 characters.',
     email: 'Enter a valid email, e.g. nila@example.com',
     password: 'Password must be at least 6 characters.' }
V2 {}
V3 This category already exists.
V4 { email: 'Email is required.', password: 'Password is required.' }
V5 undefined
C1 false true
```

Also run `npx tsc --noEmit`. It must print nothing.

**Remove the temporary lines** (`git restore "app/(tabs)/index.tsx"`), then:

```bash
git add utils
git commit -m "Add validation, error message, confirm and category helpers"
git push
```

---

## Part 2 — Mock API (so you can test before the backend is ready)

Your backend teammate may not be finished. This tiny Node server fakes **only your 6 endpoints** with the same URLs and error shapes as `PROJECT_GUIDE.md` section 7. It needs **no packages**. Your app code does not change when the real API replaces it. Only the URL in `.env.local` changes.

**📄 `mock-api/server.js` — create this file**

```js
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
```
### Tell the app where the API is

Create **`.env.local`** in the project root (this name is already in the template's `.gitignore`, so it is not pushed):

```text
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

- Testing in the **browser** (press `w`): `localhost` is correct.
- Testing on your **phone**: `localhost` is the phone itself. Use your laptop's Wi-Fi address. On Windows run `ipconfig` and copy the **IPv4 Address**, for example:

```text
EXPO_PUBLIC_API_URL=http://192.168.0.105:3000/api
```

> **Why `EXPO_PUBLIC_`?** Expo only copies environment variables with this prefix into the app code. Anything else is invisible to the app. It is not secret (everyone can read the app code), so never put passwords there.
>
> After you change `.env.local`, restart with `npx expo start -c` (the `-c` clears the cache, otherwise the old value stays).

### Test 2

**Terminal A**

```bash
node mock-api/server.js
```

You see `Mock API running on http://localhost:3000/api`.

**Phone check:** open `http://YOUR_IP:3000/api/health` in the phone's browser. You must see `{"status":"ok"}`. If it does not load, Windows Firewall is blocking Node: allow it on **private networks**, and make sure the phone and laptop are on the same Wi-Fi.

**Terminal B** (use Git Bash or VS Code's bash terminal. In PowerShell write `curl.exe`, not `curl`):

```bash
B=http://localhost:3000/api
curl -s -X POST $B/auth/register -H 'Content-Type: application/json' -d '{"name":"Nila","email":"nila@example.com","password":"secret123"}'
curl -s -w ' [%{http_code}]' -X POST $B/auth/register -H 'Content-Type: application/json' -d '{"name":"Nila","email":"nila@example.com","password":"secret123"}'
curl -s -w ' [%{http_code}]' -X POST $B/auth/login -H 'Content-Type: application/json' -d '{"email":"nila@example.com","password":"wrong"}'
curl -s -H 'Authorization: Bearer mock-token-1' $B/auth/me
curl -s -H 'Authorization: Bearer mock-token-1' $B/categories
```

| Request | Must return |
|---|---|
| register (first time) | `{"token":"mock-token-1","user":{"id":1,"name":"Nila","email":"nila@example.com"}}` |
| register (same email) | `409` and `Email already registered` |
| login with wrong password | `401` and `Invalid email or password` |
| `/auth/me` with the token | `{"id":1,"name":"Nila","email":"nila@example.com"}` |
| `/categories` | a list of the 9 default categories with `"isCustom":false` |

> The mock server keeps data **in memory**. When you stop it, all users and categories are gone. After every restart, register `nila@example.com` again (first curl line).

### Commit

```bash
git add mock-api
git commit -m "Add mock API for testing accounts and categories without the backend"
git push
```

---

## Part 3 — Services: storage and API client

Services are plain functions that talk to the phone storage or the API. Screens never call Axios directly.

**📄 `services/storage.ts` — create this file**

```ts
// services/storage.ts
// Everything that is saved on the phone lives here.
//  - the login token  -> expo-secure-store (encrypted). Not available on web, so web uses AsyncStorage.
//  - the settings     -> AsyncStorage (plain, not secret)
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "forkcast_token";
const PREFS_KEY = "forkcast_prefs";
const isWeb = Platform.OS === "web";

// ── Token ──────────────────────────────────────────────
export async function saveToken(token: string): Promise<void> {
  if (isWeb) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (isWeb) return AsyncStorage.getItem(TOKEN_KEY);
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken(): Promise<void> {
  if (isWeb) await AsyncStorage.removeItem(TOKEN_KEY);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ── Settings (dark mode, reminders switch) ─────────────
export interface Prefs {
  darkMode: boolean;
  remindersEnabled: boolean;
}

export async function loadPrefs(): Promise<Partial<Prefs> | null> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as Partial<Prefs>) : null;
  } catch {
    return null; // broken or missing data -> use the defaults
  }
}

export async function savePrefs(prefs: Prefs): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // saving a setting must never crash the app
  }
}
```
**📄 `services/api.ts` — create this file**

```ts
// services/api.ts
// The one Axios instance for the whole app. Every request goes through it.
import axios from "axios";
import { getToken } from "./storage";

// On a real phone "localhost" is the phone itself, so set the laptop's Wi-Fi IP in .env.local
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // give up after 10 seconds
  headers: { "Content-Type": "application/json" },
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
**📄 `services/auth.ts` — create this file**

```ts
// services/auth.ts
// One function per endpoint: POST /auth/register, POST /auth/login, GET /auth/me
import { AuthResponse, User } from "@/types";
import { api } from "./api";

export async function registerRequest(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", { name, email, password });
  return response.data;
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", { email, password });
  return response.data;
}

export async function fetchMe(): Promise<User> {
  const response = await api.get<User>("/auth/me");
  return response.data;
}
```
**📄 `services/categories.ts` — create this file**

```ts
// services/categories.ts
// GET /categories, POST /categories, DELETE /categories/:id
import { Category } from "@/types";
import { api } from "./api";

export async function fetchCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>("/categories");
  return response.data;
}

export async function createCategory(name: string): Promise<Category> {
  const response = await api.post<Category>("/categories", { name });
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`);
}
```
> **Why SecureStore for the token and AsyncStorage for the settings?** AsyncStorage is plain text on the phone. A login token is a key to the account, so it goes to SecureStore (Keychain on iOS, encrypted storage on Android). Dark mode is not secret, so AsyncStorage is enough. SecureStore does not exist on the web, so `storage.ts` uses AsyncStorage there. That is only for testing in the browser.
>
> **Why an Axios *interceptor*?** An interceptor is a function Axios runs for **every** request. The request interceptor reads the token and adds `Authorization: Bearer <token>` automatically. If you added the header by hand in every call, one forgotten call would be a 401 bug. It reads the token **at the moment of the request** (not once at startup), so a fresh login works immediately.
>
> **Why the 401 handler, and why skip `/auth/login`?** If the token expires, any call returns 401, and the app must go back to Login. The handler does that from one place. But a **wrong password** also returns 401 on `/auth/login`. That is a normal error to show on the form, not an expired session, so it is excluded.
>
> **Why `setUnauthorizedHandler` and not an import of the auth context?** `api.ts` is not a React component, so it cannot use hooks. The context hands it a function when it starts. This also avoids a circular import (api → context → api).

### Test 3

With the mock API running (Terminal A) and `.env.local` correct, add this **temporarily** to the template screen `app/(tabs)/index.tsx`: the imports at the top, the `useEffect` inside the component.

```ts
import { useEffect } from "react";
import { api } from "@/services/api";
import { clearToken, getToken, saveToken } from "@/services/storage";
import { getStatus } from "@/utils/errors";

// inside the component:
useEffect(() => {
  async function test() {
    const health = await api.get("/health");
    console.log("T1 health:", health.data);
    await saveToken("abc");
    console.log("T2 token:", await getToken());
    await clearToken();
    console.log("T3 token after clear:", await getToken());
    try {
      await api.get("/auth/me");
    } catch (e) {
      console.log("T4 status without token:", getStatus(e));
    }
  }
  test().catch((e) => console.log("test failed:", e.message));
}, []);
```

Expected in the terminal:

```text
T1 health: { status: 'ok' }
T2 token: abc
T3 token after clear: null
T4 status without token: 401
```

If you see `test failed: Network Error`, the API address is wrong. Check `.env.local`, restart with `npx expo start -c`, and re-test the phone-browser check from Part 2.

Remove the temporary code (`git restore "app/(tabs)/index.tsx"`), then:

```bash
git add services
git commit -m "Add storage and Axios API client with token and 401 handling"
git push
```

---

## Part 4 — State: auth, settings, categories

Same pattern as Week 5: a **reducer** (pure, no React) + a **context** with a provider and a custom hook with a guard.

### 4A. Auth state
**📄 `context/auth-reducer.ts` — create this file**

```ts
// context/auth-reducer.ts
// Pure TypeScript, no React imports (same as students-reducer.ts in Week 5).
import { User } from "@/types";

// "loading" = we are still checking if a saved token exists
export type AuthStatus = "loading" | "signedOut" | "signedIn";

export interface AuthState {
  status: AuthStatus;
  user: User | null;
}

export const initialAuthState: AuthState = { status: "loading", user: null };

export type AuthAction = { type: "SIGN_IN"; payload: User } | { type: "SIGN_OUT" };

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SIGN_IN":
      return { status: "signedIn", user: action.payload };
    case "SIGN_OUT":
      return { status: "signedOut", user: null };
    default:
      return state;
  }
}
```
**📄 `context/auth-context.tsx` — create this file**

```tsx
// context/auth-context.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { setUnauthorizedHandler } from "@/services/api";
import { fetchMe, loginRequest, registerRequest } from "@/services/auth";
import { clearToken, getToken, saveToken } from "@/services/storage";
import { User } from "@/types";
import { getStatus } from "@/utils/errors";
import { AuthStatus, authReducer, initialAuthState } from "./auth-reducer";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const logout = useCallback(async () => {
    await clearToken();
    dispatch({ type: "SIGN_OUT" });
  }, []);

  // 1) App start: is there a saved token? If yes, ask the API who we are (GET /auth/me)
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const token = await getToken();
        if (!token) {
          if (!cancelled) dispatch({ type: "SIGN_OUT" });
          return;
        }
        const user = await fetchMe();
        if (!cancelled) dispatch({ type: "SIGN_IN", payload: user });
      } catch (error) {
        // Only delete the token when the API says it is invalid (401).
        // If the server is just unreachable, keep it for the next start.
        if (getStatus(error) === 401) await clearToken();
        if (!cancelled) dispatch({ type: "SIGN_OUT" });
      }
    }

    restoreSession();
    return () => {
      cancelled = true; // cleanup, same idea as clearTimeout in Week 4
    };
  }, []);

  // 2) If any request gets 401 later (token expired), log out automatically
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await loginRequest(email, password);
    await saveToken(token);
    dispatch({ type: "SIGN_IN", payload: user });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { token, user } = await registerRequest(name, email, password);
    await saveToken(token);
    dispatch({ type: "SIGN_IN", payload: user });
  }, []);

  const value = useMemo(
    () => ({ status: state.status, user: state.user, login, register, logout }),
    [state.status, state.user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
}
```
> **Why a `status` of `"loading"`?** When the app starts we do not know yet if a saved login exists. Without a third state, the app would show Login for a moment and then jump to Home (a flash). `"loading"` lets the root layout wait.
>
> **Why the `cancelled` flag in the first `useEffect`?** It is the same idea as `clearTimeout` in your Week 4 submit effect. If the provider unmounts while `getToken` or `fetchMe` is still waiting, we must not dispatch afterwards. The cleanup function sets `cancelled = true`, and the async function checks it.
>
> **Why `[]` as the dependency array?** Restoring the session must happen **once**, when the app starts. With no array it would run after every render.
>
> **Why delete the token only on 401?** If the server is simply unreachable (no Wi-Fi), the token is still good. Deleting it would log the user out only because the internet was off.
>
> **Why `useCallback` + `useMemo`?** Context users re-render when `value` changes identity. `useMemo` keeps the same object until something really changes. `useCallback` keeps the function identities stable for the same reason.

### Test 4A

Temporary lines in the template screen:

```ts
import { authReducer, initialAuthState } from "@/context/auth-reducer";

const a = authReducer(initialAuthState, { type: "SIGN_IN", payload: { id: 1, name: "Nila", email: "n@x.com" } });
console.log("R1", a.status, a.user?.name);
console.log("R2", authReducer(a, { type: "SIGN_OUT" }));
```

Expected: `R1 signedIn Nila` and `R2 { status: 'signedOut', user: null }`. Run `npx tsc --noEmit` (nothing printed). Remove the lines, then:

```bash
git add context/auth-reducer.ts context/auth-context.tsx
git commit -m "Add auth reducer and AuthProvider with session restore and 401 logout"
git push
```

### 4B. Settings state and the theme hook
**📄 `context/settings-reducer.ts` — create this file**

```ts
// context/settings-reducer.ts
export interface SettingsState {
  darkMode: boolean;
  remindersEnabled: boolean;
  loaded: boolean; // true after the saved settings were read from the phone
}

export const initialSettingsState: SettingsState = {
  darkMode: false,
  remindersEnabled: true,
  loaded: false,
};

export type SettingsAction =
  | { type: "LOAD"; payload: { darkMode?: boolean; remindersEnabled?: boolean } }
  | { type: "SET_DARK_MODE"; payload: boolean }
  | { type: "SET_REMINDERS"; payload: boolean };

export function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case "LOAD":
      return { ...state, ...action.payload, loaded: true };
    case "SET_DARK_MODE":
      return { ...state, darkMode: action.payload };
    case "SET_REMINDERS":
      return { ...state, remindersEnabled: action.payload };
    default:
      return state;
  }
}
```
**📄 `context/settings-context.tsx` — create this file**

```tsx
// context/settings-context.tsx
import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { loadPrefs, savePrefs } from "@/services/storage";
import { initialSettingsState, settingsReducer } from "./settings-reducer";

interface SettingsContextValue {
  darkMode: boolean;
  remindersEnabled: boolean;
  loaded: boolean;
  setDarkMode: (value: boolean) => void;
  setRemindersEnabled: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, initialSettingsState);

  // Read the saved settings once, when the app starts
  useEffect(() => {
    loadPrefs().then((prefs) => dispatch({ type: "LOAD", payload: prefs ?? {} }));
  }, []);

  // Save again every time a setting changes (but not before the first load finished,
  // otherwise we would overwrite the saved values with the defaults)
  useEffect(() => {
    if (!state.loaded) return;
    savePrefs({ darkMode: state.darkMode, remindersEnabled: state.remindersEnabled });
  }, [state.loaded, state.darkMode, state.remindersEnabled]);

  const value = useMemo(
    () => ({
      darkMode: state.darkMode,
      remindersEnabled: state.remindersEnabled,
      loaded: state.loaded,
      setDarkMode: (v: boolean) => dispatch({ type: "SET_DARK_MODE", payload: v }),
      setRemindersEnabled: (v: boolean) => dispatch({ type: "SET_REMINDERS", payload: v }),
    }),
    [state.darkMode, state.remindersEnabled, state.loaded]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used inside a SettingsProvider");
  }
  return ctx;
}
```
**📄 `hooks/use-app-theme.ts` — create this file**

```ts
// hooks/use-app-theme.ts
// Any screen calls useAppTheme() and gets the colours for the current mode.
import { DarkColors, LightColors } from "@/constants/palette";
import { useSettings } from "@/context/settings-context";

export function useAppTheme() {
  const { darkMode } = useSettings();
  return { isDark: darkMode, colors: darkMode ? DarkColors : LightColors };
}
```
> **Why two effects?** The first reads the saved settings **once**. The second saves **every time** a setting changes. The `if (!state.loaded) return;` guard is important: on the very first render `darkMode` is the default `false`. Without the guard the save effect would run before the load finished and **overwrite the saved value with the default**. The user's dark mode would reset on every app start.
>
> **Why is the theme a hook?** Every screen calls `useAppTheme()` and gets `colors`. A screen does not know if dark mode exists. It just uses `colors.background`.

### Test 4B

Temporary lines:

```ts
import { initialSettingsState, settingsReducer } from "@/context/settings-reducer";
console.log("R5", settingsReducer(initialSettingsState, { type: "LOAD", payload: { darkMode: true } }));
```

Expected: `R5 { darkMode: true, remindersEnabled: true, loaded: true }`. Remove the lines, then:

```bash
git add context/settings-reducer.ts context/settings-context.tsx hooks/use-app-theme.ts
git commit -m "Add settings reducer and context with saved dark mode and reminders, and useAppTheme hook"
git push
```

### 4C. Categories state
**📄 `context/categories-reducer.ts` — create this file**

```ts
// context/categories-reducer.ts
import { Category } from "@/types";

export type CategoriesStatus = "idle" | "loading" | "ready" | "error";

export interface CategoriesState {
  items: Category[];
  status: CategoriesStatus;
  error: string | null;
}

export const initialCategoriesState: CategoriesState = {
  items: [],
  status: "idle",
  error: null,
};

export type CategoriesAction =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: Category[] }
  | { type: "LOAD_ERROR"; payload: string }
  | { type: "ADD"; payload: Category }
  | { type: "REMOVE"; payload: number } // payload = category id
  | { type: "CLEAR" };

export function categoriesReducer(
  state: CategoriesState,
  action: CategoriesAction
): CategoriesState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, status: "loading", error: null };
    case "LOAD_SUCCESS":
      return { items: action.payload, status: "ready", error: null };
    case "LOAD_ERROR":
      return { ...state, status: "error", error: action.payload };
    case "ADD":
      return { ...state, items: [...state.items, action.payload] };
    case "REMOVE":
      return { ...state, items: state.items.filter((c) => c.id !== action.payload) };
    case "CLEAR":
      return initialCategoriesState;
    default:
      return state;
  }
}
```
**📄 `context/categories-context.tsx` — create this file**

```tsx
// context/categories-context.tsx
// Shared by everyone: Member 1's Add Food form reads the list with useCategories().
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { createCategory, deleteCategory, fetchCategories } from "@/services/categories";
import { Category } from "@/types";
import { getErrorMessage } from "@/utils/errors";
import { useAuth } from "./auth-context";
import { categoriesReducer, CategoriesStatus, initialCategoriesState } from "./categories-reducer";

interface CategoriesContextValue {
  items: Category[];
  status: CategoriesStatus;
  error: string | null;
  refresh: () => Promise<void>;
  addCategory: (name: string) => Promise<void>; // throws when the API fails
  removeCategory: (id: number) => Promise<void>; // throws when the API fails
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;
  const [state, dispatch] = useReducer(categoriesReducer, initialCategoriesState);

  const refresh = useCallback(async () => {
    dispatch({ type: "LOAD_START" });
    try {
      const items = await fetchCategories();
      dispatch({ type: "LOAD_SUCCESS", payload: items });
    } catch (error) {
      dispatch({ type: "LOAD_ERROR", payload: getErrorMessage(error) });
    }
  }, []);

  // Load when somebody logs in, clear when they log out
  useEffect(() => {
    if (userId === undefined) {
      dispatch({ type: "CLEAR" });
      return;
    }
    refresh();
  }, [userId, refresh]);

  const addCategory = useCallback(async (name: string) => {
    const created = await createCategory(name);
    dispatch({ type: "ADD", payload: created });
  }, []);

  const removeCategory = useCallback(async (id: number) => {
    await deleteCategory(id);
    dispatch({ type: "REMOVE", payload: id });
  }, []);

  const value = useMemo(
    () => ({
      items: state.items,
      status: state.status,
      error: state.error,
      refresh,
      addCategory,
      removeCategory,
    }),
    [state.items, state.status, state.error, refresh, addCategory, removeCategory]
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories(): CategoriesContextValue {
  const ctx = useContext(CategoriesContext);
  if (!ctx) {
    throw new Error("useCategories must be used inside a CategoriesProvider");
  }
  return ctx;
}
```
> **Why is this context shared with the team?** Member 1's Add Food form needs the category list for its dropdown. Instead of calling the API again, they write `const { items } = useCategories();`. It also means a category you add in Manage Categories shows up in their dropdown immediately, with no extra request.
>
> **Why do `addCategory` and `removeCategory` *throw*?** The provider only updates the list when the API call succeeded (`dispatch` runs **after** `await`). If the API fails the error goes to the screen, which shows the message. The list is never wrong.
>
> **Why `userId` in the effect dependency?** When user A logs out and user B logs in, `userId` changes, the effect runs again and loads B's categories. On logout `userId` is `undefined` and the list is cleared, so B never sees A's custom categories.

### Test 4C

Temporary lines:

```ts
import { categoriesReducer, initialCategoriesState } from "@/context/categories-reducer";

let c = categoriesReducer(initialCategoriesState, { type: "LOAD_SUCCESS", payload: [{ id: 1, name: "Dairy" }] });
c = categoriesReducer(c, { type: "ADD", payload: { id: 2, name: "Spices" } });
console.log("R3", c.items.length);
c = categoriesReducer(c, { type: "REMOVE", payload: 2 });
console.log("R4", c.items.map((x) => x.name));
```

Expected: `R3 2` and `R4 [ 'Dairy' ]`. Run `npx tsc --noEmit` again (nothing printed). Remove the lines, then:

```bash
git add context/categories-reducer.ts context/categories-context.tsx
git commit -m "Add categories reducer and CategoriesProvider with add and remove"
git push
```

---

## Part 5 — App shell: providers, login guard, tabs

Now the pieces become an app. After this Part you can log in with a **temporary** button and see the guard work. The real screens come next.

> ⚠️ **Team note.** `app/_layout.tsx` and `app/(tabs)/_layout.tsx` are shared files.
> - If a teammate already pushed them, **do not overwrite**. Merge: add my providers (`SettingsProvider`, `AuthProvider`, `CategoriesProvider`) and the two `Stack.Protected` groups into theirs.
> - Their providers (for example a foods context) go **inside** `<CategoriesProvider>`.
> - Their stack screens such as `food/form` and `food/[id]` must be declared **inside** `<Stack.Protected guard={signedIn}>`, so a logged-out user cannot open them.
> - Replace the placeholder `home.tsx` and `alerts.tsx` with the real screens. Mine only exist so the tabs open.

### 5.1 Delete the template screens

Delete these three files (the template's example screens):

```text
app/(tabs)/index.tsx
app/(tabs)/explore.tsx
app/modal.tsx
```

### 5.2 Root layout
**📄 `app/_layout.tsx` — replace the whole file**

```tsx
// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { Palette } from "@/constants/palette";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { CategoriesProvider } from "@/context/categories-context";
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
          <RootNavigator />
        </CategoriesProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
```
> **How the guard works.** `Stack.Protected guard={signedIn}` makes the screens inside it available **only while the guard is true**. When `signedIn` flips (login or logout), Expo Router switches to the other group by itself. You never write `router.replace("/home")` after login. This replaces the old pattern of redirecting inside `useEffect`, and it is the method in the current Expo Router authentication docs (available since SDK 53).
>
> **Why wait for `status === "loading"`?** The guard needs a real answer. Rendering the Stack too early would show the Welcome screen for a split second to a user who is already logged in.
>
> **Provider order.** `CategoriesProvider` calls `useAuth()`, so it must be **inside** `AuthProvider`. `RootNavigator` calls `useSettings()`, so it must be inside `SettingsProvider`. A wrong order throws the error from the custom hook's guard (Week 5).

### 5.3 Auth group layout
**📄 `app/(auth)/_layout.tsx` — create this file**

```tsx
// app/(auth)/_layout.tsx
import { Stack } from "expo-router";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: "fade" }} />;
}
```
### 5.4 Temporary Welcome screen

This is a **temporary** file so you can test the guard. Part 6 replaces it.

**📄 `app/(auth)/index.tsx` — TEMPORARY**

```tsx
// app/(auth)/index.tsx  -  TEMPORARY test screen (replaced in Part 6)
import { Button, Text, View } from "react-native";
import { useAuth } from "@/context/auth-context";

export default function TempWelcome() {
  const { login } = useAuth();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
      <Text>Temporary welcome screen</Text>
      <Button
        title="Test login (nila@example.com)"
        onPress={() =>
          login("nila@example.com", "secret123").catch((e) => console.log("login failed:", e.message))
        }
      />
    </View>
  );
}
```
### 5.5 Tabs layout and screens
**📄 `app/(tabs)/_layout.tsx` — create this file**

```tsx
// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Palette } from "@/constants/palette";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Palette.accent,
        tabBarInactiveTintColor: Palette.gold,
        tabBarStyle: { backgroundColor: Palette.footer, borderTopWidth: 0 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
```
**📄 `app/(tabs)/home.tsx` — create this file**

```tsx
// app/(tabs)/home.tsx  -  PLACEHOLDER. Member 1 replaces this file with the real Home screen.
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth-context";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <Text style={[styles.title, { color: colors.text }]}>Hello, {user?.name}!</Text>
        <Text style={[styles.sub, { color: colors.subtext }]}>
          Home (food list) is built by Member 1.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  sub: { fontSize: 14, textAlign: "center" },
});
```
**📄 `app/(tabs)/alerts.tsx` — create this file**

```tsx
// app/(tabs)/alerts.tsx  -  PLACEHOLDER. Member 3 replaces this file with the real Alerts screen.
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/use-app-theme";

export default function AlertsScreen() {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <Text style={[styles.title, { color: colors.text }]}>Alerts</Text>
        <Text style={[styles.sub, { color: colors.subtext }]}>Built by Member 3.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  sub: { fontSize: 14 },
});
```
**📄 `app/(tabs)/settings.tsx` — TEMPORARY (Part 9 replaces it)**

```tsx
// app/(tabs)/settings.tsx  -  TEMPORARY (replaced in Part 9)
import { Button, Text, View } from "react-native";
import { useAuth } from "@/context/auth-context";

export default function TempSettings() {
  const { user, logout } = useAuth();

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
      <Text>{user?.email}</Text>
      <Button title="Log out" onPress={() => logout()} />
    </View>
  );
}
```
### Test 5

1. **Terminal A:** `node mock-api/server.js`.
2. **Terminal B:** register the test user (the mock has no users after a restart):
   ```bash
   curl -s -X POST http://localhost:3000/api/auth/register -H 'Content-Type: application/json' -d '{"name":"Nila","email":"nila@example.com","password":"secret123"}'
   ```
3. **Terminal C:** `npx expo start`, open the app. You see "Temporary welcome screen".

| # | Do | Must happen |
|---|---|---|
| 1 | Tap **Test login** | Home opens with **"Hello, Nila!"**. Terminal A shows `POST /api/auth/login` then `GET /api/categories` |
| 2 | Press `r` in Terminal C (reload the app) | Still on Home, not on Welcome. Terminal A shows `GET /api/auth/me`. **The saved token works.** |
| 3 | Settings tab → **Log out** | Back on the Welcome screen. You cannot go back to Home with the back button |
| 4 | Test login again, then stop Terminal A (`Ctrl+C`) and start it again (users are wiped) | |
| 5 | Reload the app | You land on **Welcome**. The old token got a 401, was deleted, and the guard logged you out |

Run `npx tsc --noEmit` (nothing printed) and `npx expo lint` (no errors).

> **If the Home screen says "Hello, !":** the user object is missing `name`. Check the register curl output.

### Commit

```bash
git add .
git commit -m "Add root layout with providers and login guard, auth group and tabs layout"
git push
```

---

## Part 6 — Welcome screen

### 6.1 Button component
**📄 `components/app-button.tsx` — create this file**

```tsx
// components/app-button.tsx
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { Palette } from "@/constants/palette";

type Variant = "primary" | "dark" | "gold" | "outline" | "danger";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
}

const VARIANTS: Record<Variant, { bg: string; text: string; border: string }> = {
  primary: { bg: Palette.accent, text: "#FFFFFF", border: Palette.accent },
  dark: { bg: Palette.primary, text: "#FFE9CF", border: Palette.primary },
  gold: { bg: Palette.gold, text: Palette.primary, border: Palette.gold },
  outline: { bg: "transparent", text: "#FFFFFF", border: Palette.gold },
  danger: { bg: "transparent", text: "#DC2626", border: "#DC2626" },
};

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
}: AppButtonProps) {
  const look = VARIANTS[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: look.bg, borderColor: look.border },
        isDisabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={look.text} />
      ) : (
        <Text style={[styles.text, { color: look.text }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});
```
> **Why `VARIANTS` as an object?** One component, five looks. A new look is one new line in the object, not a new component. `Record<Variant, ...>` makes TypeScript check that every variant has a colour set.
>
> **Why `Pressable` with a style *function*?** `style={({ pressed }) => [...]}` receives the touch state, so the button dims while the finger is down. A plain style object cannot know that.

### 6.2 Welcome screen
**📄 `app/(auth)/index.tsx` — replace the whole file**

```tsx
// app/(auth)/index.tsx  -  Welcome screen (first screen for a logged-out user)
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton from "@/components/app-button";
import { Palette } from "@/constants/palette";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.top}>
        <Text style={styles.brand}>FORKCAST</Text>
      </View>

      <View style={styles.bottom}>
        <View style={styles.titleBox}>
          <Text style={styles.title}>{"KNOW WHAT'S IN YOUR FRIDGE"}</Text>
        </View>

        <View style={styles.buttons}>
          <View style={styles.buttonCell}>
            <AppButton title="SIGN UP" variant="gold" onPress={() => router.push("/register")} />
          </View>
          <View style={styles.buttonCell}>
            <AppButton title="LOG IN" variant="outline" onPress={() => router.push("/login")} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.primary, paddingHorizontal: 24 },
  top: { flex: 1, justifyContent: "center", alignItems: "center" },
  brand: { fontSize: 38, fontWeight: "900", letterSpacing: 4, color: Palette.gold },
  bottom: { paddingBottom: 24 },
  titleBox: {
    backgroundColor: Palette.gold,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 22,
    marginBottom: 24,
  },
  title: { fontSize: 30, fontWeight: "900", color: Palette.primary, lineHeight: 36 },
  buttons: { flexDirection: "row", gap: 12 },
  buttonCell: { flex: 1 },
});
```
> 🔴 `"/register"` and `"/login"` are underlined red until Parts 7 and 8 create those files. That is expected. Do not tap the buttons yet.

### Test 6

Log out first if you are logged in (a logged-in user cannot see Welcome). Then check the screen:

- Dark brown background, **FORKCAST** in orange at the top, the orange title box and the two buttons at the bottom.
- `SIGN UP` is filled orange-gold, `LOG IN` has only an outline.
- A button dims when you press it.

```bash
git add components/app-button.tsx "app/(auth)/index.tsx"
git commit -m "Add AppButton component and Welcome screen"
git push
```

---

## Part 7 — Login screen

### 7.1 Form field and auth background
**📄 `components/form-field.tsx` — create this file**

```tsx
// components/form-field.tsx
// Week 4 FormField + onBlur, secureTextEntry and an "auth" look from the design.
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from "react-native";
import { Palette } from "@/constants/palette";
import { useAppTheme } from "@/hooks/use-app-theme";

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  // "auth" = the brown-bordered field on the orange Login / Register screens
  variant?: "default" | "auth";
}

export default function FormField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  placeholder,
  multiline = false,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  variant = "default",
}: FormFieldProps) {
  const { colors } = useAppTheme();
  const isAuth = variant === "auth";

  return (
    <View style={styles.container}>
      {/* The auth design has no label above the field: the label is the placeholder */}
      {!isAuth && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isAuth
            ? styles.inputAuth
            : { backgroundColor: colors.inputBackground, color: colors.text },
          multiline && styles.multiline,
          !!error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder ?? (isAuth ? label : undefined)}
        placeholderTextColor={isAuth ? Palette.secondary : colors.subtext}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
      {/* Only render the error line when there is an error */}
      {error ? <Text style={[styles.errorText, isAuth && styles.errorAuth]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputAuth: {
    backgroundColor: "rgba(97, 49, 23, 0.35)",
    borderColor: Palette.primary,
    borderWidth: 2,
    borderRadius: 8,
    color: Palette.primary,
    fontWeight: "700",
  },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  inputError: { borderColor: "#DC2626", borderWidth: 2 },
  errorText: { fontSize: 12, color: "#DC2626", marginTop: 4 },
  errorAuth: { color: "#7F1D1D", fontWeight: "700" }, // darker red = readable on orange
});
```
**📄 `components/auth-background.tsx` — create this file**

```tsx
// components/auth-background.tsx
// Orange screen with the cake pattern from the design, used by Login and Register.
import { LinearGradient } from "expo-linear-gradient";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Palette } from "@/constants/palette";

export default function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      {/* Pattern picture at the bottom. pointerEvents none = touches go through it */}
      <View style={styles.patternWrap} pointerEvents="none">
        <Image
          source={require("@/assets/images/auth-pattern.png")}
          style={styles.pattern}
          resizeMode="cover"
        />
        {/* Fade the top edge of the picture into the plain orange */}
        <LinearGradient
          colors={[Palette.authBackground, "rgba(215, 136, 41, 0)"]}
          style={styles.fade}
        />
      </View>

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.safe}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.authBackground },
  patternWrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
  pattern: { width: "100%", aspectRatio: 527 / 552 },
  fade: { position: "absolute", top: 0, left: 0, right: 0, height: 90 },
  safe: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 48, paddingBottom: 32 },
});
```
> **FormField is your Week 4 component** with three additions: `onBlur`, `secureTextEntry` (dots for the password) and the `variant="auth"` look. The optional `error?` prop and the `error ? <Text/> : null` pattern are unchanged.
>
> **Why `pointerEvents="none"` on the picture?** The picture sits behind the form. Without it the picture could catch the touches that belong to the fields.
>
> **Why `KeyboardAvoidingView` + `ScrollView` with `keyboardShouldPersistTaps="handled"`?** Without the first, the keyboard covers the password field on iOS. Without the second, the first tap on the button only closes the keyboard and does **not** press the button.
>
> **Why `Palette.authBackground` and not `gold`?** The design says `D28428`, but the real colour inside the cake picture is `#D78829`. If the screen colour differs even a little, you see a visible rectangle around the picture. Using the picture's own colour makes the edges disappear.

### 7.2 Login screen
**📄 `app/(auth)/login.tsx` — create this file**

```tsx
// app/(auth)/login.tsx
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AppButton from "@/components/app-button";
import AuthBackground from "@/components/auth-background";
import FormField from "@/components/form-field";
import { Palette } from "@/constants/palette";
import { useAuth } from "@/context/auth-context";
import { getErrorMessage, getStatus } from "@/utils/errors";
import { LoginData, LoginErrors, validateLogin } from "@/utils/validation";

export default function LoginScreen() {
  const { login } = useAuth();

  // Combined state for the field values (Week 4)
  const [formData, setFormData] = useState<LoginData>({ email: "", password: "" });
  // Separate state for everything that is not a field value
  const [errors, setErrors] = useState<LoginErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const updateField = (field: keyof LoginData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setServerError(null); // the user is typing again: hide the old server message
  };

  const markTouched = (field: keyof LoginData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Live validation: runs again every time formData changes
  useEffect(() => {
    setErrors(validateLogin(formData));
  }, [formData]);

  // Show an error only after the field was touched OR Submit was pressed
  const getFieldError = (field: keyof LoginErrors) =>
    touched[field] || submitAttempted ? errors[field] : undefined;

  const isFormValid = Object.keys(errors).length === 0;

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    if (!isFormValid) return;

    setIsSubmitting(true);
    setServerError(null);
    try {
      await login(formData.email.trim().toLowerCase(), formData.password);
      // Success: the route guard in app/_layout.tsx now moves us to the tabs.
      // This screen disappears, so we do NOT call setIsSubmitting(false) here.
    } catch (error) {
      setServerError(
        getStatus(error) === 401 ? "Wrong email or password." : getErrorMessage(error)
      );
      setIsSubmitting(false);
    }
  };

  return (
    <AuthBackground>
      <Text style={styles.title}>Log In</Text>
      <View style={styles.titleLine} />

      <FormField
        variant="auth"
        label="Email"
        value={formData.email}
        onChangeText={(text) => updateField("email", text)}
        onBlur={() => markTouched("email")}
        error={getFieldError("email")}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <FormField
        variant="auth"
        label="Password"
        value={formData.password}
        onChangeText={(text) => updateField("password", text)}
        onBlur={() => markTouched("password")}
        error={getFieldError("password")}
        secureTextEntry
        autoCapitalize="none"
      />

      {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

      <View style={styles.submit}>
        <AppButton title="LOG IN" variant="dark" onPress={handleSubmit} loading={isSubmitting} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don&apos;t have an account?</Text>
        <Pressable style={styles.linkButton} onPress={() => router.replace("/register")}>
          <Text style={styles.linkText}>Sign Up</Text>
        </Pressable>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 34, fontWeight: "900", color: Palette.secondary, textAlign: "center" },
  titleLine: {
    height: 4,
    backgroundColor: Palette.secondary,
    borderRadius: 2,
    marginTop: 6,
    marginBottom: 24,
  },
  serverError: {
    color: "#7F1D1D",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  submit: { marginTop: 6 },
  footer: { alignItems: "center", marginTop: 18 },
  footerText: { color: Palette.secondary, fontWeight: "700", fontSize: 13 },
  linkButton: {
    marginTop: 8,
    backgroundColor: Palette.accent,
    borderColor: Palette.secondary,
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  linkText: { color: Palette.primary, fontWeight: "900", fontSize: 16 },
});
```
> **This is the Week 4 form pattern, step by step:**
> 1. `formData` is one combined object (the fields belong together). `errors`, `touched`, `submitAttempted`, `isSubmitting` are separate state (unrelated to the field values).
> 2. `useEffect(..., [formData])` validates on every keystroke. `[formData]` and not `[]` (errors would never update) and not "no array" (it would run after every render).
> 3. `getFieldError` shows an error only if the field was **touched** (`onBlur`) **or** Submit was pressed. So the form is not red when it opens.
>
> **One difference from Week 4, on purpose.** In Week 4 submit used a `submitTrigger` state plus an effect with `clearTimeout`, because it was a *fake* `setTimeout`. A real API call belongs in the **event handler** (`handleSubmit`) with `try / catch`. An effect is for syncing with something, not for reacting to a button press. The cleanup lesson still applies: it is the `cancelled` flag in the auth provider.
>
> **Why no `setIsSubmitting(false)` after a successful login?** `login()` changes the auth state, the guard swaps the groups, and this screen is **removed**. Updating state on a removed screen is pointless.
>
> **Why `.trim().toLowerCase()` on the email?** `Nila@Example.com ` and `nila@example.com` are the same person. Otherwise registering once and logging in with a different capital letter would say "wrong email".

> 🔴 `"/register"` is underlined red until Part 8. Expected.

### Test 7

Mock API running, test user registered (Test 5 step 2), app open on Welcome → tap **LOG IN**.

| # | Do | Must happen |
|---|---|---|
| 1 | Look at the screen | Orange screen, "Log In" with a line, two fields, dark button, cake pattern fading in at the bottom |
| 2 | Tap **LOG IN** with empty fields | `Email is required.` and `Password is required.` appear in red |
| 3 | Type `abc` in Email, tap the Password field | `Enter a valid email, e.g. nila@example.com` under Email (the field was touched) |
| 4 | Email `nila@example.com`, Password `wrong`, tap LOG IN | Button shows a spinner, then **Wrong email or password.** |
| 5 | Start typing again | The red message disappears |
| 6 | Stop the mock server, tap LOG IN | **Cannot reach the server. Check your Wi-Fi and the API address.** Start the server and register again |
| 7 | Correct email and password | Home opens: "Hello, Nila!" |
| 8 | **Close the app completely** (swipe it away), open it again | Still on Home. This is the "stays logged in" acceptance test |

```bash
git add components/form-field.tsx components/auth-background.tsx "app/(auth)/login.tsx"
git commit -m "Add FormField, AuthBackground and Login screen with live validation and API login"
git push
```

---

## Part 8 — Register screen
**📄 `app/(auth)/register.tsx` — create this file**

```tsx
// app/(auth)/register.tsx
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AppButton from "@/components/app-button";
import AuthBackground from "@/components/auth-background";
import FormField from "@/components/form-field";
import { Palette } from "@/constants/palette";
import { useAuth } from "@/context/auth-context";
import { getErrorMessage, getStatus } from "@/utils/errors";
import { RegisterData, RegisterErrors, validateRegister } from "@/utils/validation";

export default function RegisterScreen() {
  const { register } = useAuth();

  const [formData, setFormData] = useState<RegisterData>({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // 409 = email already registered. We show it under the Email field.
  const [emailTaken, setEmailTaken] = useState(false);

  const updateField = (field: keyof RegisterData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setServerError(null);
    if (field === "email") setEmailTaken(false);
  };

  const markTouched = (field: keyof RegisterData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  useEffect(() => {
    setErrors(validateRegister(formData));
  }, [formData]);

  const getFieldError = (field: keyof RegisterErrors) => {
    if (field === "email" && emailTaken) return "This email is already registered.";
    return touched[field] || submitAttempted ? errors[field] : undefined;
  };

  const isFormValid = Object.keys(errors).length === 0;

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    if (!isFormValid) return;

    setIsSubmitting(true);
    setServerError(null);
    try {
      await register(formData.name.trim(), formData.email.trim().toLowerCase(), formData.password);
      // Success: the route guard moves us to the tabs automatically.
    } catch (error) {
      if (getStatus(error) === 409) {
        setEmailTaken(true);
      } else {
        setServerError(getErrorMessage(error));
      }
      setIsSubmitting(false);
    }
  };

  return (
    <AuthBackground>
      <Text style={styles.title}>Sign Up</Text>
      <View style={styles.titleLine} />

      <FormField
        variant="auth"
        label="Full Name"
        value={formData.name}
        onChangeText={(text) => updateField("name", text)}
        onBlur={() => markTouched("name")}
        error={getFieldError("name")}
        autoCapitalize="words"
      />
      <FormField
        variant="auth"
        label="Email"
        value={formData.email}
        onChangeText={(text) => updateField("email", text)}
        onBlur={() => markTouched("email")}
        error={getFieldError("email")}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <FormField
        variant="auth"
        label="Password"
        value={formData.password}
        onChangeText={(text) => updateField("password", text)}
        onBlur={() => markTouched("password")}
        error={getFieldError("password")}
        secureTextEntry
        autoCapitalize="none"
      />

      {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}

      <View style={styles.submit}>
        <AppButton title="CREATE ACCOUNT" variant="dark" onPress={handleSubmit} loading={isSubmitting} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Pressable style={styles.linkButton} onPress={() => router.replace("/login")}>
          <Text style={styles.linkText}>Log In</Text>
        </Pressable>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 34, fontWeight: "900", color: Palette.secondary, textAlign: "center" },
  titleLine: {
    height: 4,
    backgroundColor: Palette.secondary,
    borderRadius: 2,
    marginTop: 6,
    marginBottom: 24,
  },
  serverError: {
    color: "#7F1D1D",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  submit: { marginTop: 6 },
  footer: { alignItems: "center", marginTop: 18 },
  footerText: { color: Palette.secondary, fontWeight: "700", fontSize: 13 },
  linkButton: {
    marginTop: 8,
    backgroundColor: Palette.accent,
    borderColor: Palette.secondary,
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  linkText: { color: Palette.primary, fontWeight: "900", fontSize: 16 },
});
```
> **Why the extra `emailTaken` state?** The API answers **409** when the email is registered. That error belongs to the **Email field**, so we show it under that field instead of a general message. It clears when the user edits the email (`updateField`).
>
> **Why is the error text in `getFieldError` before the touched check?** The 409 happens after Submit, so the field is already "touched". Putting it first guarantees it is shown.

After you save this file, `"/register"` in Welcome and Login stops being red.

### Test 8

Mock API running. Log out. Welcome → **SIGN UP**.

| # | Do | Must happen |
|---|---|---|
| 1 | Tap **CREATE ACCOUNT** with empty fields | Three red messages: name, email, password required |
| 2 | Name `Al`, Email `nila@`, Password `123` | `Name must be at least 3 characters.`, `Enter a valid email...`, `Password must be at least 6 characters.` |
| 3 | `Mosabbir Hossain Ayan`, `ayan@example.com`, `secret123` | Home opens: "Hello, Mosabbir Hossain Ayan!" |
| 4 | Log out, register again with the **same email** | Under Email: **This email is already registered.** You stay on Register |
| 5 | Edit the email to `ayan2@example.com` | The error disappears. Submit works |
| 6 | Tap **Log In** at the bottom | Goes to the Login screen (and "Sign Up" on Login comes back here) |

> This covers team test-checklist items 1, 2, 3 and 4 from `PROJECT_GUIDE.md` section 12.1.

```bash
git add "app/(auth)/register.tsx"
git commit -m "Add Register screen with validation and duplicate email error"
git push
```

---

## Part 9 — Settings screen

### 9.1 Row component
**📄 `components/settings-row.tsx` — create this file**

```tsx
// components/settings-row.tsx
// One row of the Settings screen: icon + text + (a Switch OR an arrow)
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Palette } from "@/constants/palette";
import { useAppTheme } from "@/hooks/use-app-theme";

interface SettingsRowProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  subtitle?: string;
  right?: React.ReactNode; // for example a <Switch />
  onPress?: () => void; // when given, the row is tappable and shows an arrow
}

export default function SettingsRow({ icon, label, subtitle, right, onPress }: SettingsRowProps) {
  const { colors } = useAppTheme();

  const content = (
    <>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color={Palette.gold} />
      </View>
      <View style={styles.texts}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.subtext }]}>{subtitle}</Text> : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={20} color={colors.subtext} /> : null)}
    </>
  );

  const rowStyle = [styles.row, { borderBottomColor: colors.border }];

  if (onPress) {
    return (
      <Pressable style={rowStyle} onPress={onPress}>
        {content}
      </Pressable>
    );
  }
  return <View style={rowStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(210, 132, 40, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  texts: { flex: 1 },
  label: { fontSize: 15, fontWeight: "600" },
  subtitle: { fontSize: 12, marginTop: 2 },
});
```
### 9.2 Settings screen
**📄 `app/(tabs)/settings.tsx` — replace the whole file**

```tsx
// app/(tabs)/settings.tsx
import { router } from "expo-router";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton from "@/components/app-button";
import SettingsRow from "@/components/settings-row";
import { Palette } from "@/constants/palette";
import { useAuth } from "@/context/auth-context";
import { useSettings } from "@/context/settings-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { confirmAction } from "@/utils/confirm";

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const { user, logout } = useAuth();
  const { darkMode, remindersEnabled, setDarkMode, setRemindersEnabled } = useSettings();

  // "Mosabbir Hossain Ayan" -> "MA" (first letter of the first and the last word)
  const words = (user?.name ?? "").trim().split(" ").filter(Boolean);
  const initials =
    words.length === 0
      ? "?"
      : (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : "")).toUpperCase();

  const handleLogout = () => {
    confirmAction("Log out", "Do you want to log out of FORKCAST?", "Log out", () => {
      logout();
    });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Dark profile header, like the "My Place" screen in the design */}
      <View style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </SafeAreaView>
      </View>

      <ScrollView
        style={[styles.sheet, { backgroundColor: colors.surface }]}
        contentContainerStyle={styles.sheetContent}
      >
        <Text style={[styles.section, { color: colors.subtext }]}>APPEARANCE</Text>
        <SettingsRow
          icon="moon"
          label="Dark mode"
          subtitle={darkMode ? "On" : "Off"}
          right={
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: colors.border, true: Palette.accent }}
              thumbColor="#FFFFFF"
            />
          }
        />

        <Text style={[styles.section, { color: colors.subtext }]}>NOTIFICATIONS</Text>
        <SettingsRow
          icon="notifications"
          label="Reminders"
          subtitle="Alert before food expires"
          right={
            <Switch
              value={remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{ false: colors.border, true: Palette.accent }}
              thumbColor="#FFFFFF"
            />
          }
        />

        <Text style={[styles.section, { color: colors.subtext }]}>FOOD</Text>
        <SettingsRow
          icon="pricetags"
          label="Manage categories"
          subtitle="Add or remove your own categories"
          onPress={() => router.push("/categories")}
        />

        <View style={styles.logout}>
          <AppButton title="LOG OUT" variant="danger" onPress={handleLogout} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { backgroundColor: Palette.footer, paddingBottom: 36 },
  headerInner: { alignItems: "center", paddingHorizontal: 20 },
  headerTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", marginTop: 8, marginBottom: 14 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#F3E6D8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: { fontSize: 30, fontWeight: "900", color: Palette.gold },
  name: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  email: { color: "#B9A593", fontSize: 13, marginTop: 2 },
  // The white card slides up over the dark header (rounded top corners)
  sheet: { flex: 1, marginTop: -24, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  sheetContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  section: { fontSize: 11, fontWeight: "800", letterSpacing: 1, marginTop: 18, marginBottom: 2 },
  logout: { marginTop: 32 },
});
```
> 🔴 `"/categories"` is underlined red until Part 10. Expected.
>
> **Why does the Dark mode `Switch` get `onValueChange={setDarkMode}` directly?** `Switch` calls the function with the new boolean, and `setDarkMode` takes a boolean. No arrow function needed.
>
> **What does the Reminders switch do today?** It saves `remindersEnabled` and nothing else. Member 3 reads `useSettings().remindersEnabled` when scheduling notifications (see the hand-off table in Part 11). Settings only owns the **switch**, not the scheduling.
>
> **Why `edges={["top"]}` on `SafeAreaView`?** The dark header should go under the status bar, but the bottom is handled by the tab bar. Only the top edge needs padding.

### Test 9

| # | Do | Must happen |
|---|---|---|
| 1 | Log in (as the user from Test 8), open **Settings** | Dark header, circle with your **initials** (`Mosabbir Hossain Ayan` → `MA`, a one-word name like `Nila` → `N`), name and email |
| 2 | Turn **Dark mode** on | The whole screen turns dark immediately. Go to the Home tab: it is dark too (it uses `useAppTheme`) |
| 3 | Reload the app (`r`) | **Still dark.** The setting was saved and restored |
| 4 | Turn **Reminders** off, reload | Still off |
| 5 | Tap **Log out** | A confirmation appears. **Cancel** keeps you logged in. **Log out** goes to Welcome |
| 6 | Log in again | Dark mode is **still on** (settings belong to the phone, not to the account) |

```bash
git add components/settings-row.tsx "app/(tabs)/settings.tsx"
git commit -m "Add Settings screen with dark mode, reminders switch and logout"
git push
```

---

## Part 10 — Manage Categories screen

### 10.1 Category row
**📄 `components/category-row.tsx` — create this file**

```tsx
// components/category-row.tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Palette } from "@/constants/palette";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Category } from "@/types";
import { isCustomCategory } from "@/utils/categories";

interface CategoryRowProps {
  category: Category;
  onDelete: (category: Category) => void;
}

export default function CategoryRow({ category, onDelete }: CategoryRowProps) {
  const { colors } = useAppTheme();
  const custom = isCustomCategory(category);

  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.name, { color: colors.text }]}>{category.name}</Text>

      {custom ? (
        <Pressable
          onPress={() => onDelete(category)}
          hitSlop={10}
          accessibilityLabel={`Delete ${category.name}`}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </Pressable>
      ) : (
        // Default categories are fixed: no delete button, only a small badge
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Default</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  name: { fontSize: 15, fontWeight: "600" },
  badge: {
    backgroundColor: "rgba(193, 106, 60, 0.18)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: "700", color: Palette.muted },
});
```
### 10.2 The screen
**📄 `app/categories.tsx` — create this file**

```tsx
// app/categories.tsx  -  Manage Categories screen
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AppButton from "@/components/app-button";
import CategoryRow from "@/components/category-row";
import FormField from "@/components/form-field";
import { Palette } from "@/constants/palette";
import { useCategories } from "@/context/categories-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Category } from "@/types";
import { confirmAction } from "@/utils/confirm";
import { getErrorMessage } from "@/utils/errors";
import { validateCategoryName } from "@/utils/validation";

export default function ManageCategoriesScreen() {
  const { colors } = useAppTheme();
  const { items, status, error, refresh, addCategory, removeCategory } = useCategories();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Live validation, same pattern as the Week 4 form.
  // It depends on `items` too, so "duplicate" is re-checked when the list changes.
  useEffect(() => {
    setNameError(validateCategoryName(name, items));
  }, [name, items]);

  const handleAdd = async () => {
    setTouched(true);
    setActionError(null);
    if (nameError) return;

    setIsAdding(true);
    try {
      await addCategory(name.trim());
      setName("");
      setTouched(false);
    } catch (e) {
      setActionError(getErrorMessage(e));
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = (category: Category) => {
    confirmAction(
      "Delete category",
      `Delete "${category.name}"? Food items that use it may be affected.`,
      "Delete",
      async () => {
        setActionError(null);
        try {
          await removeCategory(category.id);
        } catch (e) {
          setActionError(getErrorMessage(e));
        }
      }
    );
  };

  // One red message line: a failed add / delete, or a failed refresh while the list is on screen
  const bannerError = actionError ?? (status === "error" ? error : null);

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
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Could not load categories</Text>
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
      data={items}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <CategoryRow category={item} onDelete={handleDelete} />}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={status === "loading"}
          onRefresh={refresh}
          tintColor={Palette.accent}
          colors={[Palette.accent]}
        />
      }
      // A JSX element (not an inline component) so the TextInput keeps focus while typing
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.text }]}>Add your own category</Text>
          <FormField
            label="Category name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setActionError(null);
            }}
            onBlur={() => setTouched(true)}
            placeholder="e.g. Spices"
            error={touched ? nameError : undefined}
            autoCapitalize="words"
          />
          <AppButton title="ADD CATEGORY" onPress={handleAdd} loading={isAdding} />

          {bannerError ? (
            <Text style={[styles.actionError, { color: colors.danger }]}>{bannerError}</Text>
          ) : null}

          <Text style={[styles.heading, styles.listHeading, { color: colors.text }]}>
            All categories ({items.length})
          </Text>
        </View>
      }
      ListEmptyComponent={
        <Text style={[styles.empty, { color: colors.subtext }]}>No categories yet.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  list: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 6 },
  heading: { fontSize: 16, fontWeight: "800", marginBottom: 12 },
  listHeading: { marginTop: 26, marginBottom: 12 },
  actionError: { marginTop: 10, fontSize: 13, fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 20, fontSize: 14 },
  errorTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  errorText: { fontSize: 14, textAlign: "center" },
  retry: { marginTop: 18, alignSelf: "stretch" },
});
```
### 10.3 Register the screen in the root layout

Open `app/_layout.tsx`. Inside `<Stack.Protected guard={signedIn}>`, add the second `Stack.Screen` under `(tabs)`:

```tsx
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
        </Stack.Protected>
```

> **Why `headerShown: true` here when the root says `false`?** The root `screenOptions` is the default. A single `Stack.Screen` can override it (Week 3 `screenOptions` vs per-screen options). This screen gets the real back arrow from the Stack header for free.
>
> **Why is `ListHeaderComponent` given a JSX element and not a function component?** If you pass an inline component (`() => <View>...`), React sees a **new component type on every render**, unmounts the old input and mounts a new one, and the keyboard closes after every letter. A JSX element keeps the same input alive.
>
> **Three states, as the feature definition in the proposal asks (4.2):** loading (spinner), error (message + Try again) and success (the list). Add / delete errors show as one red line under the button.
>
> **Why validate again for duplicates when the server also checks?** Instant feedback for the user. The server check stays as the real protection (409). If someone else adds the same name from another phone, the server error is shown through `actionError`.

### Test 10

Mock API running, logged in. Settings → **Manage categories**.

| # | Do | Must happen |
|---|---|---|
| 1 | Open the screen | A spinner for a moment, then 9 rows, each with a **Default** badge and no delete button. Header: `All categories (9)` |
| 2 | Tap **ADD CATEGORY** with an empty field | `Category name is required.` |
| 3 | Type `a` | `Name must be at least 2 characters.` |
| 4 | Type `dairy` | `This category already exists.` (upper / lower case is ignored) |
| 5 | Type `Spices`, tap ADD | A new row **Spices** with a trash icon. Count is 10. The field is empty |
| 6 | Tap the trash icon | A confirmation. **Delete** removes the row. Count is 9 |
| 7 | Pull the list down | Spinner, list reloads from the API |
| 8 | Stop the mock server, pull down again | A red error line (the list stays on screen) |
| 9 | Log out, register another user, open categories | The other user's custom categories are **not** there |
| 10 | Dark mode on | This screen is dark too, including the header |

```bash
git add components/category-row.tsx app/categories.tsx app/_layout.tsx
git commit -m "Add Manage Categories screen with add, delete, loading and error states"
git push
```

---

## Part 11 — Final checks, pull request and hand-off

### 11.1 Quality checks

```bash
npx tsc --noEmit        # must print nothing
npx expo lint           # must show no errors
```

### 11.2 Acceptance criteria (use these in your midterm report, CO1)

| Feature | Done when |
|---|---|
| User creation and login | A new user can register, close the app, open it again and is still logged in. A wrong password and a duplicate email show a clear message. Logout returns to Welcome. |
| Settings | Dark mode changes the whole app and is still on after a restart. The reminders switch value is saved. Logout asks for confirmation. |
| Custom categories | The user can add a category (validated, no duplicates) and delete it. The 9 default categories cannot be deleted. Each user sees only their own custom categories. |
| Loading / error / success | Login, Register and Categories each show a spinner while waiting, a clear message when the API fails, and the result when it works. |

### 11.3 Push and open the pull request

```bash
git push
```

On GitHub open a **Pull Request** from `feature/accounts-categories` into `main`. Write the screen list from "What you are building" in the description, and ask a teammate to review (your team rule). Do not merge your own pull request.

### 11.4 Hand-off to your teammates

| Who | What they use from your part |
|---|---|
| **Member 1** (food items) | `const { items } = useCategories();` for the category dropdown in Add / Edit Food. `useAppTheme()` for colours. `api` from `@/services/api` for `/foods` (the token is added automatically). `useAuth().user` for "Hello, Nila!". Declare `food/form` and `food/[id]` inside `Stack.Protected` in `app/_layout.tsx`. |
| **Member 3** (alerts, stats, recipes) | `const { remindersEnabled } = useSettings();`. When it is `false`, cancel all scheduled notifications and schedule none. The provider already stores the value. Same `api`, `useAppTheme`. |
| **Backend** | The contract below. |

### 11.5 API contract for your 6 endpoints

| Method | Path | Body | Success | Errors the app handles |
|---|---|---|---|---|
| POST | `/auth/register` | `name`, `email`, `password` | 201 `{ token, user: { id, name, email } }` | 400 (message list), **409 email taken** |
| POST | `/auth/login` | `email`, `password` | 200 `{ token, user }` | **401 wrong credentials** |
| GET | `/auth/me` | none | 200 `{ id, name, email }` | 401 (token invalid → app logs out) |
| GET | `/categories` | none | 200 `[ { id, name, isCustom } ]` — the 9 defaults **plus the logged-in user's own** | 401 |
| POST | `/categories` | `name` | 201 `{ id, name, isCustom: true }` | 400, **409 duplicate name** |
| DELETE | `/categories/:id` | none | 204 | 404 (not found or someone else's), **403 default category** |

Ask the backend teammate for these three things:

1. `CATEGORY` needs a nullable `user_id` (null = default category). Update `erd.mermaid` and `erd.png` too.
2. `GET /categories` returns the defaults plus only the **current user's** custom ones, in the shape above.
3. Decide what happens when a category that food items use is deleted (block with 409, or move the items to "Other"). The app already shows whatever message the server sends.

When the real API is ready, change only `EXPO_PUBLIC_API_URL` in `.env.local` and restart with `npx expo start -c`. The `mock-api/` folder can stay as a testing tool.

### 11.6 Viva questions you can now answer

| Question | Short answer |
|---|---|
| Why `useReducer` for auth and not `useState`? | The state has a few clear transitions (loading, signed in, signed out). A reducer lists them in one place, is pure and testable, and TypeScript checks each action. |
| Why is the token not in AsyncStorage? | AsyncStorage is plain text. SecureStore encrypts it with the OS keystore. |
| What does the Axios interceptor do? | Runs before each request and adds the `Authorization` header. Another runs after each response and handles a 401 centrally. |
| How does the app stay logged in after a restart? | On start `AuthProvider` reads the saved token, calls `GET /auth/me`, and signs in or out depending on the answer. |
| How are logged-out users kept out of Home? | `Stack.Protected` guards in the root layout. Only one group of screens exists at a time. |
| Why does validation run in a `useEffect`? | It re-runs when `formData` changes, so errors follow every keystroke. The dependency array `[formData]` avoids running on every render. |
| Why `touched` and `submitAttempted`? | An untouched form must not be red. After Submit, untouched invalid fields must show their errors too. |
| Why is `dispatch` safe to put in a context value? | React keeps `dispatch` the same function for the whole life of the component. |
| What is `Stack.Screen options` vs `screenOptions`? | `screenOptions` sets defaults for all screens in the Stack. `options` on one screen overrides it for that screen. |
| What is a route group like `(auth)`? | A folder whose name is not part of the URL. It lets us group screens and give them a shared layout. |

---

## Quick reference: common errors

| Problem | Cause and fix |
|---|---|
| `Network Error` on a phone | `.env.local` still says `localhost`, or the firewall blocks port 3000, or the phone is on another Wi-Fi. Use the laptop's IPv4 address and restart with `npx expo start -c`. |
| Changed `.env.local` but nothing changed | Restart with `npx expo start -c`. Expo reads the file at start. |
| `useAuth must be used inside an AuthProvider` | A screen rendered outside the providers. Check the order in `app/_layout.tsx`. |
| Red underline on `router.push("/x")` | The route file does not exist yet, or the route types are old. Create the file and restart `npx expo start`. |
| Logged in, but app returns to Welcome after reload | The server is unreachable (token kept, but you are signed out until the server answers), or it answered 401 (token deleted). Check Terminal A. |
| Dark mode resets on restart | The `if (!state.loaded) return;` guard is missing in `settings-context.tsx`. |
| Keyboard closes after every letter in Categories | `ListHeaderComponent` was given a component function instead of a JSX element. |
| `Unable to resolve "@/assets/images/auth-pattern.png"` | The file is missing or in the wrong folder. It must be `assets/images/auth-pattern.png`. |
| Tapping a button only closes the keyboard | Missing `keyboardShouldPersistTaps="handled"` on the `ScrollView`. |
| `Alert` does nothing in the browser | Expected. `confirmAction` already uses `window.confirm` on the web. |
