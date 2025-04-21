import React from "react";
import SplashScreen from "@/components/resources/SplashScreen";
import { View } from "react-native";

export default function SplashTest() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <SplashScreen />
    </View>
  );
}