// app/index.tsx
import React, { useState, useEffect } from "react";
import * as Location from 'expo-location';
import { View, StyleSheet, ScrollView, Image, StatusBar, Alert } from "react-native";
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
	const [expanded, setExpanded] = useState<boolean>(false);
	const [day, setDay] = useState<number>(0);

	const { weatherData, loading, error } = useWeather(location);

	const { unit } = useSettingsStore();

	const weather = (day == 0 ? weatherData?.current : weatherData?.forecast.forecastday[day].day)
	const currentTemp = (day == 0 ? weather?.temp_f : weather?.avgtemp_f);

	const windSpeed = day == 0 ? weather?.wind_mph : weather?.maxwind_mph;
	const humidity = day == 0 ? weather?.humidity : weather?.avghumidity;
	// const uvIndex = day == 0 ? weather?.uv : weather?.day.uv;

	const feelsLike = day == 0
		? weather?.feelslike_f
		: weather?.avgtemp_f - (weather?.maxwind_mph / 5);

	const temperatureText = ["freezing", "cold", "mild", "warm", "hot"];
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

	// async function getCurrentLocation() {

	// 	let { status } = await Location.requestForegroundPermissionsAsync();
	// 	if (status !== 'granted') {
	// 		Alert.alert('Permission to access location was denied');
	// 		return;
	// 	}

	// 	let location = (await Location.getCurrentPositionAsync({})).coords;
	// 	setLocation(location);
	// }

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
			<ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
				<TextInput
					label="Location"
					value={location}
					onChangeText={setLocation}
					mode="outlined"
					style={styles.input}
				/>

				{loading && <ActivityIndicator animating style={{ marginTop: 16 }} />}
				{error && <Text style={styles.errorText}>{error}</Text>}
				<Text variant="headlineMedium" style={styles.locationText}>
					{day==0?"Today":day==1?"Tomorrow":"Day After Tomorrow"}
				</Text>
				{weatherData && weather && (
					<>
						<Text variant="headlineMedium" style={styles.locationText}>
							{weatherData.location.name}, {weatherData.location.region}
						</Text>

						{/* Clothing Suggestion */}
						{feelsLike !== undefined && (
							<View style={{ height: 150 }}>
								<ClothingSuggestion
									temperature={feelsLike}
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
								{/* <Text variant="titleMedium" style={styles.conditionText}>
									{weather?.condition.text}
								</Text> */}

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
								{expanded ? <>
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
									/></> : null}
								<Button mode="text" onPress={() => setExpanded(!expanded)}>
									{expanded ? "Collapse" : "Expand"}
								</Button>
							</Card.Content>
						</Card>

						{/* Hourly Forecast */}
						<Text variant="titleMedium" style={styles.sectionTitle}>
							Hourly Forecast
						</Text>
						<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 8 }}>
							{(day == 0 ? weatherData.forecast.forecastday[day].hour
								.slice(new Date().getHours()) : weatherData.forecast.forecastday[day].hour)
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
												convertToScale(hourItem.feelslike_f, "temp") + 1
											}
											feelsLike={hourItem.feelslike_f}
											windSpeed={hourItem.wind_mph}
											conditionIcon={hourItem.condition.icon}
										/>
									);
								})}
						</ScrollView>
					</>
				)}
			</ScrollView>
			<View style={{ flexDirection: "row", justifyContent: "space-around" }}>
				<Button mode="text" onPress={() => setDay(day - 1)} disabled={day === 0} style={{flex:1}}>
					Previous
				</Button>
				<Button mode="text" onPress={() => setDay(day + 1)} disabled={day === 2} style={{flex:1}}>
					Next
				</Button>
			</View>
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
