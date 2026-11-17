# FORKCAST — Member 1 Overview
**Food items** · Sadman Sakib (23-52382-2) · Mobile App Development (React Native + Expo SDK 54)

This file is the **big picture**: what the codebase is today (after merging Ayan's part), what is broken on `main`, what you will add, and why it is designed this way.
The code itself, part by part with tests and commits, is in the second file: **`FORKCAST_Member1_Frontend_Guide.md`**.

---

## 1. Short answer first

| Question | Answer |
|---|---|
| What is my part? | **Member 1 — Food items.** Screens: Home (list, search, filter), Add / Edit Food, Food Details, Waste History. Endpoints: `GET /foods`, `POST /foods`, `GET /foods/:id`, `PATCH /foods/:id`, `DELETE /foods/:id`. |
| There is no backend. Where is the data saved? | The course midterm is **frontend only** (Lecture 0: "Midterm: frontend/UI only"; the minimum is "one API call **or** AsyncStorage usage"). So the app gets a **local backend**: a pretend REST API that runs **on the phone** and saves to AsyncStorage. It answers the same URLs (`/auth/*`, `/categories`, `/foods`) with the same JSON and error codes the real NestJS API will use later. No laptop server, no Wi-Fi setup on demo day. |
| Does `main` run right now? | **No.** `npx tsc --noEmit` on `main` shows about 30 errors, and the app cannot bundle on your computer, because 4 packages are missing from `package.json`. Details in section 5. |
| Do I have to change Ayan's code? | **Yes, a little.** Ayan's idea (fake the server on the phone) was right for the midterm, but the way it was done breaks his own code. Part 0 restores his Axios `api.ts` and moves his fake users and categories into the new local backend. Plus 2 small planned edits his guide asks Member 1 to do. See section 6. |
| Where does Open Food Facts fit? | A new **Find Product** screen. The user types a product name or a barcode number; the app asks Open Food Facts and pre-fills the Add Food form (name, brand, quantity, unit, category, picture). It is the **one real internet API** in the midterm. |
| Was the new code tested? | Yes, in a throwaway copy of the repo: `tsc` passes with 0 errors, `expo lint` has 0 errors, the Android bundle builds, the local backend was run through the real Axios client (register, login, 401, categories, every `/foods` rule), and the Open Food Facts service was run against the live API. **Not tested:** tapping through the screens on a real phone. That is your Test step in every Part. |

---

## 2. Your part, from the proposal

| Screen | Route file | What the user does | API |
|---|---|---|---|
| **Home** | `src/app/(tabs)/home.tsx` | Sees active food sorted by expiry with green / orange / red / grey badges, searches, filters by fridge / freezer / pantry, pulls to refresh | `GET /foods` |
| **Find Product** *(extra)* | `src/app/food/search.tsx` | Searches Open Food Facts by name or barcode, taps a result | Open Food Facts |
| **Add / Edit Food** | `src/app/food/form.tsx` | Fills a validated form (name, quantity, unit, storage, category, expiry date) | `POST /foods`, `PATCH /foods/:id` |
| **Food Details** | `src/app/food/[id].tsx` | Sees everything about one item; Mark as used, Threw it away, Edit, Delete | `GET /foods/:id`, `PATCH /foods/:id`, `DELETE /foods/:id` |
| **Waste History** | `src/app/food/history.tsx` | Sees used and wasted food, used / wasted / waste-rate numbers, filters, Undo | `GET /foods`, `PATCH /foods/:id` |

That is **4 required screens + 1 extra**, **2+ features**, **5 endpoints + 1 external API**. The proposal asks for at least 4 screens, 2 features and 2 endpoints.

**Features, checked against the proposal's definition (4.2: ① screen ② API / storage ③ loading-error-success ④ real interaction):**

| Feature | ① | ② | ③ | ④ |
|---|---|---|---|---|
| Add and store food items | Add / Edit Food + Find Product | `POST`, `PATCH`, Open Food Facts | spinner on Save / Search, red server message, back to list | validated form, product search |
| Search, filter, mark used or wasted | Home + Details + Waste History | `GET`, `PATCH`, `DELETE` | first-load spinner, error + Try again, empty states | search box, pills, Used / Wasted / Undo |

---

## 3. The codebase today (after the merge)

**Stack:** Expo SDK 54 · expo-router 6 · React Native 0.81 · React 19.1 · TypeScript strict · `typedRoutes` and React Compiler turned on in `app.json` · code in `src/`, import alias `@/` → `src/`.

```text
ForkCast/
├── mock-api/server.js          Ayan  fake REST API on the laptop (optional after Part 0)
├── app.json, package.json      template
└── src/
    ├── app/                    every file here is a screen (Expo Router)
    │   ├── _layout.tsx         Ayan  providers + login guard (Stack.Protected)
    │   ├── categories.tsx      Ayan  Manage Categories
    │   ├── (auth)/             Ayan  _layout, index (Welcome), login, register
    │   └── (tabs)/             Ayan  _layout (Home · Alerts · Settings tabs)
    │       ├── home.tsx        PLACEHOLDER  ← you replace it
    │       ├── alerts.tsx      PLACEHOLDER  ← Member 3 replaces it
    │       └── settings.tsx    Ayan
    ├── components/             Ayan  app-button, form-field, auth-background, settings-row, category-row
    ├── constants/palette.ts    Ayan  brand colours + LightColors / DarkColors
    ├── context/                Ayan  auth-*, settings-*, categories-*  (reducer + context, Week 5)
    ├── hooks/use-app-theme.ts  Ayan  { colors, isDark } for the current mode
    ├── services/               Ayan  api.ts (HTTP client), auth.ts, categories.ts, storage.ts
    ├── types/index.ts          Ayan  User, AuthResponse, Category
    └── utils/                  Ayan  validation, errors, confirm, categories
```

### How the app starts (read this once, it explains everything else)

```text
RootLayout (src/app/_layout.tsx)
 └─ SettingsProvider      reads dark mode + reminders from AsyncStorage
     └─ AuthProvider      reads the saved token, calls GET /auth/me
         └─ CategoriesProvider   loads GET /categories when a user is signed in
             └─ RootNavigator
                 ├─ status "loading"   → orange screen with a spinner
                 ├─ signed OUT         → only (auth): Welcome · Login · Register
                 └─ signed IN          → only (tabs) + categories      (Stack.Protected)
```

### The layers, for every API call

```text
Screen ─▶ useXxx() context ─▶ services/xxx.ts ─▶ services/api.ts (Axios) ─┬─▶ MIDTERM: local backend on the phone (AsyncStorage)
  ▲                │                               adds the token,          └─▶ FINAL:   real NestJS API (set EXPO_PUBLIC_API_URL)
  └── re-render ◀──┴── dispatch(action) → reducer   401 → automatic logout
```

You will copy this exact pattern for food: `home.tsx → useFoods() → services/foods.ts → api`.

### The local backend (after Part 0)

```text
src/services/local-backend/
├── db.ts       tables in AsyncStorage (readTable / writeTable / nextId), ok() / fail() answers
├── index.ts    the Axios adapter + /auth/* and /categories   (Ayan's rules, from his mock-api/server.js)
└── foods.ts    /foods                                         (yours, Part 3)
```

An Axios **adapter** is the part of Axios that really sends a request. `api.ts` plugs in `localAdapter` when `EXPO_PUBLIC_API_URL` is empty. The adapter answers from AsyncStorage after a short pretend delay (400 ms, so spinners are visible) and throws a real `AxiosError` for 400 / 401 / 404 / 409, exactly like a server would. Everything above it (Ayan's interceptors, `getErrorMessage`, the contexts, all screens) cannot tell the difference. In the final term you set `EXPO_PUBLIC_API_URL` and the same code talks to NestJS.

It also works in the **browser** (`w`), because AsyncStorage uses the browser's local storage there.

### What Ayan already gives you (reuse it, don't rebuild it)

| Piece | How you use it |
|---|---|
| `useAuth()` | `user.name` for "Hello, Sadman!" |
| `useCategories()` | `items` for the category pills in the form and the category name on each card. A category added in Manage Categories appears in your form at once. |
| `useAppTheme()` | `colors.background`, `colors.text` … so dark mode works on your screens for free |
| `api` from `@/services/api` | the Axios client; the token is added automatically |
| `AppButton`, `FormField` | buttons with a loading spinner; labelled inputs with an error line (Week 4) |
| `confirmAction()` | the "Are you sure?" dialog, also works in the browser |
| `getErrorMessage()`, `getStatus()` | turn any API error into one sentence / a status code |
| `Palette` | brand colours (`accent` orange, `gold`, `footer` navy …) |

---

## 4. Open Food Facts in one page

Open Food Facts (OFF) is a free, open, crowd-sourced database of food products from all over the world. ForkCast uses it **only to fill the Add Food form faster**. Your own food list is still saved on **your** server through `/foods`.

| Topic | What it means for ForkCast |
|---|---|
| **Two endpoints** | Barcode: `GET https://world.openfoodfacts.org/api/v2/product/{barcode}` · Name search: `GET https://search.openfoodfacts.org/search?q=milk` ("search-a-licious", the OFF search service). The old `cgi/search.pl` answered **503** when tested, so it is not used. |
| **No login** | Reading needs no account and no API key. |
| **User-Agent** | OFF asks every app to send `AppName/Version (ContactEmail)`. The code sends `ForkCast/1.0 (…)` from the phone. Put your team e-mail there. |
| **Rate limits** | **15 product reads per minute** and **10 searches per minute** per IP. So the app searches only when the user presses Search (never on every keystroke) and caches results in memory. |
| **Separate Axios instance** | `services/api.ts` adds our login token to every request. OFF gets its own Axios instance, so **our token is never sent to a third party.** |
| **Messy data** | Any field can be missing. `brands` is text in the barcode API but a list in the search API. `quantity` is free text ("400.0 g", "1l", "6 eggs, 328g"). The code cleans all of this in one place (`toOffProduct`, `parseOffQuantity`). |
| **Category guess** | OFF tags like `en:dairies`, `en:eggs` are mapped to your 9 default categories ("Dairy", "Eggs" …). Unknown → "Other". The user can still change it. |
| **Web vs phone** | On the phone everything works. In the browser (`w`) the **name search fails** because `search.openfoodfacts.org` does not allow browser calls from `localhost` (CORS). Barcode lookup works in both. Test OFF on the phone. |
| **Licence** | Data: Open Database License (ODbL). Images: CC BY-SA. The Find Product screen shows "Product data from Open Food Facts". |
| **Coverage** | Packaged products are well covered. Loose local items (vegetables from the bazaar) usually are not. That is why "Add food by hand" is always one tap away. |

---

## 5. What is broken on `main` (verified)

I ran `npx tsc --noEmit` on `main` (commit `7270314`). It reports about 30 errors. They all come from **3 causes**:

| # | Cause | Proof | Effect |
|---|---|---|---|
| 1 | **4 packages are missing from `package.json`**: `axios`, `expo-secure-store`, `@react-native-async-storage/async-storage`, `expo-linear-gradient`. They are not in `node_modules` either. | `Cannot find module 'axios'`, `'expo-secure-store'`, … | The app **cannot bundle**. Nothing opens. |
| 2 | **`.gitignore` was pasted twice in the merge**, and the second copy (from Ayan's branch) **ignores `package.json`, `package-lock.json` and `app.json`**. | look at the file: two copies; lines `app.json`, `package-lock.json`, `package.json` | That is most likely why Ayan's installed packages never reached `main`. |
| 3 | **Ayan's last commit (`cf75130` "member 2 part added") replaced the Axios client in `services/api.ts` with a "local simulation"** that stores users in AsyncStorage. | `Expected 0 type arguments`, `Expected 0 arguments, but got 1` in `auth.ts`, `categories.ts`, `auth-context.tsx` | See the table below. |

**Why does it still run on Ayan's phone?** His laptop has the 4 packages installed (only `package.json` never reached GitHub), and Expo does not stop on TypeScript errors: Metro only strips the types. Only `npx tsc --noEmit` shows them.

His **idea** was right (no backend in the midterm, so fake it on the phone). The way it was done has these problems:

| Problem | Why it matters |
|---|---|
| It replaces the whole Axios client, so it does not match the types his own services expect (`api.post<AuthResponse>`, `setUnauthorizedHandler(fn)`) | about 20 TypeScript errors; `tsc` must be clean before you push |
| `GET /auth/me` always returns `{ id: 1, name: "Local User" }` | after an app restart every user becomes "Local User" |
| `setUnauthorizedHandler` does nothing, errors are hand-made objects | auto-logout is gone; error handling is only half real |
| It knows only `/auth/*` and `/categories` | every `/foods` call returns `undefined`, so **your whole part cannot work** |
| His own guide and viva answers describe the Axios interceptor | he has to defend the Axios version in his viva |

**The fix keeps his idea but moves it one level down:** keep the real Axios client, and replace only the **adapter** (the part that sends the request) with a local backend. See section 3, "The local backend".

The other errors (`'"/register"' is not assignable …`) are **not real bugs**. The route types in `.expo/types` are old. They are rebuilt the first time you run `npx expo start`.

---

## 6. Do I have to change Ayan's code?

| File | Change | Type | Tell Ayan? |
|---|---|---|---|
| `.gitignore` | keep only one clean copy (no `package.json` / `app.json` / `package-lock.json` lines) | **fix** (merge leftover) | yes |
| `package.json`, `package-lock.json`, `app.json` | `npx expo install` the 4 missing packages (`expo-secure-store` also adds a plugin line to `app.json`) | **fix** | yes |
| `src/services/api.ts` | restore **his own** Axios version from commit `e581620`, then add the `adapter` line (4 lines) | **fix** | **yes, first** (see below) |
| `src/services/local-backend/db.ts`, `index.ts` | **new**: his fake users and categories move here, with the same rules as his `mock-api/server.js` | **fix** (replaces the simulation) | **yes, do it together**; he should review it, because `/auth` and `/categories` are his endpoints |
| `src/app/_layout.tsx` | wrap `<FoodsProvider>` inside `<CategoriesProvider>`; add `<Stack.Screen name="food" />` inside the signed-in `Stack.Protected` | planned (his guide, "Hand-off: Member 1") | no |
| `src/app/(tabs)/home.tsx` | replace the placeholder with the real Home | planned (the file says "Member 1 replaces this file") | no |

`mock-api/server.js` is **not touched**. It stays as Ayan's optional tool: if someone sets `EXPO_PUBLIC_API_URL=http://<laptop-ip>:3000/api`, the app talks to it instead of the local backend.

**What to tell Ayan:** "Your idea of faking the server on the phone is what we need for the midterm. I kept it, but as an Axios adapter, so your `api.ts`, interceptors, types and `getErrorMessage` all work again and `tsc` is clean. Your user and category rules are in `services/local-backend/index.ts`. Can you review Part 0?"

**Everything else of Ayan's stays exactly as it is.** Your new code lives in new files (`types/food.ts`, `context/foods-*`, `services/foods.ts`, `local-backend/foods.ts` …), so your pull request and his never edit the same lines, and there are no merge conflicts.

---

## 7. What you will add

### New files

```text
src/services/local-backend/foods.ts  /foods endpoints of the local backend (plugged into index.ts)
src/types/food.ts                    Food, FoodInput, FoodUpdate, OffProduct
src/constants/food.ts                storage places, units, SOON_DAYS = 2, badge colours
src/utils/food.ts                    dates, badge colour, sorting, labels (pure)
src/utils/food-validation.ts         validateFood() for the form (pure, Week 4)
src/utils/open-food-facts.ts         "400.0 g" → 400 g, OFF tags → our category (pure)
src/services/foods.ts                the 5 /foods endpoints
src/services/open-food-facts.ts      barcode lookup + name search (own Axios instance)
src/context/foods-reducer.ts         FoodsState + actions (pure, Week 5)
src/context/foods-context.tsx        FoodsProvider + useFoods()
src/components/search-bar.tsx        Week 2 SearchBar + theme + clear button
src/components/filter-pills.tsx      Week 3 pills, one generic component used 5 times
src/components/expiry-badge.tsx      green / orange / red / grey badge
src/components/food-card.tsx         one food row (Home and History)
src/components/product-row.tsx       one Open Food Facts result
src/app/food/_layout.tsx             Stack for the food screens (Week 3 nested Stack)
src/app/food/search.tsx              Find Product
src/app/food/form.tsx                Add / Edit Food
src/app/food/[id].tsx                Food Details (dynamic route)
src/app/food/history.tsx             Waste History
```

### Navigation map

```text
(tabs)/home ──"+"──────────▶ food/search ──tap result──▶ food/form?name=…&barcode=…   (replace)
     │                            └──"add by hand"────▶ food/form                     (replace)
     ├──tap a food────────────▶ food/[id] ──pencil────▶ food/form?id=12
     └──clock icon────────────▶ food/history ──tap───▶ food/[id]
```

`router.replace` from Find Product to the form means **Back from the form goes to Home**, not to the search.

### State design

- **One list for everything:** `FoodsProvider` keeps **all** of the user's foods (active, used and wasted), loaded with one `GET /foods` at login.
- Home shows `status === "active"`, History shows the rest. These are **derived during render**, never copied into `useState` (Week 5 rule, Feature 2).
- Every change goes **server first, then `dispatch`**: `PATCH` → server says OK → `dispatch({ type: "UPDATE" })`. If the server fails, the list is never wrong.
- Search text, selected pill, form fields, "is saving" stay **local `useState`** in each screen (Week 5: only shared state goes into context).
- **Member 3** (statistics, recipes) can read the same list with `const { items } = useFoods();`.

### The life of one food item

```text
           POST /foods                    PATCH {status:"used"}
 (nothing) ───────────▶  active  ───────────────────────────▶  used    ─┐
                           │  ▲                                          │ PATCH {status:"active"}
                           │  └──────────────── Undo ◀───────────────────┤ (Undo in History / Details)
                           │      PATCH {status:"wasted"}                │
                           └───────────────────────────────▶  wasted  ──┘
   DELETE /foods/:id at any time = "added by mistake" (does not count as used or wasted)
```

### Expiry badge rules (`utils/food.ts`)

| Days left | Colour | Text |
|---|---|---|
| no date | grey | No date |
| < 0 | red | Expired 2 days ago |
| 0 | red | Expires today |
| 1 – 2 (`SOON_DAYS`) | orange | 1 day left / 2 days left |
| 3 + | green | 5 days left |

`SOON_DAYS = 2` matches the proposal's reminder "two days before".

### API contract (the local backend follows it now, NestJS must follow it in the final term)

| Method | Path | Body | Success | Errors the app shows |
|---|---|---|---|---|
| GET | `/foods` | – | 200 `Food[]` (all statuses, only this user's) | 401 |
| POST | `/foods` | `name, quantity, unit, storage, categoryId, expiryDate (YYYY-MM-DD or null)`, optional `brand, barcode, imageUrl` | 201 `Food` with `status: "active"`, `createdAt`, `finishedAt: null` | 400 (message list) |
| GET | `/foods/:id` | – | 200 `Food` | 404 (missing or someone else's) |
| PATCH | `/foods/:id` | any field above and/or `status` (`active` / `used` / `wasted`) | 200 `Food`; the **server** sets `finishedAt` when status changes | 400, 404 |
| DELETE | `/foods/:id` | – | 204 | 404 |

`Food` = `{ id, name, quantity, unit, storage, categoryId, expiryDate, status, brand, barcode, imageUrl, createdAt, finishedAt }`, camelCase like Ayan's types.
`unit` ∈ `pcs g kg ml L pack` · `storage` ∈ `fridge freezer pantry`.
**Check this against the team ERD.** If the `FOOD_ITEM` table uses other names, agree on them before the backend is built.

---

## 8. How your code matches the course

| Week | Topic | Where you use it |
|---|---|---|
| 1 | TS interfaces, union types, spread, `map` / `filter` | `types/food.ts`, every reducer case, the filters on Home |
| 2 | Core UI: `FlatList`, `Image`, `TouchableOpacity`, SearchBar, StyleSheet | Home, History, `food-card`, `product-row`, `search-bar` |
| 3 | Expo Router: nested Stack `_layout`, dynamic route `[id].tsx`, `router.push({ pathname, params })`, `useLocalSearchParams<T>()`, `navigation.setOptions` + `headerRight` in `useEffect`, filter pills | `food/_layout.tsx`, `food/[id].tsx`, Home pills, the edit pencil on Details |
| 4 | Combined `formData` state, `updateField`, live validation in `useEffect([formData])`, `touched` + `submitAttempted`, cleanup function, loading button | `food/form.tsx`, `utils/food-validation.ts`, the `cancelled` flag in Find Product and Details |
| 5 | `useReducer` + `useContext`, typed action union, Provider in the root layout, custom hook with a guard, derived values, `Alert` confirm for destructive actions | `foods-reducer.ts`, `foods-context.tsx`, `useFoods()`, Waste History numbers, "Threw it away" / Delete |

Nothing in your part uses a library the labs did not use, except **Axios** (already chosen by Ayan for the whole team) and the public Open Food Facts API.

---

## 9. Commit plan (details in the guide)

| Part | Commit message |
|---|---|
| 0 | `Clean up .gitignore after merge` · `Add missing packages` · `Restore Axios API client` · `Add local backend for the midterm` |
| 1 | `Add food types and constants` |
| 2 | `Add food date and validation helpers` · `Add Open Food Facts mapping helpers` |
| 3 | `Add /foods to the local backend` |
| 4 | `Add foods service` |
| 5 | `Add Open Food Facts service` |
| 6 | `Add foods reducer` · `Add FoodsProvider and useFoods hook` |
| 7 | `Add food list components` |
| 8 | `Add food stack and Home screen` |
| 9 | `Add Find Product screen` |
| 10 | `Add Add/Edit Food form` |
| 11 | `Add Food Details screen` |
| 12 | `Add Waste History screen` |

About 18 small commits, each leaving the app in a working state. Part 0 goes in its own small pull request first, so Ayan and Shourov get a `main` that runs (with the local backend, so Shourov can build his screens without a server too). Then your feature branch.

---

## 10. Hand-off notes for your teammates

| Who | What to tell them |
|---|---|
| **Ayan (Member 2)** | The fixes in section 6 and why. His local-simulation idea is kept, as an adapter. Ask him to review your Part 0 pull request, especially `/auth` and `/categories` in `local-backend/index.ts`. His decision #3 is still open: what happens to food when its category is deleted? Your screens show "Other" for an unknown category, and saving such a food shows the server's 400 message, so nothing crashes. |
| **Shourov (Member 3)** | `const { items } = useFoods();` gives all foods with `status`, `expiryDate`, `finishedAt`. Statistics can count `used` / `wasted`; recipes can use `items.filter(f => f.status === "active")`; alerts can use `daysUntil(f.expiryDate)` from `utils/food.ts`. For the midterm his own endpoints (`/notifications`, `/foods/stats`) can be added to the local backend the same way: a new `local-backend/<name>.ts` + 2 lines in `index.ts`. |
| **Backend (final term)** | The contract in section 7. `src/services/local-backend/foods.ts` and `index.ts` follow it exactly, so they can be read as a working spec. When NestJS is ready: set `EXPO_PUBLIC_API_URL` in `.env.local`, restart with `npx expo start -c`. The local backend switches itself off. |
