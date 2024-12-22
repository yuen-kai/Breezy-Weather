// app/index.tsx
import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import {
	Text,
	TextInput,
	Button,
	ActivityIndicator,
	Card,
	Divider,
} from "react-native-paper";
import { Link } from "expo-router";
import useWeather from "../hooks/useWeather";
import useSettingsStore from "../store/settingsStore";
import HourlyWeatherCard from "../components/HourlyWeatherCard";
import ClothingSuggestion from "../components/ClothingSuggestion";
import BoxRow from "@/components/boxRow";
import convertToScale from "@/convertToScale";

const HomeScreen = () => {
	const [location, setLocation] = useState("New York");
	const { weather, loading, error } = useWeather(location);
	const { unit } = useSettingsStore();

	const currentTemp =
		weather && unit === "imperial"
			? weather.current.temp_f
			: weather?.current.temp_c;

	const windSpeed =
		unit === "imperial" ? weather?.current.wind_mph : weather?.current.wind_kph;
	const humidity = weather?.current.humidity;
	const uvIndex = weather?.current.uv;
	const feelsLike =
		unit === "imperial"
			? weather?.current.feelslike_f
			: weather?.current.feelslike_c;

	interface InfoRowProps {
		label: string;
		value: number;
		type: string;
		imperialUnit: string;
		metricUnit: string;
		numBoxes: number;
	}

	const InfoRow: React.FC<InfoRowProps> = ({
		label,
		value,
		type,
		imperialUnit,
		metricUnit,
		numBoxes,
	}) => {
		return (
			<View style={styles.infoRow}>
				<Text variant="bodyLarge" style={{ flex: 2.2 }}>
					{label}:
				</Text>
				<BoxRow
					containerStyle={{ flex: 3.2 }}
					numBoxes={numBoxes}
					selectedBox={convertToScale(Math.round(value), type, unit)}
				/>
				<Text variant="bodyLarge" style={{ flex: 1.3 }}>
					{Math.round(value)} {unit === "imperial" ? imperialUnit : metricUnit}
				</Text>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<Text variant="titleLarge" style={styles.title}>
				Minimal Weather
			</Text>

			<TextInput
				label="Location"
				value={location}
				onChangeText={setLocation}
				mode="outlined"
				style={styles.input}
			/>
			{/* <Button
        mode="contained"
        onPress={() => {
          // Re-fetch weather by updating state
          // Since useWeather uses location as a dependency, updating location will trigger fetch
        }}
        style={styles.button}
      >
        Get Weather
      </Button> */}

			{loading && <ActivityIndicator animating style={{ marginTop: 16 }} />}
			{error && <Text style={styles.errorText}>{error}</Text>}

			{weather && (
				<>
					<Text variant="headlineMedium" style={styles.locationText}>
						{weather.location.name}, {weather.location.region}
					</Text>

					{/* Clothing Suggestion */}
					{currentTemp !== undefined && (
						<ClothingSuggestion temperature={currentTemp} />
					)}

					{/* Current Weather Details */}
					<Card style={styles.currentWeatherCard}>
						<Card.Content>
							<View style={styles.currentWeatherRow}>
								{/* <Image
									source={{ uri: `https:${weather.current.condition.icon}` }}
									style={styles.currentWeatherIcon}
									resizeMode="contain"
								/> */}
								<InfoRow
									label="Overall"
									value={feelsLike}
									type="temp"
									imperialUnit="°F"
									metricUnit="°C"
									numBoxes={5}
								/>
								{/* <Text variant="displayMedium" style={styles.currentTemp}>
									{Math.round(feelsLike)}° {unit === "imperial" ? "F" : "C"}
								</Text> */}
							</View>
							<Text variant="titleMedium" style={styles.conditionText}>
								{weather.current.condition.text}
							</Text>

							<Divider style={styles.divider} />
							<InfoRow
								label="Temperature"
								value={currentTemp}
								type="temp"
								imperialUnit="°F"
								metricUnit="°C"
								numBoxes={5}
							/>
							<InfoRow
								label="Wind"
								value={windSpeed}
								type="wind"
								imperialUnit="mph"
								metricUnit="kph"
								numBoxes={3}
							/>
							<InfoRow
								label="Humidity"
								value={humidity}
								type="humidity"
								imperialUnit="%"
								metricUnit="%"
								numBoxes={3}
							/>
						</Card.Content>
					</Card>

					{/* Hourly Forecast */}
					<Text variant="titleMedium" style={styles.sectionTitle}>
						Hourly Forecast
					</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						{weather.forecast.forecastday[0].hour.map((hourItem, index) => (
							<HourlyWeatherCard
								key={index}
								time={hourItem.time.split(" ")[1]} // e.g., "01:00"
								temp_c={hourItem.temp_c}
								temp_f={hourItem.temp_f}
								conditionIcon={hourItem.condition.icon}
								conditionText={hourItem.condition.text}
								wind_speed={
									unit === "imperial" ? hourItem.wind_mph : hourItem.wind_kph
								}
								humidity={hourItem.humidity}
								uv={hourItem.uv}
							/>
						))}
					</ScrollView>
				</>
			)}

			<Link href="/settings">
				<Text style={styles.link}>Go to Settings</Text>
			</Link>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 16,
		flex: 1,
	},
	title: {
		textAlign: "center",
		marginBottom: 16,
	},
	input: {
		marginBottom: 8,
	},
	button: {
		marginBottom: 16,
	},
	locationText: {
		marginTop: 16,
		textAlign: "center",
	},
	link: {
		marginTop: 24,
		textAlign: "center",
		color: "blue",
	},
	errorText: {
		color: "red",
		textAlign: "center",
		marginTop: 16,
	},
	currentWeatherCard: {
		marginTop: 16,
		padding: 16,
		borderRadius: 8,
		backgroundColor: "transparent", // Use Paper's theming
	},
	currentWeatherRow: {
		flexDirection: "row",
		alignItems: "center",
		// paddingRight: 30,
	},
	currentWeatherIcon: {
		width: 60,
		height: 60,
	},
	currentTemp: {
		marginLeft: 16,
	},
	conditionText: {
		textAlign: "center",
		marginTop: 8,
	},
	divider: {
		marginVertical: 8,
	},
	infoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginVertical: 2,
	},
	sectionTitle: {
		marginTop: 24,
		marginBottom: 8,
		textAlign: "center",
	},
});

export default HomeScreen;
