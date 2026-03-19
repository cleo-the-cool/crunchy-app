import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useGoBack } from "@/lib/useGoBack";
import * as Haptics from "../utils/haptics";
import {
  getRecipeLists,
  createRecipeList,
  deleteRecipeList,
  removeRecipeFromList,
  type RecipeList,
} from "@/lib/recipeLists";
import { getRecipeById } from "@/data/recipes";

export default function RecipeListsScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const [lists, setLists] = useState<RecipeList[]>([]);
  const [expandedList, setExpandedList] = useState<string | null>(null);
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState("");

  const loadLists = useCallback(async () => {
    const data = await getRecipeLists();
    setLists(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLists();
    }, [loadLists])
  );

  const handleCreateList = async () => {
    const name = newListName.trim();
    if (!name) return;
    await createRecipeList(name);
    setNewListName("");
    setShowNewList(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await loadLists();
  };

  const handleDeleteList = (listId: string, listName: string) => {
    if (listId === "default") {
      Alert.alert("Can't delete", "The default list can't be deleted.");
      return;
    }
    Alert.alert(
      "Delete List",
      `Are you sure you want to delete "${listName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteRecipeList(listId);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await loadLists();
          },
        },
      ]
    );
  };

  const handleRemoveRecipe = async (listId: string, recipeId: string) => {
    await removeRecipeFromList(listId, recipeId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadLists();
  };

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      {/* Header */}
      <View className="px-5 pt-3 pb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={goBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#3D5A3E" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-dark">My Recipe Lists</Text>
        <TouchableOpacity onPress={() => setShowNewList(true)} hitSlop={8}>
          <Ionicons name="add-circle-outline" size={24} color="#3D5A3E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* New list input */}
        {showNewList && (
          <View className="flex-row items-center mb-4 gap-2">
            <TextInput
              value={newListName}
              onChangeText={setNewListName}
              placeholder="New list name..."
              placeholderTextColor="#999"
              className="flex-1 bg-white rounded-2xl px-4 py-3 text-dark"
              style={{ borderWidth: 1, borderColor: "rgba(0,0,0,0.12)" }}
              autoFocus
              onSubmitEditing={handleCreateList}
            />
            <TouchableOpacity
              onPress={handleCreateList}
              className="bg-forest rounded-2xl px-4 py-3"
            >
              <Text className="text-white font-semibold">Create</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowNewList(false);
                setNewListName("");
              }}
            >
              <Ionicons name="close" size={22} color="#999" />
            </TouchableOpacity>
          </View>
        )}

        {lists.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="bookmark-outline" size={48} color="#A8B89C" style={{ marginBottom: 12 }} />
            <Text className="text-base font-medium text-dark">No lists yet</Text>
            <Text className="text-sm text-dark/50 mt-1 text-center">
              Add recipes to lists from recipe detail pages
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {lists.map((list) => {
              const isExpanded = expandedList === list.id;
              return (
                <View
                  key={list.id}
                  className="bg-white rounded-3xl overflow-hidden"
                  style={{
                    borderWidth: 1,
                    borderColor: "rgba(0,0,0,0.12)",
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  {/* List header */}
                  <TouchableOpacity
                    onPress={() => setExpandedList(isExpanded ? null : list.id)}
                    activeOpacity={0.7}
                    className="flex-row items-center px-4 py-3.5"
                  >
                    <Ionicons name="bookmark" size={20} color="#3D5A3E" />
                    <View className="flex-1 ml-3">
                      <Text className="text-base font-bold text-dark">{list.name}</Text>
                      <Text className="text-xs text-dark/40 mt-0.5">
                        {list.recipeIds.length} {list.recipeIds.length === 1 ? "recipe" : "recipes"}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      {list.id !== "default" && (
                        <TouchableOpacity
                          onPress={() => handleDeleteList(list.id, list.name)}
                          hitSlop={8}
                        >
                          <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={18}
                        color="#A8B89C"
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Recipes in list */}
                  {isExpanded && (
                    <View>
                      {list.recipeIds.length === 0 ? (
                        <View className="px-4 py-4 border-t border-dark/5">
                          <Text className="text-sm text-dark/40 text-center">
                            No recipes in this list yet
                          </Text>
                        </View>
                      ) : (
                        list.recipeIds.map((recipeId) => {
                          const recipe = getRecipeById(recipeId);
                          if (!recipe) return null;
                          return (
                            <TouchableOpacity
                              key={recipeId}
                              onPress={() => router.push({ pathname: "/recipe-detail", params: { id: recipeId } })}
                              activeOpacity={0.7}
                              className="flex-row items-center px-4 py-3 border-t border-dark/5"
                            >
                              <Text className="text-2xl mr-3">{recipe.image || "🧪"}</Text>
                              <View className="flex-1">
                                <Text className="text-sm font-medium text-dark" numberOfLines={1}>
                                  {recipe.title}
                                </Text>
                                <Text className="text-xs text-dark/40">
                                  {recipe.category} · {recipe.timeMinutes} min
                                </Text>
                              </View>
                              <TouchableOpacity
                                onPress={() => handleRemoveRecipe(list.id, recipeId)}
                                hitSlop={8}
                              >
                                <Ionicons name="close-circle-outline" size={20} color="#999" />
                              </TouchableOpacity>
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
