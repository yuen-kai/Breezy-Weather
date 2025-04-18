// app/components/ClothingSuggestion.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Text } from "react-native-paper";
import { useAppTheme } from "../theme";
import { ClothingItem } from "@/types/clothing";
import useSettingsStore from "@/store/store";
import { VariantProp } from "react-native-paper/lib/typescript/components/Typography/types";

interface ClothingSuggestionProps {
	temperature: number; // in correct unit (e.g., already converted to F if user chose imperial)
	textWidth?: number;
	textVariant?: VariantProp<never>;
}

const ClothingSuggestion: React.FC<ClothingSuggestionProps> = ({
	temperature,
	textWidth,
	textVariant = "bodyLarge",
}) => {
	const theme = useAppTheme();
	const { clothingItems } = useSettingsStore();

	// Find the first clothing item that matches the temperature range given a sorted list
	const suggestion: ClothingItem =
		clothingItems.find((item) => temperature < item.temperatureRange[1]) ?? clothingItems[-1];

	return (
		<View style={styles.container}>
			{suggestion ? (
				<>
					<Text variant={textVariant} style={{ width: textWidth, textAlign: "center", padding: 4 }}>
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
	windText: {
		marginTop: 4,
		color: "orange",
	},
});

export default ClothingSuggestion;
