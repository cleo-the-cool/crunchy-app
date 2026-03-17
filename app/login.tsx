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

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, appleSignIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!email.includes("@") || !email.includes(".")) newErrors.email = "Enter a valid email";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Login Failed", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleAppleSignIn() {
    setLoading(true);
    try {
      await appleSignIn();
      router.replace("/(tabs)");
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
            <Text className="text-2xl font-bold text-dark mb-1" style={{ fontFamily: 'Georgia' }}>Welcome Back</Text>
            <Text className="text-base text-dark-light">Log in to your Crunchy account</Text>
          </View>

          {/* OAuth Buttons */}
          <View className="gap-3 mb-6">
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
              <View className="flex-row justify-between items-center mb-1.5">
                <Text className="text-sm font-medium text-dark">Password</Text>
                <TouchableOpacity>
                  <Text className="text-sm text-forest">Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center border-2 border-cream-dark rounded-3xl bg-cream">
                <TextInput
                  value={password}
                  onChangeText={(t) => { setPassword(t); if (errors.password) setErrors((e) => ({ ...e, password: undefined })); }}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  autoComplete="current-password"
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

          {/* Login Button */}
          <Button
            title="Log In"
            onPress={handleLogin}
            loading={loading}
            className="mb-6"
          />

          {/* Link to Sign Up */}
          <View className="flex-row justify-center">
            <Text className="text-dark-light">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/signup")}>
              <Text className="text-forest font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}
