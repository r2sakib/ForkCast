import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { getFoods } from "@/lib/insights-api";
import { PantryFood } from "@/types/insights";

// Loads the user's ACTIVE foods every time the screen gets focus.
export function useActiveFoods() {
  const [foods, setFoods] = useState<PantryFood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const all = await getFoods();
      setFoods(all.filter((f) => f.status === "ACTIVE"));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const reload = () => {
    setLoading(true);
    load();
  };

  return { foods, loading, error, reload };
}