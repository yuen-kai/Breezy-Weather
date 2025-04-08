import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useAppTheme } from "../theme";

interface BoxRowProps {
    numBoxes: number;
    selectedBox: number;
    previousSelectedBox?: number;
    containerStyle?: object;
}

const BoxRow: React.FC<BoxRowProps> = ({
    numBoxes,
    selectedBox,
    previousSelectedBox,
    containerStyle,
}) => {
    const theme = useAppTheme();

    const styles = StyleSheet.create({
        container: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginHorizontal: 10,
            flex: 1,
        },
        background: {
            width: "100%",
            height: "70%",
            backgroundColor: theme.colors.emptyBox,
            borderRadius: 10,
            overflow: "hidden",
            position: "absolute",
        },
        highlightedSection: {
            backgroundColor: theme.colors.highlightedBox,
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            height: "100%",
            width: `${(selectedBox + 1) / numBoxes * 100}%`,
        },
    });

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.background}>
                <View style={styles.highlightedSection} />
                {Array.from({ length: numBoxes - 1 }).map((_, index) => (
                    <View
                        key={`divider-${index}`}
                        style={{
                            position: 'absolute',
                            height: '100%',
                            width: 1,
                            backgroundColor: theme.colors.background,
                            left: `${((index + 1) / numBoxes) * 100}%`,
                        }}
                    />
                ))}
            </View>
        </View>
    );
};

export default BoxRow;