import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import { SafeAreaWrapper, Button } from "@/components";
import { useAuth } from "@/contexts/AuthContext";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, appleSignIn } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; terms?: string }>({});

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!email.includes("@") || !email.includes(".")) newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Must be at least 6 characters";
    if (!agreedToTerms) newErrors.terms = "You must agree to the Terms of Service";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSignUp() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signUp(email, password, name);
      router.replace("/onboarding-profile");
    } catch (err: any) {
      Alert.alert("Sign Up Failed", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleAppleSignIn() {
    setLoading(true);
    try {
      await appleSignIn();
      router.replace("/onboarding-profile");
    } catch (err: any) {
      if (err.code === "ERR_REQUEST_CANCELED") {
        // User cancelled - do nothing
      } else {
        Alert.alert("Apple Sign In Failed", err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleOAuthMock(provider: string) {
    Alert.alert("Coming Soon", `${provider} sign-in will be available soon!`);
  }

  return (
    <SafeAreaWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6 pt-8 pb-6"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 rounded-2xl bg-forest items-center justify-center mb-4">
              <Ionicons name="leaf" size={32} color="white" />
            </View>
            <Text className="text-2xl font-bold text-dark mb-1" style={{ fontFamily: 'Georgia' }}>Create Account</Text>
            <Text className="text-base text-dark-light">Join the clean living community</Text>
          </View>

          {/* OAuth Buttons */}
          <View className="gap-3 mb-6">
            <TouchableOpacity
              onPress={() => handleOAuthMock("Google")}
              activeOpacity={0.8}
              className="flex-row items-center justify-center py-4 rounded-3xl border-2 border-sage/15 bg-cream"
            >
              <Ionicons name="logo-google" size={20} color="#4285F4" />
              <Text className="text-base font-semibold text-dark ml-3">
                Continue with Google
              </Text>
            </TouchableOpacity>

            {Platform.OS === "ios" && (
              <TouchableOpacity
                onPress={handleAppleSignIn}
                activeOpacity={0.8}
                className="flex-row items-center justify-center py-4 rounded-3xl border-2 border-sage/15 bg-cream"
              >
                <Ionicons name="logo-apple" size={20} color="#000000" />
                <Text className="text-base font-semibold text-dark ml-3">
                  Continue with Apple
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Divider */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-cream-dark" />
            <Text className="mx-4 text-sm text-dark-light">or</Text>
            <View className="flex-1 h-px bg-cream-dark" />
          </View>

          {/* Form Fields */}
          <View className="gap-4 mb-6">
            {/* Name */}
            <View>
              <Text className="text-sm font-medium text-dark mb-1.5">Name</Text>
              <TextInput
                value={name}
                onChangeText={(t) => { setName(t); if (errors.name) setErrors((e) => ({ ...e, name: undefined })); }}
                placeholder="Your name"
                placeholderTextColor="#999"
                autoCapitalize="words"
                className="border-2 border-cream-dark rounded-3xl px-4 py-3.5 text-base text-dark bg-cream"
              />
              {errors.name && <Text className="text-rating-avoid text-sm mt-1">{errors.name}</Text>}
            </View>

            {/* Email */}
            <View>
              <Text className="text-sm font-medium text-dark mb-1.5">Email</Text>
              <TextInput
                value={email}
                onChangeText={(t) => { setEmail(t); if (errors.email) setErrors((e) => ({ ...e, email: undefined })); }}
                placeholder="you@example.com"
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                className="border-2 border-cream-dark rounded-3xl px-4 py-3.5 text-base text-dark bg-cream"
              />
              {errors.email && <Text className="text-rating-avoid text-sm mt-1">{errors.email}</Text>}
            </View>

            {/* Password */}
            <View>
              <Text className="text-sm font-medium text-dark mb-1.5">Password</Text>
              <View className="flex-row items-center border-2 border-cream-dark rounded-3xl bg-cream">
                <TextInput
                  value={password}
                  onChangeText={(t) => { setPassword(t); if (errors.password) setErrors((e) => ({ ...e, password: undefined })); }}
                  placeholder="At least 6 characters"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  className="flex-1 px-4 py-3.5 text-base text-dark"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="px-4"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text className="text-rating-avoid text-sm mt-1">{errors.password}</Text>}
            </View>
          </View>

          {/* Terms of Service Checkbox */}
          <View className="mb-6">
            <TouchableOpacity
              onPress={() => {
                setAgreedToTerms(!agreedToTerms);
                if (errors.terms) setErrors((e) => ({ ...e, terms: undefined }));
              }}
              activeOpacity={0.7}
              className="flex-row items-start"
            >
              <View
                className={`w-5 h-5 rounded border-2 items-center justify-center mt-0.5 ${
                  agreedToTerms ? "bg-forest border-forest" : "border-cream-dark bg-white"
                }`}
              >
                {agreedToTerms && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
              <Text className="text-sm text-dark/70 ml-2 flex-1">
                I agree to the{" "}
                <Text
                  className="text-forest font-semibold"
                  onPress={() => router.push("/terms-of-service")}
                >
                  Terms of Service
                </Text>
                {" "}and{" "}
                <Text
                  className="text-forest font-semibold"
                  onPress={() => router.push("/privacy-policy")}
                >
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>
            {errors.terms && (
              <Text className="text-rating-avoid text-sm mt-1 ml-7">{errors.terms}</Text>
            )}
          </View>

          {/* Sign Up Button */}
          <Button
            title="Create Account"
            onPress={handleSignUp}
            loading={loading}
            className="mb-6"
          />

          {/* Link to Login */}
          <View className="flex-row justify-center">
            <Text className="text-dark-light">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text className="text-forest font-semibold">Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}
