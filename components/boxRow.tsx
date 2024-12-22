import React from "react";
import { View, StyleSheet } from "react-native";
import { Card } from "react-native-paper";

interface BoxRowProps {
	numBoxes: number;
    selectedBox: number;
}

const BoxRow: React.FC<BoxRowProps> = ({ numBoxes, selectedBox }) => {
	return (
        <View style={styles.container}>
            {Array.from({ length: numBoxes }).map((_, index) => (
            <View
                key={index}
                style={[
                styles.box,
                index+1 <= selectedBox && styles.highlightedBox, // Apply highlight style
                ]}
            />
            ))}
        </View>
	);
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flex: 1,
        marginLeft: 30,
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
