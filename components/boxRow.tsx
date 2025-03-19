import React from "react";
import { View, StyleSheet } from "react-native";
import { Card } from "react-native-paper";

interface BoxRowProps {
	numBoxes: number;
	selectedBox: number;
	minBox?: number;
	maxBox?: number;
	containerStyle?: object;
}

const BoxRow: React.FC<BoxRowProps> = ({
	numBoxes,
	selectedBox,
	minBox,
	maxBox,
	containerStyle,
}) => {
	return (
		<View style={[styles.container, containerStyle]}>
			{Array.from({ length: numBoxes }).map((_, index) => (
				<React.Fragment key={index}>
					<View
						style={[
							styles.box,
							index === minBox && styles.minBox, // Apply min value style
							index === maxBox && styles.maxBox, // Apply max value style
							index <= selectedBox && styles.highlightedBox, // Apply highlight style
						]}
					/>
					{numBoxes == 3 && index < 2 ? (
						<View
							style={[
								styles.box,
								{ opacity: 0 }, // Apply highlight style
							]}
						/>
					) : null}
				</React.Fragment>
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
		// height: 27,
		aspectRatio: 1,
		margin: 1,
		backgroundColor: "lightgray",
	},
	highlightedBox: {
		backgroundColor: "#007AFF",
	},
	minBox: {
		backgroundColor: "lightblue", // Green color for minimum value
		borderWidth: 2,
		borderColor: "#fff",
	},
	maxBox: {
		backgroundColor: "lightblue", // Red color for maximum value
		borderWidth: 2,
		borderColor: "#fff",
	},
});

export default BoxRow;
