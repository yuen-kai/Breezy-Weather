import React from "react";
import { View, StyleSheet } from "react-native";
import { Card } from "react-native-paper";

interface BoxRowProps {
	numBoxes: number;
	selectedBox: number;
	containerStyle?: object;
}

const BoxRow: React.FC<BoxRowProps> = ({
	numBoxes,
	selectedBox,
	containerStyle,
}) => {
	return (
		<View style={[styles.container, containerStyle]}>
			{Array.from({ length: numBoxes }).map((_, index) => (
				<>
					<View
						key={index}
						style={[
							styles.box,
							index <= selectedBox && styles.highlightedBox, // Apply highlight style
						]}
					/>
					{numBoxes == 3 && index<2 ? (
						<View
							key={-index-1}
							style={[
								styles.box,
								{ opacity: 0 }, // Apply highlight style
							]}
						/>
					) : null}
				</>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginHorizontal: 10,
	},
	box: {
		flex: 1,
		margin: 2,
		aspectRatio: 1,
		backgroundColor: "#f0f0f0",
	},
	highlightedBox: {
		backgroundColor: "#007AFF",
	},
});

export default BoxRow;
