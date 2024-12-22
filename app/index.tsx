// app/index.tsx
import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Image, StatusBar } from "react-native";
import {
	Text,
	TextInput,
	Button,
	ActivityIndicator,
	Card,
	Divider,
	Appbar,
} from "react-native-paper";
import { Link, router } from "expo-router";
import useWeather from "../hooks/useWeather";
import useSettingsStore from "../store/settingsStore";
import HourlyWeatherCard from "../components/HourlyWeatherCard";
import ClothingSuggestion from "../components/ClothingSuggestion";
import BoxRow from "@/components/boxRow";
import convertToScale from "@/convertToScale";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
	const [location, setLocation] = useState("Boston");
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

	const temperatureText = ["cold", "cool", "mild", "warm", "hot"];
	const windText = ["calm", "breezy", "windy"];
	const humidityText = ["dry", "humid", "very humid"];

	interface InfoRowProps {
		label: string;
		value: number;
		type: string;
		textArray: string[];
		imperialUnit: string;
		metricUnit: string;
		numBoxes: number;
	}

	const InfoRow: React.FC<InfoRowProps> = ({
		label,
		value,
		type,
		textArray,
		imperialUnit,
		metricUnit,
		numBoxes,
	}) => {
		return (
			<View style={styles.infoRow}>
				<Text variant="bodyLarge" style={{ flex: 2.2 }}>
					{label}:
				</Text>
				<View style={[styles.infoColn, { flex: 3.2 }]}>
					<BoxRow
						numBoxes={numBoxes}
						selectedBox={convertToScale(Math.round(value), type, unit)}
					/>
					<Text variant="labelSmall">
						{Math.round(value)}{" "}
						{unit === "imperial" ? imperialUnit : metricUnit}
					</Text>
				</View>

				<Text variant="bodyLarge" style={{ flex: 1.3 }}>
					{textArray[convertToScale(Math.round(value), type, unit)]}
				</Text>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" />
			<Appbar.Header>
				<Appbar.Content title="Minimal Weather" />
				<Appbar.Action icon="cog" onPress={() => router.push("/settings")} />
			</Appbar.Header>
		<ScrollView style={{flex:1}} showsVerticalScrollIndicator={false}>
			<TextInput
				label="Location"
				value={location}
				onChangeText={setLocation}
				mode="outlined"
				style={styles.input}
			/>

			{loading && <ActivityIndicator animating style={{ marginTop: 16 }} />}
			{error && <Text style={styles.errorText}>{error}</Text>}

			{weather && (
				<>
					<Text variant="headlineMedium" style={styles.locationText}>
						{weather.location.name}, {weather.location.region}
					</Text>

					{/* Clothing Suggestion */}
					{feelsLike !== undefined && windSpeed !== undefined && (
						<View style={{ height: 150 }}>
							<ClothingSuggestion
								temperature={feelsLike}
								wind_speed={windSpeed}
							/>
						</View>
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
									textArray={temperatureText}
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
								textArray={temperatureText}
								imperialUnit="°F"
								metricUnit="°C"
								numBoxes={5}
							/>
							<InfoRow
								label="Wind"
								value={windSpeed}
								type="wind"
								textArray={windText}
								imperialUnit="mph"
								metricUnit="kph"
								numBoxes={3}
							/>
							<InfoRow
								label="Humidity"
								value={humidity}
								type="humidity"
								textArray={humidityText}
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
					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingBottom: 16, paddingHorizontal: 8}}>
						{weather.forecast.forecastday[0].hour
							.slice(new Date().getHours())
							.map((hourItem, index) => {
								const time = new Date(hourItem.time).toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit',
									hour12: true,
								});
								return (
									<HourlyWeatherCard
										key={index}
										time={time} // e.g., "01:00 AM"
										overallScale={
											convertToScale(hourItem.feelslike_f, "temp", unit) + 1
										}
										feelsLike={hourItem.feelslike_f}
										windSpeed={
											unit === "imperial" ? hourItem.wind_mph : hourItem.wind_kph
										}
										conditionIcon={hourItem.condition.icon}
									/>
								);
							})}
					</ScrollView>
				</>
			)}
		</ScrollView>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	title: {
		textAlign: "center",
		marginBottom: 16,
	},
	input: {
		marginBottom: 8,
		marginHorizontal: 16,
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
		marginHorizontal: 16,
		padding: 16,
		borderRadius: 8,
		backgroundColor: "transparent",
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
	infoColn: {
		flexDirection: "column",
		marginVertical: 2,
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
