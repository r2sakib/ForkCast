// services/api.ts (Local Simulation without Axios)
import AsyncStorage from "@react-native-async-storage/async-storage";

// Simulated database in AsyncStorage
const USERS_KEY = "local_users";
const CATEGORIES_KEY = "local_categories";

const DEFAULT_CATEGORIES = [
  { id: 1, name: "Dairy", isCustom: false },
  { id: 2, name: "Vegetables", isCustom: false },
  { id: 3, name: "Fruits", isCustom: false },
  { id: 4, name: "Meat", isCustom: false },
  { id: 5, name: "Fish", isCustom: false },
  { id: 6, name: "Eggs", isCustom: false },
  { id: 7, name: "Rice and Grains", isCustom: false },
  { id: 8, name: "Bakery", isCustom: false },
  { id: 9, name: "Other", isCustom: false },
];

export const api = {
  async post(url: string, data: any) {
    if (url === "/auth/register") {
      const rawUsers = await AsyncStorage.getItem(USERS_KEY);
      const users = rawUsers ? JSON.parse(rawUsers) : [];
      
      if (users.some((u: any) => u.email === data.email)) {
        throw { response: { status: 409, data: { message: "Email already registered" } }, isAxiosError: true };
      }

      const newUser = { id: Date.now(), name: data.name, email: data.email, password: data.password };
      users.push(newUser);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

      return { data: { token: `mock-token-${newUser.id}`, user: { id: newUser.id, name: newUser.name, email: newUser.email } } };
    }

    if (url === "/auth/login") {
      const rawUsers = await AsyncStorage.getItem(USERS_KEY);
      const users = rawUsers ? JSON.parse(rawUsers) : [];
      
      const user = users.find((u: any) => u.email === data.email && u.password === data.password);
      if (!user) {
        throw { response: { status: 401, data: { message: "Invalid email or password" } }, isAxiosError: true };
      }

      return { data: { token: `mock-token-${user.id}`, user: { id: user.id, name: user.name, email: user.email } } };
    }

    if (url === "/categories") {
      // Add custom category locally
      const rawCats = await AsyncStorage.getItem(CATEGORIES_KEY);
      const cats = rawCats ? JSON.parse(rawCats) : DEFAULT_CATEGORIES;
      const newCat = { id: Date.now(), name: data.name, isCustom: true };
      cats.push(newCat);
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
      return { data: newCat };
    }
  },

  async get(url: string) {
    if (url === "/health") return { data: { status: "ok" } };

    if (url === "/auth/me") {
      // Return a dummy active user for local testing
      return { data: { id: 1, name: "Local User", email: "user@example.com" } };
    }

    if (url === "/categories") {
      const rawCats = await AsyncStorage.getItem(CATEGORIES_KEY);
      const cats = rawCats ? JSON.parse(rawCats) : DEFAULT_CATEGORIES;
      return { data: cats };
    }
  },

  async delete(url: string) {
    const match = /^\/categories\/(\d+)$/.exec(url);
    if (match) {
      const id = Number(match[1]);
      const rawCats = await AsyncStorage.getItem(CATEGORIES_KEY);
      let cats = rawCats ? JSON.parse(rawCats) : DEFAULT_CATEGORIES;
      cats = cats.filter((c: any) => c.id !== id);
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
      return { status: 204 };
    }
  }
};

export function setUnauthorizedHandler() {}