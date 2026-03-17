import { SafeAreaView } from "react-native-safe-area-context";

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function SafeAreaWrapper({
  children,
  className = "",
}: SafeAreaWrapperProps) {
  return (
    <SafeAreaView className={`flex-1 bg-ivory ${className}`}>
      {children}
    </SafeAreaView>
  );
}
