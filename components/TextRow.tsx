import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

interface TextRowProps {
	label: string;
	value: string;
}

export const TextRow: React.FC<TextRowProps> = ({ label, value }) => {
	return (
		<View style={styles.infoRow}>
			<Text variant="bodyLarge" style={{ flex: 2.2 }}>
				{label}:
			</Text>
			<Text variant="bodyLarge" style={[styles.infoColn, { flex: 3.2 + 1.3 }]}>
				{value}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	infoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginVertical: 2,
	},
	infoColn: {
		flexDirection: "column",
		marginVertical: 2,
	},
});
