import AsyncStorage from "@react-native-async-storage/async-storage";

const RECIPE_LISTS_KEY = "@crunchy_recipe_lists";
const MADE_IT_KEY = "@crunchy_recipe_made_it";

export interface RecipeList {
  id: string;
  name: string;
  recipeIds: string[];
  createdAt: number;
}

/** Get all recipe lists, creating a default one if none exist */
export async function getRecipeLists(): Promise<RecipeList[]> {
  try {
    const val = await AsyncStorage.getItem(RECIPE_LISTS_KEY);
    if (val) {
      const lists: RecipeList[] = JSON.parse(val);
      if (lists.length > 0) return lists;
    }
  } catch {}
  // Create default list
  const defaultList: RecipeList = {
    id: "default",
    name: "My Recipes",
    recipeIds: [],
    createdAt: Date.now(),
  };
  await AsyncStorage.setItem(RECIPE_LISTS_KEY, JSON.stringify([defaultList]));
  return [defaultList];
}

/** Save all lists */
async function saveLists(lists: RecipeList[]): Promise<void> {
  await AsyncStorage.setItem(RECIPE_LISTS_KEY, JSON.stringify(lists));
}

/** Create a new list */
export async function createRecipeList(name: string): Promise<RecipeList> {
  const lists = await getRecipeLists();
  const newList: RecipeList = {
    id: `list-${Date.now()}`,
    name,
    recipeIds: [],
    createdAt: Date.now(),
  };
  lists.push(newList);
  await saveLists(lists);
  return newList;
}

/** Add a recipe to a list */
export async function addRecipeToList(listId: string, recipeId: string): Promise<void> {
  const lists = await getRecipeLists();
  const list = lists.find((l) => l.id === listId);
  if (list && !list.recipeIds.includes(recipeId)) {
    list.recipeIds.push(recipeId);
    await saveLists(lists);
  }
}

/** Remove a recipe from a list */
export async function removeRecipeFromList(listId: string, recipeId: string): Promise<void> {
  const lists = await getRecipeLists();
  const list = lists.find((l) => l.id === listId);
  if (list) {
    list.recipeIds = list.recipeIds.filter((id) => id !== recipeId);
    await saveLists(lists);
  }
}

/** Delete a list (cannot delete default) */
export async function deleteRecipeList(listId: string): Promise<void> {
  if (listId === "default") return;
  const lists = await getRecipeLists();
  const filtered = lists.filter((l) => l.id !== listId);
  await saveLists(filtered);
}

/** Check which lists contain a recipe */
export async function getListsContainingRecipe(recipeId: string): Promise<string[]> {
  const lists = await getRecipeLists();
  return lists.filter((l) => l.recipeIds.includes(recipeId)).map((l) => l.id);
}

/** Track "I Made It" counts locally */
export async function getMadeItCount(recipeId: string): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(MADE_IT_KEY);
    if (val) {
      const counts: Record<string, number> = JSON.parse(val);
      return counts[recipeId] || 0;
    }
  } catch {}
  return 0;
}

export async function incrementMadeIt(recipeId: string): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(MADE_IT_KEY);
    const counts: Record<string, number> = val ? JSON.parse(val) : {};
    counts[recipeId] = (counts[recipeId] || 0) + 1;
    await AsyncStorage.setItem(MADE_IT_KEY, JSON.stringify(counts));
    return counts[recipeId];
  } catch {
    return 1;
  }
}

/** Check if current user already marked "made it" for this recipe */
const MADE_IT_USER_KEY = "@crunchy_user_made_it";

export async function hasUserMadeIt(recipeId: string): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(MADE_IT_USER_KEY);
    if (val) {
      const made: string[] = JSON.parse(val);
      return made.includes(recipeId);
    }
  } catch {}
  return false;
}

export async function markUserMadeIt(recipeId: string): Promise<void> {
  try {
    const val = await AsyncStorage.getItem(MADE_IT_USER_KEY);
    const made: string[] = val ? JSON.parse(val) : [];
    if (!made.includes(recipeId)) {
      made.push(recipeId);
      await AsyncStorage.setItem(MADE_IT_USER_KEY, JSON.stringify(made));
    }
  } catch {}
}
