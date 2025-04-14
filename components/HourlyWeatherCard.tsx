// app/components/HourlyWeatherCard.tsx
import React from "react";
import { StyleSheet, View, Image } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import useSettingsStore from "../store/store";
import ClothingSuggestion from "./ClothingSuggestion";
import { checkIfInTimeOfDay } from "../functions/timeOfDayFunctions";

interface HourlyWeatherCardProps {
	time: string;
	overallScale: number;
	feelsLike: number;
	windSpeed: number;
	conditionIcon: string;
	day: number;
}

const HourlyWeatherCard: React.FC<HourlyWeatherCardProps> = ({
	time,
	overallScale,
	feelsLike,
	windSpeed,
	conditionIcon,
	day,
}) => {
	const theme = useTheme();
	const { timeOfDaySettings, timeOfDay } = useSettingsStore();

	return (
		<Card
			style={{
				margin: 6,
				width: 140,
				alignItems: "center",
				padding: 8,
				height: 350,
				borderWidth: checkIfInTimeOfDay(new Date(time), day, timeOfDaySettings, timeOfDay) ? 1 : 0,
				// backgroundColor: checkIfInTimeOfDay(new Date(time), day, timeOfDaySettings, timeOfDay) ? theme.colors.elevation.level2 : theme.colors.elevation.level1 ,
			}}
			// mode={checkIfInTimeOfDay(new Date(time), day, timeOfDaySettings, timeOfDay) ? "elevated" : "contained"}
			// elevation={2}
		>
			<Card.Content>
				<Text variant="titleMedium" style={styles.timeText}>
					{new Date(time).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
						hour12: true,
					})}
				</Text>
				<ClothingSuggestion temperature={feelsLike} textWidth={140} />
				<Image source={{ uri: `https:${conditionIcon}` }} style={styles.icon} resizeMode="contain" />
				<Text variant="bodyMedium" style={{ textAlign: "center" }}>
					Feels like: {overallScale}/5
				</Text>
			</Card.Content>
		</Card>
	);
};

const styles = StyleSheet.create({
	timeText: {
		textAlign: "center",
		marginBottom: 4,
	},
	icon: {
		flex: 0.5,
		aspectRatio: 1,
		alignSelf: "center",
	},
	tempText: {
		marginTop: 4,
	},
	conditionText: {
		textAlign: "center",
	},
	additionalInfo: {
		marginTop: 8,
		alignItems: "flex-start",
	},
});

export default HourlyWeatherCard;
