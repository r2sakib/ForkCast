import { categoriesReducer, initialCategoriesState } from "@/context/categories-reducer";

let c = categoriesReducer(initialCategoriesState, { type: "LOAD_SUCCESS", payload: [{ id: 1, name: "Dairy" }] });
c = categoriesReducer(c, { type: "ADD", payload: { id: 2, name: "Spices" } });
console.log("R3", c.items.length);
c = categoriesReducer(c, { type: "REMOVE", payload: 2 });
console.log("R4", c.items.map((x) => x.name));