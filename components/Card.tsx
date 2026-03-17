import { View } from "react-native";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <View
      className={`rounded-3xl p-5 ${className}`}
      style={{
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.12)",
      }}
    >
      {children}
    </View>
  );
}
