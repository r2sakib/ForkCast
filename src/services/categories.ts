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
