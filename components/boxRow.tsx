import React from "react";
import { View, StyleSheet } from "react-native";
import { useAppTheme } from "../theme";

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
	const theme = useAppTheme();
	
	const styles = StyleSheet.create({
		container: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			marginHorizontal: 10,
			flex:1,
		},
		box: {
			flex: 1,
			height: "70%",
			// aspectRatio: 1,
			margin: 1,
			backgroundColor: theme.colors.emptyBox,
		},
		highlightedBox: {
			backgroundColor: theme.colors.highlightedBox,
		},
	});

	return (
		<View style={[styles.container, containerStyle]}>
			{Array.from({ length: numBoxes }).map((_, index) => (
				<React.Fragment key={index}>
					<View
						style={[
							styles.box,
							index <= selectedBox && styles.highlightedBox, // Apply highlight style
							{
								borderTopLeftRadius: index === 0 ? 5 : 0,
								borderTopRightRadius: index === numBoxes - 1 ? 5 : 0,
								borderBottomLeftRadius: index === 0 ? 5 : 0,
								borderBottomRightRadius: index === numBoxes - 1 ? 5 : 0,
							},
						]}
					/>
				</React.Fragment>
			))}
		</View>
	);
};


export default BoxRow;
