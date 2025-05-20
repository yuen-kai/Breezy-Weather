import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Text } from "react-native-paper";
import { useAppTheme } from "../theme";
import { ClothingItem } from "@/types/clothing";
import useSettingsStore from "@/store/store";

interface ClothingHourlyProps {
  temperature: number;
}

const ClothingHourly: React.FC<ClothingHourlyProps> = ({
  temperature,
}) => {
  const theme = useAppTheme();
  const { clothingItems } = useSettingsStore();

  const suggestion: ClothingItem =
    clothingItems.find((item) => temperature < item.temperatureRange[1]) ?? clothingItems[-1];

  return (
    <View style={styles.container}>
      {suggestion ? (
        <>
          <Text variant="bodyLarge" style={{ textAlign: "center", padding: 4, width: 140 }}>
            Suggested: {suggestion.name}
          </Text>
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
});

export default ClothingHourly;
