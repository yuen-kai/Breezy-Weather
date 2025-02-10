// app/components/ClothingSuggestion.tsx
import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { Text, useTheme } from "react-native-paper";
import useSettingsStore from "../store/settingsStore";

interface ClothingSuggestionProps {
	temperature: number; // in correct unit (e.g., already converted to F if user chose imperial)
	textWidth?: number;
}

const ClothingSuggestion: React.FC<ClothingSuggestionProps> = ({
	temperature, textWidth
}) => {
	const { clothingItems } = useSettingsStore();
	const theme = useTheme();

	// Find the first clothing item that matches the temperature range
	const suggestion = clothingItems.find(
		(item) =>
			temperature >= item.temperatureRange[0] &&
			temperature < item.temperatureRange[1]
	);

	// Optionally, you can map clothing items to images/icons
	const clothingIcons: Record<string, any> = {
		"doublecoat_gloves": require("../assets/clothing/doublecoat-gloves.png"),
		"doublecoat": require("../assets/clothing/doublecoat.png"),
		"coat": require("../assets/clothing/coat.png"),
		"coat_sweater": require("../assets/clothing/coat-sweater.png"),
		"sweater": require("../assets/clothing/light-jacket.png"),
		"t-shirt": require("../assets/clothing/tshirt.png"),
		// Add more mappings as needed
	};


	return (
		<View style={styles.container}>
			{suggestion ? (
				<>
					<Text variant="bodyLarge" style={{width:textWidth, textAlign: "center"}} >Suggested: {suggestion.name}</Text>
					{clothingIcons[suggestion.id] && (
						<Image
							source={clothingIcons[suggestion.id]}
							style={[styles.icon, { tintColor: theme.colors.onBackground }]}
							resizeMode="contain"
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
	},
	windText: {
		marginTop: 4,
		color: "orange",
	},
});

export default ClothingSuggestion;
