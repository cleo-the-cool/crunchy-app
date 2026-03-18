import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  useAnimatedScrollHandler,
  Extrapolation,
  FadeIn,
} from "react-native-reanimated";
import { SafeAreaWrapper } from "@/components";
import * as Haptics from "../utils/haptics";

const { width } = Dimensions.get("window");

interface QuizOption {
  text: string;
  emoji: string;
  score: number;
}

interface QuizQuestion {
  id: number;
  question: string;
  category: string;
  options: QuizOption[];
}

const questions: QuizQuestion[] = [
  // — Food & Nutrition (3) —
  {
    id: 1,
    question: "How do you feel about seed oils?",
    category: "Food & Nutrition",
    options: [
      { text: "Seed oils? Like sunflower? They're fine", emoji: "", score: 1 },
      { text: "I've heard they're bad but haven't changed much", emoji: "", score: 2 },
      { text: "I try to avoid them when cooking at home", emoji: "", score: 3 },
      { text: "Eliminated. Tallow, butter, and olive oil only", emoji: "", score: 4 },
    ],
  },
  {
    id: 2,
    question: "What does grocery shopping look like for you?",
    category: "Food & Nutrition",
    options: [
      { text: "Grab what's fast and cheap, no stress", emoji: "🏃", score: 1 },
      { text: "I buy some organic stuff if it's not too pricey", emoji: "🛒", score: 2 },
      { text: "Mostly organic, I check the Dirty Dozen list", emoji: "🥬", score: 3 },
      { text: "Farmers market, local co-op, or I grow my own", emoji: "🌻", score: 4 },
    ],
  },
  {
    id: 3,
    question: "What's your supplement situation?",
    category: "Food & Nutrition",
    options: [
      { text: "I don't take any", emoji: "😅", score: 1 },
      { text: "A multivitamin when I remember", emoji: "💊", score: 2 },
      { text: "A few targeted ones — D3, magnesium, etc.", emoji: "🧬", score: 3 },
      { text: "Full stack, whole-food sourced, third-party tested", emoji: "🍄", score: 4 },
    ],
  },
  // — Personal Care & Beauty (3) —
  {
    id: 4,
    question: "What's your deodorant situation?",
    category: "Personal Care",
    options: [
      { text: "Whatever smells good at the store", emoji: "🧴", score: 1 },
      { text: "Aluminum-free from a regular brand", emoji: "🌀", score: 2 },
      { text: "Clean brand like Native or Primally Pure", emoji: "🌿", score: 3 },
      { text: "Clean brand with simple ingredients I trust", emoji: "✨", score: 4 },
    ],
  },
  {
    id: 5,
    question: "What's your sunscreen philosophy?",
    category: "Personal Care",
    options: [
      { text: "Whatever's on sale, SPF is SPF", emoji: "☀️", score: 1 },
      { text: "I try to get a decent one without weird stuff", emoji: "🧴", score: 2 },
      { text: "Mineral only — zinc oxide, no chemical filters", emoji: "🛡️", score: 3 },
      { text: "Mineral-only and I layer up with hats and shade", emoji: "🤔", score: 4 },
    ],
  },
  {
    id: 6,
    question: "What does your haircare look like?",
    category: "Personal Care",
    options: [
      { text: "Shampoo and conditioner, nothing fancy", emoji: "🚿", score: 1 },
      { text: "Sulfate-free or salon brands", emoji: "💇", score: 2 },
      { text: "Clean beauty brands, minimal ingredients", emoji: "🌸", score: 3 },
      { text: "All-natural brands, I read every ingredient label", emoji: "🍎", score: 4 },
    ],
  },
  // — Home & Cleaning (2) —
  {
    id: 7,
    question: "What's your go-to for cleaning the house?",
    category: "Home & Cleaning",
    options: [
      { text: "Bleach, Lysol — if it kills germs I'm happy", emoji: "🧪", score: 1 },
      { text: "Standard stuff, maybe some Method or Mrs. Meyer's", emoji: "🏪", score: 2 },
      { text: "Branch Basics, Force of Nature, or similar", emoji: "🌎", score: 3 },
      { text: "Vinegar, baking soda, castile soap — DIY everything", emoji: "🫧", score: 4 },
    ],
  },
  {
    id: 8,
    question: "What's making your home smell good?",
    category: "Home & Cleaning",
    options: [
      { text: "Febreze, Glade plug-ins, whatever works", emoji: "🌬️", score: 1 },
      { text: "Bath & Body Works candles are my weakness", emoji: "🕯️", score: 2 },
      { text: "Beeswax or coconut wax candles with essential oils", emoji: "🐝", score: 3 },
      { text: "Just open a window, diffuse essential oils, or nothing", emoji: "🪟", score: 4 },
    ],
  },
  // — Health & Wellness (3) —
  {
    id: 9,
    question: "You have a headache. What's the move?",
    category: "Health & Wellness",
    options: [
      { text: "Advil. Immediately. Don't think about it", emoji: "💊", score: 1 },
      { text: "Try to tough it out, take meds if it gets bad", emoji: "🤕", score: 2 },
      { text: "Water, magnesium, rest, maybe a cold compress", emoji: "💧", score: 3 },
      { text: "Peppermint oil on the temples and pressure points", emoji: "🌱", score: 4 },
    ],
  },
  {
    id: 10,
    question: "How do you take care of your mental health?",
    category: "Health & Wellness",
    options: [
      { text: "I don't really have a routine for it", emoji: "🫠", score: 1 },
      { text: "Therapy or talking to friends when I need to", emoji: "💬", score: 2 },
      { text: "Journaling, meditation, or breathwork regularly", emoji: "🧘", score: 3 },
      { text: "Daily practice: journaling, walks in nature, screen limits", emoji: "🧊", score: 4 },
    ],
  },
  {
    id: 11,
    question: "What kind of movement do you do?",
    category: "Health & Wellness",
    options: [
      { text: "Does walking to the fridge count?", emoji: "😂", score: 1 },
      { text: "Gym when I feel like it, nothing consistent", emoji: "🏋️", score: 2 },
      { text: "Regular routine — yoga, running, or lifting", emoji: "🏃‍♀️", score: 3 },
      { text: "Consistent routine — I love how movement makes me feel", emoji: "🦶", score: 4 },
    ],
  },
  // — Lifestyle & Values (2) —
  {
    id: 12,
    question: "What's your relationship with fast fashion?",
    category: "Lifestyle & Values",
    options: [
      { text: "Shein hauls are my love language", emoji: "🛍️", score: 1 },
      { text: "I buy what I need, mix of everything", emoji: "👕", score: 2 },
      { text: "Trying to buy less, invest in quality", emoji: "♻️", score: 3 },
      { text: "Thrift, sustainable brands, or handmade only", emoji: "🧵", score: 4 },
    ],
  },
  {
    id: 13,
    question: "What kind of water do you drink?",
    category: "Lifestyle & Values",
    options: [
      { text: "Straight from the tap, it's fine", emoji: "🚰", score: 1 },
      { text: "Brita or fridge filter", emoji: "🫗", score: 2 },
      { text: "Berkey, reverse osmosis, or similar", emoji: "💎", score: 3 },
      { text: "High-quality filter and I add minerals back", emoji: "🏔️", score: 4 },
    ],
  },
  // — Baby & Family (2) —
  {
    id: 14,
    question: "What products are around your kids or pets?",
    category: "Baby & Family",
    options: [
      { text: "Haven't thought about it much honestly", emoji: "🤷", score: 1 },
      { text: "Mostly regular stuff, some baby-safe options", emoji: "🍼", score: 2 },
      { text: "I research everything that touches them", emoji: "🔍", score: 3 },
      { text: "Non-toxic everything — even their mattress and toys", emoji: "🧸", score: 4 },
    ],
  },
  {
    id: 15,
    question: "How do you handle your pet's food and products?",
    category: "Baby & Family",
    options: [
      { text: "Whatever's at the store, they seem happy", emoji: "🐕", score: 1 },
      { text: "Decent brand, maybe grain-free", emoji: "🦴", score: 2 },
      { text: "Raw diet or high-quality whole-food brand", emoji: "🥩", score: 3 },
      { text: "Premium whole-food brand, I read pet labels too", emoji: "🌿", score: 4 },
    ],
  },
];

function QuestionCard({
  question,
  selectedAnswer,
  onSelect,
}: {
  question: QuizQuestion;
  selectedAnswer: number | null;
  onSelect: (score: number) => void;
}) {
  return (
    <View style={{ width }} className="px-6">
      <Text className="text-sm font-medium text-forest mb-2 uppercase tracking-wider">
        {question.category}
      </Text>
      <Text className="text-2xl font-bold text-dark mb-6" style={{ fontFamily: 'System', fontWeight: '700', letterSpacing: 0.3 }}>
        {question.question}
      </Text>
      <View className="gap-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedAnswer === idx;
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => onSelect(idx)}
              className={`flex-row items-center p-4 rounded-3xl border-2 ${
                isSelected
                  ? "bg-forest/8 border-forest"
                  : "bg-cream border-cream-dark"
              }`}
              activeOpacity={0.7}
            >
              <Text className="text-2xl mr-3">{option.emoji}</Text>
              <Text
                className={`text-base flex-1 ${
                  isSelected
                    ? "text-forest font-semibold"
                    : "text-dark"
                }`}
              >
                {option.text}
              </Text>
              {isSelected && (
                <View className="w-6 h-6 rounded-full bg-forest items-center justify-center">
                  <Text className="text-white text-xs font-bold">✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function QuizScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const progressWidth = useSharedValue(0);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleSelect = (questionIdx: number, optionIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIdx] = optionIdx;
    setAnswers(newAnswers);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Auto-advance after short delay
    setTimeout(() => {
      if (questionIdx < questions.length - 1) {
        const nextIndex = questionIdx + 1;
        setCurrentIndex(nextIndex);
        scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
        progressWidth.value = withSpring(
          ((nextIndex + 1) / questions.length) * 100
        );
      }
    }, 400);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      scrollRef.current?.scrollTo({ x: prevIndex * width, animated: true });
      progressWidth.value = withSpring(
        ((prevIndex + 1) / questions.length) * 100
      );
    } else {
      router.back();
    }
  };

  const handleFinish = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Calculate total score
    let totalScore = 0;
    answers.forEach((answerIdx, qIdx) => {
      if (answerIdx !== null) {
        totalScore += questions[qIdx].options[answerIdx].score;
      }
    });
    // Normalize to 1-100 scale (min possible: 15, max possible: 60)
    const normalizedScore = Math.round(((totalScore - 15) / 45) * 99) + 1;
    const clampedScore = Math.max(1, Math.min(100, normalizedScore));

    router.push({
      pathname: "/quiz-result",
      params: { score: clampedScore.toString() },
    });
  };

  const allAnswered = answers.every((a) => a !== null);
  const isLastQuestion = currentIndex === questions.length - 1;

  // Initialize progress
  React.useEffect(() => {
    progressWidth.value = withTiming((1 / questions.length) * 100);
  }, []);

  return (
    <SafeAreaWrapper>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} className="flex-row items-center justify-between px-6 pt-2 pb-4">
        <TouchableOpacity onPress={handleBack} className="p-1">
          <Text className="text-forest text-base font-medium">
            {currentIndex === 0 ? "Exit" : "Back"}
          </Text>
        </TouchableOpacity>
        <Text className="text-dark font-semibold">
          {currentIndex + 1} of {questions.length}
        </Text>
        <View className="w-12" />
      </Animated.View>

      {/* Progress Bar */}
      <View className="mx-6 h-2.5 bg-cream-dark rounded-full overflow-hidden mb-6">
        <Animated.View
          className="h-full bg-forest rounded-full"
          style={progressStyle}
        />
      </View>

      {/* Questions Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "flex-start" }}
      >
        {questions.map((q, idx) => (
          <QuestionCard
            key={q.id}
            question={q}
            selectedAnswer={answers[idx]}
            onSelect={(optionIdx) => handleSelect(idx, optionIdx)}
          />
        ))}
      </ScrollView>

      {/* Finish Button */}
      {isLastQuestion && answers[currentIndex] !== null && (
        <View className="px-6 pb-6">
          <TouchableOpacity
            onPress={handleFinish}
            disabled={!allAnswered}
            className={`py-4 rounded-3xl items-center ${
              allAnswered ? "bg-forest" : "bg-forest/50"
            }`}
            style={
              allAnswered
                ? {
                    shadowColor: "#3D5A3E",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }
                : undefined
            }
          >
            <Text className="text-white text-lg font-semibold">
              See My Score
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaWrapper>
  );
}
