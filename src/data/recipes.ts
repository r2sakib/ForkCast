export interface Ingredient {
  name: string;   // keep lowercase and simple, e.g. "egg"
  amount: string;
}

export interface Recipe {
  id: string;
  title: string;
  emoji: string;
  time: string;
  difficulty: "Easy" | "Medium";
  ingredients: Ingredient[];
  steps: string[];
}

export const RECIPES: Recipe[] = [
  {
    id: "1", title: "Vegetable Omelette", emoji: "🍳", time: "10 min", difficulty: "Easy",
    ingredients: [
      { name: "egg", amount: "3" }, { name: "onion", amount: "1 small" },
      { name: "tomato", amount: "1" }, { name: "green chili", amount: "1" },
    ],
    steps: [
      "Chop the onion, tomato and chili finely.",
      "Beat the eggs with a pinch of salt.",
      "Mix the vegetables into the eggs.",
      "Pour into a hot oiled pan and cook 2 minutes each side.",
    ],
  },
  {
    id: "2", title: "Egg Fried Rice", emoji: "🍚", time: "15 min", difficulty: "Easy",
    ingredients: [
      { name: "rice", amount: "2 cups cooked" }, { name: "egg", amount: "2" },
      { name: "onion", amount: "1" }, { name: "carrot", amount: "1" },
    ],
    steps: [
      "Scramble the eggs in a pan and set aside.",
      "Fry chopped onion and carrot for 3 minutes.",
      "Add the cooked rice and stir on high heat.",
      "Mix the eggs back in, add salt and serve hot.",
    ],
  },
  {
    id: "3", title: "Chicken Curry", emoji: "🍗", time: "40 min", difficulty: "Medium",
    ingredients: [
      { name: "chicken", amount: "500 g" }, { name: "onion", amount: "2" },
      { name: "tomato", amount: "2" }, { name: "potato", amount: "2" },
      { name: "garlic", amount: "4 cloves" },
    ],
    steps: [
      "Fry sliced onions until golden.",
      "Add garlic, tomato and spices and cook to a paste.",
      "Add chicken and potato, stir well for 5 minutes.",
      "Add a cup of water, cover and simmer for 25 minutes.",
    ],
  },
  {
    id: "4", title: "Khichuri", emoji: "🥘", time: "35 min", difficulty: "Easy",
    ingredients: [
      { name: "rice", amount: "1 cup" }, { name: "lentil", amount: "1/2 cup" },
      { name: "potato", amount: "1" }, { name: "onion", amount: "1" },
    ],
    steps: [
      "Wash the rice and lentils together.",
      "Fry onion, then add potato cubes and spices.",
      "Add rice, lentils and 4 cups of water.",
      "Cook covered for 25 minutes until soft.",
    ],
  },
  {
    id: "5", title: "Aloo Bhaji", emoji: "🥔", time: "20 min", difficulty: "Easy",
    ingredients: [
      { name: "potato", amount: "3" }, { name: "onion", amount: "1" },
      { name: "green chili", amount: "2" },
    ],
    steps: [
      "Cut the potatoes into thin strips.",
      "Fry onion and chili until soft.",
      "Add potatoes, salt and turmeric.",
      "Cook covered on low heat for 12 minutes.",
    ],
  },
  {
    id: "6", title: "Banana Milkshake", emoji: "🥤", time: "5 min", difficulty: "Easy",
    ingredients: [
      { name: "banana", amount: "2" }, { name: "milk", amount: "2 cups" },
      { name: "sugar", amount: "1 tbsp" },
    ],
    steps: [
      "Peel and slice the bananas.",
      "Add bananas, milk and sugar to a blender.",
      "Blend until smooth and serve cold.",
    ],
  },
  {
    id: "7", title: "Cheese Sandwich", emoji: "🥪", time: "8 min", difficulty: "Easy",
    ingredients: [
      { name: "bread", amount: "4 slices" }, { name: "cheese", amount: "2 slices" },
      { name: "tomato", amount: "1" },
    ],
    steps: [
      "Slice the tomato thinly.",
      "Layer cheese and tomato between two bread slices.",
      "Toast in a pan until golden on both sides.",
    ],
  },
  {
    id: "8", title: "Vegetable Soup", emoji: "🍲", time: "25 min", difficulty: "Easy",
    ingredients: [
      { name: "carrot", amount: "1" }, { name: "potato", amount: "1" },
      { name: "onion", amount: "1" }, { name: "tomato", amount: "1" },
    ],
    steps: [
      "Chop all the vegetables into small cubes.",
      "Boil them in 3 cups of water for 15 minutes.",
      "Season with salt and black pepper.",
      "Blend lightly if you like it smooth.",
    ],
  },
  {
    id: "9", title: "Rice Payesh", emoji: "🍮", time: "30 min", difficulty: "Medium",
    ingredients: [
      { name: "milk", amount: "1 litre" }, { name: "rice", amount: "1/4 cup" },
      { name: "sugar", amount: "1/2 cup" },
    ],
    steps: [
      "Wash the rice and boil the milk.",
      "Add the rice and cook on low heat, stirring often.",
      "When thick (about 25 minutes), add the sugar.",
      "Cool and serve.",
    ],
  },
];