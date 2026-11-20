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
