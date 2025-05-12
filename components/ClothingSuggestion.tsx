// app/components/ClothingSuggestion.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Text } from "react-native-paper";
import DrasticChangeTooltip from "./DrasticChangeTooltip";
import { Tooltip } from "@rneui/themed";
import { useAppTheme } from "../theme";
import { ClothingItem } from "@/types/clothing";
import useSettingsStore from "@/store/store";
import { VariantProp } from "react-native-paper/lib/typescript/components/Typography/types";
import { getSortedTimeOfDay, getDrasticChangeMessage } from "@/functions/drasticChange";
import { convertToScale } from "@/components/InfoRow";
import { getAverage } from "@/functions/average";

interface ClothingSuggestionProps {
  temperature: number; // in correct unit (e.g., already converted to F if user chose imperial)
  valuesArray?: number[];
  textWidth?: number;
  textVariant?: VariantProp<never>;
  day?: number;
}

const ClothingSuggestion: React.FC<ClothingSuggestionProps> = ({
  temperature,
  valuesArray = [],
  textWidth,
  textVariant = "bodyLarge",
  day,
}) => {
  const theme = useAppTheme();
  const { clothingItems, timeOfDay, timeOfDaySettings } = useSettingsStore();

  // Find the first clothing item that matches the temperature range given a sorted list
  const suggestion: ClothingItem =
    clothingItems.find((item) => temperature < item.temperatureRange[1]) ?? clothingItems[-1];

  if (valuesArray.length > 0 && day === undefined) {
    console.warn("day is undefined");
  }
  const sortedTimeOfDay = getSortedTimeOfDay(timeOfDay, timeOfDaySettings, day ?? 0);
  const drasticChangeMessage =
    valuesArray.length > 0
      ? getDrasticChangeMessage(
          timeOfDaySettings,
          valuesArray,
          temperature,
          clothingItems.map((item) => item.temperatureRange[1]),
          day ?? 0,
          false,
          "",
          getAverage,
          "",
          convertToScale,
          clothingItems.map((item) => item.name),
          sortedTimeOfDay
        )
      : "";

  return (
    <View style={styles.container}>
      {suggestion ? (
        <>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              variant={textVariant}
              style={{ width: textWidth, textAlign: "center", padding: 4 }}
            >
              Suggested: {suggestion.name}
            </Text>
            {drasticChangeMessage && (
              <DrasticChangeTooltip 
                message={drasticChangeMessage}
                sortedTimeOfDay={sortedTimeOfDay}
              />
            )}
          </View>

          {suggestion.image && (
            <Image
              source={suggestion.image}
              style={[styles.icon, suggestion.tint && { tintColor: theme.colors.onBackground }]}
              contentFit="contain"
            />
          )}
        </>
      ) : (
        <Text variant="bodyLarge">No suggestion found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    alignItems: "center",
    flex: 1,
  },
  icon: {
    flex: 1,
    marginTop: 8,
    width: "100%",
  },
  windText: {
    marginTop: 4,
    color: "orange",
  },
});

export default ClothingSuggestion;
