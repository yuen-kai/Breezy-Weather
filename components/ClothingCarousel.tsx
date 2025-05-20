import React, { useEffect } from "react";
import { Dimensions, View, StyleProp, ImageStyle } from "react-native";
import { Image } from "expo-image";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { ClothingItem } from "@/types/clothing";
import { Text } from "react-native-paper";

const { width } = Dimensions.get("window");

interface ClothingCarouselProps {
  clothingItems: ClothingItem[];
  currentSuggestion: ClothingItem;
  imageStyle?: StyleProp<ImageStyle>;
}

const ClothingCarousel: React.FC<ClothingCarouselProps> = ({
  clothingItems,
  currentSuggestion,
  imageStyle,
}) => {
  const ref = React.useRef<ICarouselInstance>(null);

  // Find the index of the current suggestion in the clothing items array
  const currentIndex = clothingItems.findIndex((item) => item.name === currentSuggestion.name);

  // When the current suggestion changes, animate to that index
  useEffect(() => {
    if (ref.current && currentIndex !== -1) {
      ref.current.scrollTo({ index: currentIndex, animated: true });
    }
  }, [currentSuggestion, currentIndex]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Carousel
        ref={ref}
        loop={false}
        enabled={false} // Disable user control
        data={clothingItems}
        renderItem={({ item }) => {
          return (
            <>
            <Text variant="titleLarge" style={{ textAlign: "center", padding: 4 }}>
                Suggested: {currentSuggestion.name}
              </Text>
              <Image source={item.image} style={imageStyle} contentFit="contain" /> 
            </>
          );
        }}
        width={width * 0.7}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
      />
    </View>
  );
};

export default ClothingCarousel;
