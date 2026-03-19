import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useGoBack } from "@/lib/useGoBack";
import * as Haptics from "../utils/haptics";
import { getRecipeById, type Recipe, type Difficulty } from "@/data/recipes";
import {
  getRecipeLists,
  createRecipeList,
  addRecipeToList,
  getListsContainingRecipe,
  getMadeItCount,
  incrementMadeIt,
  hasUserMadeIt,
  markUserMadeIt,
  type RecipeList,
} from "@/lib/recipeLists";

function DifficultyStars({ difficulty }: { difficulty: Difficulty }) {
  const count = difficulty === "Easy" ? 1 : difficulty === "Medium" ? 2 : 3;
  return (
    <View className="flex-row items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <Ionicons
          key={i}
          name="star"
          size={14}
          color={i <= count ? "#F4A574" : "#E0E0E0"}
        />
      ))}
      <Text className="text-sm text-dark/60 ml-1">{difficulty}</Text>
    </View>
  );
}

export default function RecipeDetailScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [madeIt, setMadeIt] = useState(false);
  const [madeItCount, setMadeItCount] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set()
  );
  const [showListModal, setShowListModal] = useState(false);
  const [recipeLists, setRecipeLists] = useState<RecipeList[]>([]);
  const [listsContaining, setListsContaining] = useState<string[]>([]);
  const [newListName, setNewListName] = useState("");
  const [showNewListInput, setShowNewListInput] = useState(false);

  const recipe = id ? getRecipeById(id) : undefined;

  useEffect(() => {
    if (!id) return;
    // Load made-it state
    getMadeItCount(id).then(setMadeItCount);
    hasUserMadeIt(id).then(setMadeIt);
  }, [id]);

  if (!recipe) {
    return (
      <SafeAreaView className="flex-1 bg-ivory items-center justify-center">
        <Ionicons name="help-circle-outline" size={48} color="#A8B89C" style={{ marginBottom: 16 }} />
        <Text className="text-lg font-bold text-dark">Recipe not found</Text>
        <TouchableOpacity
          onPress={goBack}
          className="bg-forest rounded-3xl px-6 py-3 mt-4"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleMadeIt = async () => {
    if (madeIt || !id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setMadeIt(true);
    const newCount = await incrementMadeIt(id);
    setMadeItCount(newCount);
    await markUserMadeIt(id);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Check out this DIY recipe from Crunchy: ${recipe.title}\n\n${recipe.description}\n\nDownload Crunchy to see the full recipe!`,
      });
    } catch {
      // User cancelled share
    }
  };

  const handleAddToList = async () => {
    if (!id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const lists = await getRecipeLists();
    const containing = await getListsContainingRecipe(id);
    setRecipeLists(lists);
    setListsContaining(containing);

    // If only one list and recipe not in it, add directly
    if (lists.length === 1 && !containing.includes(lists[0].id)) {
      await addRecipeToList(lists[0].id, id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Added!", `"${recipe.title}" added to ${lists[0].name}`);
      return;
    }

    setShowListModal(true);
  };

  const handleToggleList = async (listId: string) => {
    if (!id) return;
    if (listsContaining.includes(listId)) {
      // Already in this list - don't remove from modal, user can do that from list screen
      return;
    }
    await addRecipeToList(listId, id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setListsContaining((prev) => [...prev, listId]);
  };

  const handleCreateList = async () => {
    const name = newListName.trim();
    if (!name) return;
    const newList = await createRecipeList(name);
    if (id) {
      await addRecipeToList(newList.id, id);
      setListsContaining((prev) => [...prev, newList.id]);
    }
    setRecipeLists((prev) => [...prev, newList]);
    setNewListName("");
    setShowNewListInput(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleIngredient = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const displayMadeItCount = madeItCount;

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      {/* Header */}
      <View className="px-5 pt-3 pb-2 flex-row items-center justify-between">
        <TouchableOpacity onPress={goBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color="#3D5A3E" />
        </TouchableOpacity>
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={handleAddToList} hitSlop={8}>
            <Ionicons name="bookmark-outline" size={24} color="#3D5A3E" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} hitSlop={8}>
            <Ionicons name="share-outline" size={24} color="#3D5A3E" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View
          className="mx-5 h-48 rounded-3xl items-center justify-center"
          style={{ backgroundColor: "#3D5A3E15" }}
        >
          {recipe.image ? <Text className="text-7xl">{recipe.image}</Text> : <Ionicons name="flask-outline" size={64} color="#A8B89C" />}
        </View>

        {/* Title & Meta */}
        <View className="px-5 mt-4">
          <Text className="text-2xl font-bold text-dark">{recipe.title}</Text>
          <Text className="text-sm text-dark/50 mt-1 leading-5">
            {recipe.description}
          </Text>

          {/* Meta Info */}
          <View
            className="flex-row mt-4 bg-white rounded-3xl p-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.12)",
            }}
          >
            <View className="flex-1 items-center">
              <DifficultyStars difficulty={recipe.difficulty} />
              <Text className="text-xs text-dark/40 mt-1">Difficulty</Text>
            </View>
            <View className="w-px bg-dark/10" />
            <View className="flex-1 items-center">
              <View className="flex-row items-center gap-1">
                <Ionicons name="time-outline" size={16} color="#3D5A3E" />
                <Text className="text-sm font-semibold text-dark">
                  {recipe.timeMinutes} min
                </Text>
              </View>
              <Text className="text-xs text-dark/40 mt-1">Time</Text>
            </View>
          </View>
        </View>

        {/* Ingredients */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-dark mb-3">
            Ingredients
          </Text>
          <View
            className="bg-white rounded-3xl p-4"
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
            {recipe.ingredients.map((ing, index) => {
              const isChecked = checkedIngredients.has(index);
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => toggleIngredient(index)}
                  activeOpacity={0.7}
                  className={`flex-row items-start py-3 ${
                    index < recipe.ingredients.length - 1
                      ? "border-b border-dark/5"
                      : ""
                  }`}
                >
                  <View
                    className={`w-6 h-6 rounded-md items-center justify-center mr-3 mt-0.5 ${
                      isChecked ? "bg-forest" : "bg-forest/10"
                    }`}
                  >
                    {isChecked ? (
                      <Ionicons name="checkmark" size={14} color="white" />
                    ) : (
                      <Ionicons name="leaf" size={12} color="#3D5A3E" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-sm font-medium ${
                        isChecked
                          ? "text-dark/40 line-through"
                          : "text-dark"
                      }`}
                    >
                      {ing.name}
                    </Text>
                    <Text
                      className={`text-xs mt-0.5 ${
                        isChecked ? "text-dark/30" : "text-dark/50"
                      }`}
                    >
                      {ing.quantity}
                      {ing.note ? ` (${ing.note})` : ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Equipment Needed */}
        {recipe.equipment && recipe.equipment.length > 0 && (
          <View className="px-5 mt-6">
            <Text className="text-lg font-bold text-dark mb-3">
              Equipment Needed
            </Text>
            <View
              className="bg-white rounded-3xl p-4"
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
              {recipe.equipment.map((item, index) => (
                <View
                  key={index}
                  className={`flex-row items-center py-2.5 ${
                    index < recipe.equipment!.length - 1
                      ? "border-b border-dark/5"
                      : ""
                  }`}
                >
                  <View className="w-6 h-6 rounded-md items-center justify-center mr-3 bg-gold/15">
                    <Ionicons name="construct-outline" size={13} color="#C4A76C" />
                  </View>
                  <Text className="text-sm font-medium text-dark flex-1">
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Steps */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-bold text-dark mb-3">
            Instructions
          </Text>
          <View style={{ gap: 12 }}>
            {recipe.steps.map((step) => (
              <View
                key={step.step}
                className="bg-white rounded-3xl p-4"
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
                <View className="flex-row items-start">
                  <View
                    className="w-8 h-8 rounded-full bg-forest items-center justify-center mr-3"
                  >
                    <Text className="text-sm font-bold text-white">
                      {step.step}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-dark leading-5">
                      {step.instruction}
                    </Text>
                    {step.tip && (
                      <View className="flex-row items-start mt-2 bg-gold/10 rounded-xl p-2.5">
                        <Ionicons
                          name="bulb-outline"
                          size={14}
                          color="#C4A76C"
                        />
                        <Text className="text-xs text-gold-dark ml-2 flex-1">
                          {step.tip}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Tips */}
        {recipe.tips.length > 0 && (
          <View className="px-5 mt-6">
            <Text className="text-lg font-bold text-dark mb-3">
              Tips
            </Text>
            <View
              className="bg-white rounded-3xl p-4"
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
              {recipe.tips.map((tip, index) => (
                <View
                  key={index}
                  className={`flex-row items-start py-2.5 ${
                    index < recipe.tips.length - 1
                      ? "border-b border-dark/5"
                      : ""
                  }`}
                >
                  <Text className="text-forest mr-2">•</Text>
                  <Text className="text-sm text-dark/70 flex-1 leading-5">
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Made It Button */}
        <View className="px-5 mt-6">
          <TouchableOpacity
            onPress={handleMadeIt}
            activeOpacity={0.8}
            className={`rounded-3xl py-4 flex-row items-center justify-center ${
              madeIt ? "bg-forest" : "bg-gold"
            }`}
            style={{
              shadowColor: madeIt ? "#3D5A3E" : "#C4A76C",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons
              name={madeIt ? "checkmark-circle" : "flask"}
              size={22}
              color="white"
            />
            <Text className="text-white font-bold text-base ml-2">
              {madeIt ? "You made it!" : "I Made It!"}
            </Text>
          </TouchableOpacity>

          {displayMadeItCount > 0 && (
            <View className="flex-row items-center justify-center mt-3">
              <Ionicons name="people-outline" size={16} color="#3D5A3E" />
              <Text className="text-sm text-forest ml-1.5">
                {displayMadeItCount.toLocaleString()} {displayMadeItCount === 1 ? "person" : "people"} made this
              </Text>
            </View>
          )}
        </View>

        {/* Add to List Button */}
        <View className="px-5 mt-4">
          <TouchableOpacity
            onPress={handleAddToList}
            activeOpacity={0.8}
            className="rounded-3xl py-3.5 flex-row items-center justify-center bg-white"
            style={{
              borderWidth: 1,
              borderColor: "rgba(61,90,62,0.3)",
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Ionicons name="bookmark-outline" size={20} color="#3D5A3E" />
            <Text className="text-forest font-semibold text-base ml-2">
              Add to List
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add to List Modal */}
      <Modal
        visible={showListModal}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowListModal(false);
          setShowNewListInput(false);
          setNewListName("");
        }}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View
            className="bg-ivory rounded-t-3xl"
            style={{ borderTopWidth: 1, borderColor: "rgba(0,0,0,0.08)", maxHeight: "60%" }}
          >
            {/* Handle bar */}
            <View className="items-center pt-3 pb-1">
              <View className="w-10 h-1 rounded-full bg-dark/15" />
            </View>

            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pb-3">
              <Text className="text-lg font-bold text-dark">Add to List</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowListModal(false);
                  setShowNewListInput(false);
                  setNewListName("");
                }}
                hitSlop={8}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 32 }}>
              {/* Existing lists */}
              {recipeLists.map((list) => {
                const isInList = listsContaining.includes(list.id);
                return (
                  <TouchableOpacity
                    key={list.id}
                    onPress={() => handleToggleList(list.id)}
                    activeOpacity={0.7}
                    className="flex-row items-center py-3.5 border-b border-dark/5"
                  >
                    <Ionicons
                      name={isInList ? "checkbox" : "square-outline"}
                      size={22}
                      color={isInList ? "#3D5A3E" : "#999"}
                    />
                    <Text className="text-base text-dark ml-3 flex-1">
                      {list.name}
                    </Text>
                    <Text className="text-xs text-dark/40">
                      {list.recipeIds.length} recipes
                    </Text>
                  </TouchableOpacity>
                );
              })}

              {/* New list input */}
              {showNewListInput ? (
                <View className="flex-row items-center mt-3 gap-2">
                  <TextInput
                    value={newListName}
                    onChangeText={setNewListName}
                    placeholder="List name..."
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
                    <Text className="text-white font-semibold">Add</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowNewListInput(true)}
                  className="flex-row items-center py-3.5 mt-1"
                >
                  <Ionicons name="add-circle-outline" size={22} color="#3D5A3E" />
                  <Text className="text-base text-forest ml-3 font-medium">
                    Create New List
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
