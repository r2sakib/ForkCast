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
