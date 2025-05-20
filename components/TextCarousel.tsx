import React, { useEffect, useRef } from "react";
import { Text } from "react-native-paper";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { VariantProp } from "react-native-paper/lib/typescript/components/Typography/types";
import { ClothingItem } from "@/types/clothing";

interface TextCarouselProps {
  clothingItems: ClothingItem[];
  currentSuggestion: ClothingItem;
  textVariant?: VariantProp<never>;
}

const TextCarousel: React.FC<TextCarouselProps> = ({
  clothingItems,
  currentSuggestion,
  textVariant = "bodyLarge",
}) => {
  const ref = useRef<ICarouselInstance>(null);

  const textItems = clothingItems.map((item) => item.name);

  const currentIndex = textItems.findIndex((item) => item === currentSuggestion.name);

  useEffect(() => {
    if (ref.current && currentIndex !== -1) {
      ref.current.scrollTo({ index: currentIndex, animated: true });
    }
  }, [currentSuggestion, currentIndex]);

  return (
    <Carousel
      ref={ref}
      loop={false}
      enabled={true}
      data={textItems}
      renderItem={({ item }) => (
        <Text variant={textVariant} style={{ textAlign: "center"}}>
          {item}
        </Text>
      )}
      width={250}
      height={28}
      vertical={true}
      mode="parallax"
      modeConfig={{
        parallaxScrollingScale: 0.9,
        parallaxScrollingOffset: 50,
      }}
    />
  );
};

export default TextCarousel;
