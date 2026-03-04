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
} from "react-native-reanimated";
import { SafeAreaWrapper } from "@/components";

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
  {
    id: 1,
    question: "What does your morning skincare routine look like?",
    category: "Skincare",
    options: [
      { text: "Whatever's in the shower", emoji: "🚿", score: 1 },
      { text: "Drugstore basics", emoji: "🧴", score: 2 },
      { text: "Clean beauty brands", emoji: "🌿", score: 3 },
      { text: "DIY with natural oils", emoji: "✨", score: 4 },
    ],
  },
  {
    id: 2,
    question: "How do you feel about reading ingredient labels?",
    category: "Mindset",
    options: [
      { text: "Never looked at one", emoji: "🤷", score: 1 },
      { text: "Only when something looks weird", emoji: "🧐", score: 2 },
      { text: "I check most products", emoji: "📋", score: 3 },
      { text: "I won't buy without reading", emoji: "🔍", score: 4 },
    ],
  },
  {
    id: 3,
    question: "What's your go-to cleaning product?",
    category: "Cleaning",
    options: [
      { text: "Bleach and heavy chemicals", emoji: "🧪", score: 1 },
      { text: "Standard store brands", emoji: "🏪", score: 2 },
      { text: "Eco-friendly brands", emoji: "🌎", score: 3 },
      { text: "Vinegar, baking soda, DIY", emoji: "🫧", score: 4 },
    ],
  },
  {
    id: 4,
    question: "How do you shop for groceries?",
    category: "Food",
    options: [
      { text: "Fastest and cheapest", emoji: "🏃", score: 1 },
      { text: "Mix of convenience and quality", emoji: "🛒", score: 2 },
      { text: "Mostly organic when possible", emoji: "🥬", score: 3 },
      { text: "Farmers market and local first", emoji: "🌻", score: 4 },
    ],
  },
  {
    id: 5,
    question: "What's your relationship with fast fashion?",
    category: "Clothing",
    options: [
      { text: "Love a good haul", emoji: "🛍️", score: 1 },
      { text: "Buy when I need stuff", emoji: "👕", score: 2 },
      { text: "Trying to buy less, buy better", emoji: "♻️", score: 3 },
      { text: "Thrift, sustainable, or handmade only", emoji: "🧵", score: 4 },
    ],
  },
  {
    id: 6,
    question: "How do you deal with headaches?",
    category: "Mindset",
    options: [
      { text: "Pop an ibuprofen immediately", emoji: "💊", score: 1 },
      { text: "Medicine if it's really bad", emoji: "🤕", score: 2 },
      { text: "Try water and rest first", emoji: "💧", score: 3 },
      { text: "Peppermint oil and pressure points", emoji: "🌱", score: 4 },
    ],
  },
  {
    id: 7,
    question: "What kind of water do you drink?",
    category: "Food",
    options: [
      { text: "Straight from the tap", emoji: "🚰", score: 1 },
      { text: "Filtered pitcher", emoji: "🫗", score: 2 },
      { text: "Reverse osmosis or Berkey", emoji: "💎", score: 3 },
      { text: "Spring water, glass bottles only", emoji: "🏔️", score: 4 },
    ],
  },
  {
    id: 8,
    question: "What's under your bathroom sink?",
    category: "Personal Care",
    options: [
      { text: "No idea, it's chaos", emoji: "🫠", score: 1 },
      { text: "Regular drugstore products", emoji: "🧴", score: 2 },
      { text: "A mix of clean and conventional", emoji: "🌿", score: 3 },
      { text: "Everything is non-toxic or homemade", emoji: "🌸", score: 4 },
    ],
  },
  {
    id: 9,
    question: "How do you feel about candles and air fresheners?",
    category: "Home",
    options: [
      { text: "Love a good Febreze moment", emoji: "🌬️", score: 1 },
      { text: "Candles are a vibe", emoji: "🕯️", score: 2 },
      { text: "Soy or beeswax candles only", emoji: "🐝", score: 3 },
      { text: "Essential oil diffuser all day", emoji: "🫐", score: 4 },
    ],
  },
  {
    id: 10,
    question: "What does self-care Sunday look like for you?",
    category: "Mindset",
    options: [
      { text: "Netflix and snacks", emoji: "📺", score: 1 },
      { text: "Face mask and chill", emoji: "🧖", score: 2 },
      { text: "Journaling, yoga, clean meals", emoji: "🧘", score: 3 },
      { text: "Dry brushing, bone broth, grounding", emoji: "🌍", score: 4 },
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
    <View style={{ width: width - 48 }} className="mx-6">
      <Text className="text-sm font-medium text-sage mb-2 uppercase tracking-wider">
        {question.category}
      </Text>
      <Text className="text-2xl font-bold text-dark mb-6">
        {question.question}
      </Text>
      <View className="gap-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedAnswer === idx;
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => onSelect(idx)}
              className={`flex-row items-center p-4 rounded-2xl border-2 ${
                isSelected
                  ? "bg-sage/10 border-sage"
                  : "bg-white border-cream-dark"
              }`}
              activeOpacity={0.7}
            >
              <Text className="text-2xl mr-3">{option.emoji}</Text>
              <Text
                className={`text-base flex-1 ${
                  isSelected
                    ? "text-sage-dark font-semibold"
                    : "text-dark"
                }`}
              >
                {option.text}
              </Text>
              {isSelected && (
                <View className="w-6 h-6 rounded-full bg-sage items-center justify-center">
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
    // Calculate total score
    let totalScore = 0;
    answers.forEach((answerIdx, qIdx) => {
      if (answerIdx !== null) {
        totalScore += questions[qIdx].options[answerIdx].score;
      }
    });
    // Normalize to 1-100 scale (min possible: 10, max possible: 40)
    const normalizedScore = Math.round(((totalScore - 10) / 30) * 99) + 1;
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
      <View className="flex-row items-center justify-between px-6 pt-2 pb-4">
        <TouchableOpacity onPress={handleBack} className="p-1">
          <Text className="text-sage text-base font-medium">
            {currentIndex === 0 ? "Exit" : "Back"}
          </Text>
        </TouchableOpacity>
        <Text className="text-dark font-semibold">
          {currentIndex + 1} / {questions.length}
        </Text>
        <View className="w-12" />
      </View>

      {/* Progress Bar */}
      <View className="mx-6 h-2 bg-cream-dark rounded-full overflow-hidden mb-6">
        <Animated.View
          className="h-full bg-sage rounded-full"
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
            className={`py-4 rounded-2xl items-center ${
              allAnswered ? "bg-sage" : "bg-sage/50"
            }`}
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
