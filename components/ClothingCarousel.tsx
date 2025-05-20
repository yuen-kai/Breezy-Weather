import React, { useEffect } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { ClothingItem } from "@/types/clothing";
import { Text, Icon, Tooltip } from "react-native-paper";
import { StyleSheet } from "react-native";
import useSettingsStore from "@/store/store";
import { useAppTheme } from "../theme";

interface ClothingCarouselProps {
  temperature: number;
  valuesArray: number[];
}

const ClothingCarousel: React.FC<ClothingCarouselProps> = ({ temperature, valuesArray }) => {
  const theme = useAppTheme();
  const { clothingItems } = useSettingsStore();

  const suggestion: ClothingItem =
    clothingItems.find((item) => temperature < item.temperatureRange[1]) ?? clothingItems[-1];

  const minTemp = Math.min(...valuesArray) ?? temperature;
  const maxTemp = Math.max(...valuesArray) ?? temperature;

  const hasDrasticChange = maxTemp - minTemp > 15;
  const ref = React.useRef<ICarouselInstance>(null);

  const currentIndex = clothingItems.findIndex((item) => item.name === suggestion?.name);

  useEffect(() => {
    if (ref.current && currentIndex !== -1) {
      ref.current.scrollTo({ index: currentIndex, animated: true });
    }
  }, [suggestion, currentIndex]);

  return (
    <View style={{ alignItems: "center", height: 200 }}>
      {suggestion ? (
        <>
          <Carousel
            ref={ref}
            loop={false}
            enabled={false} // Disable user control
            data={clothingItems}
            renderItem={({ item }) => {
              return (
                <View style={{ alignItems: "center", flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text variant="titleLarge" style={{ textAlign: "center", padding: 4 }}>
                      Suggested: {suggestion.name}
                    </Text>
                    {hasDrasticChange && (
                      <Tooltip title="Weather changes drastically" enterTouchDelay={0}>
                        <Icon source="swap-vertical-bold" color={theme.colors.error} size={25} />
                      </Tooltip>
                    )}
                  </View>

                  <Image
                    source={item.image}
                    style={[styles.icon, item.tint && { tintColor: theme.colors.onBackground }]}
                    contentFit="contain"
                  />
                </View>
              );
            }}
            width={400}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.9,
              parallaxScrollingOffset: 50,
            }}
          />
        </>
      ) : (
        <Text variant="bodyLarge">No suggestion found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    flex: 1,
    marginTop: 8,
    width: "100%",
  }
});

export default ClothingCarousel;
