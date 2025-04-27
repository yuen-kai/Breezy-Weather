import React from "react";
import LottieView from "lottie-react-native";
import { View } from "react-native";

export default function CustomSplashScreen() {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: "center", 
      alignItems: "center", 
      position: "absolute", 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      zIndex: 999, 
      backgroundColor: "#fff" 
    }}>
      <LottieView
        source={require("../assets/preload/splash.json")}
        style={{
          width: "60%",
          height: "60%",
          marginBottom: 20,
        }}
        autoPlay
        loop
      />
    </View>
  );
}
