// app/index.tsx
import React, { useState, useEffect } from "react";
import WeatherApiResponse from '../types/weather';
import getWeatherData from '../services/weatherApi';
import * as Location from 'expo-location';
import { View, StyleSheet, ScrollView, Image, StatusBar, Alert, RefreshControl } from "react-native";
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
import useSettingsStore from "../store/settingsStore";
import HourlyWeatherCard from "../components/HourlyWeatherCard";
import ClothingSuggestion from "../components/ClothingSuggestion";
import BoxRow from "@/components/boxRow";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
	const [location, setLocation] = useState("Boston");
	const [expanded, setExpanded] = useState<boolean>(false);
	const [day, setDay] = useState<number>(0);
	const [refreshing, setRefreshing] = useState(false);

	const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const fetchWeather = async (location: string) => {
		setLoading(true);
		setError(null);
		try {
			const data = await getWeatherData(location);
			setWeatherData(data);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	useState(() => {
		fetchWeather(location);

		const intervalId = setInterval(() => {
			fetchWeather(location);
		}, 1800000); // 30 minutes

		return () => clearInterval(intervalId); // Cleanup when unmounting
	})

	const { unit } = useSettingsStore();

	const weather = (day == 0 ? weatherData?.current : weatherData?.forecast.forecastday[day].day)
	const feelsLike = day == 0
		? weather?.feelslike_f
		: weather?.avgtemp_f - (weather?.maxwind_mph / 5);

	const temp = day == 0 ? weather?.temp_f : weather?.avgtemp_f;
	const wind = day == 0 ? weather?.wind_mph : weather?.maxwind_mph;
	const precipProb = day == 0 ? weatherData.forecast.forecastday[day].hour[new Date().getHours()]?.chance_of_rain : weather?.daily_chance_of_rain;
	const precip = day == 0 ? weather?.precip_in : weather?.totalprecip_in;
	const humidity = day == 0 ? weather?.humidity : weather?.avghumidity;
	const minTemp = weatherData?.forecast.forecastday[day].day.mintemp_f;
	const maxTemp = weatherData?.forecast.forecastday[day].day.maxtemp_f;
	const cloudCover = day == 0 ? weather?.cloud : null;
	const windGusts = day == 0 ? weather?.gust_mph : null;
	const uv = day == 0 ? weather?.uv : weather?.uv;

	const visibility = day == 0 ? weather?.vis_miles : weather?.avgvis_miles;

	const tempCutoffs = [30, 50, 70, 90, 999];

	function convertToScale(value: number, cutoffs: number[]): number {
		for (let i = 0; i < cutoffs.length; i++) {
			if (value <= cutoffs[i]) return i;
		}
		return cutoffs.length;
	}

	// const uvIndex = day == 0 ? weather?.uv : weather?.day.uv;

	// async function getCurrentLocation() {

	// 	let { status } = await Location.requestForegroundPermissionsAsync();
	// 	if (status !== 'granted') {
	// 		Alert.alert('Permission to access location was denied');
	// 		return;
	// 	}

	// 	let location = (await Location.getCurrentPositionAsync({})).coords;
	// 	setLocation(location);
	// }

	interface InfoRowProps {
		label: string;
		value: number;
		cutoffs: number[];
		textArray: string[];
		imperialUnit: string;
		metricUnit: string;
	}

	const InfoRow: React.FC<InfoRowProps> = ({
		label,
		value,
		cutoffs,
		textArray,
		imperialUnit,
		metricUnit,
	}) => {
		return (
			<View style={styles.infoRow}>
				<Text variant="bodyLarge" style={{ flex: 2.2 }}>
					{label}:
				</Text>
				<View style={[styles.infoColn, { flex: 3.2 }]}>
					<BoxRow
						numBoxes={cutoffs.length}
						selectedBox={convertToScale(Math.round(value), cutoffs)}
					/>
					<Text variant="labelSmall">
						{Math.round(value)}{" "}
						{unit === "imperial" ? imperialUnit : metricUnit}
					</Text>
				</View>

				<Text variant="bodyLarge" style={{ flex: 1.3 }}>
					{textArray[convertToScale(Math.round(value), cutoffs)]}
				</Text>
			</View>
		);
	};

	interface TextRowProps {
		label: string;
		value: string;
	}

	const TextRow: React.FC<TextRowProps> = ({
		label,
		value
	}) => {
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

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" />
			<Appbar.Header>
				<Appbar.Content title="Minimal Weather" />
				<Appbar.Action icon="cog" onPress={() => router.push("/settings")} />
			</Appbar.Header>
			<ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={() => fetchWeather(location)} />
			} >
				<TextInput
					label="Location"
					value={location}
					onChangeText={(value) => { setLocation(value); fetchWeather(value) }}
					mode="outlined"
					style={styles.input}
				/>

				{/* {loading && <ActivityIndicator animating style={{ marginTop: 16 }} />} */}
				{error && <Text style={styles.errorText}>{error}</Text>}
				<Text variant="headlineMedium" style={styles.locationText}>
					{day == 0 ? "Today" : day == 1 ? "Tomorrow" : "Day After Tomorrow"}
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

								<InfoRow
									label="Overall"
									value={feelsLike}
									cutoffs={tempCutoffs}
									textArray={["freezing", "cold", "mild", "warm", "hot"]}
									imperialUnit="°F"
									metricUnit="°C"
								/>

								<View style={styles.currentWeatherRow}>
									<Image
										source={{ uri: `https:${weather.condition.icon}` }}
										style={styles.currentWeatherIcon}
										resizeMode="contain"
									/>
									<Text variant="titleMedium" style={styles.conditionText}>
										{weather?.condition.text}
									</Text>
								</View>

								<Divider style={styles.divider} />
								<InfoRow
									label="Temperature"
									value={temp}
									cutoffs={tempCutoffs}
									textArray={["freezing", "cold", "mild", "warm", "hot"]}
									imperialUnit="°F"
									metricUnit="°C"
								/>
								<InfoRow
									label="Wind"
									value={wind}
									cutoffs={[10, 20, 999]}
									textArray={["calm", "breezy", "windy"]}
									imperialUnit="mph"
									metricUnit="kph"
								/>
								<InfoRow
									label="Precipitation"
									value={precipProb}
									cutoffs={[20, 50, 999]}
									textArray={["unlikely", "possibly", "likely"]}
									imperialUnit="%"
									metricUnit="%" />
								{weatherData.forecast.forecastday[day].day.daily_will_it_rain || weatherData.forecast.forecastday[day].day.daily_will_it_snow ?
									<InfoRow
										label={temp < 32 ? "Snow" : "Rain"}
										value={precip}
										cutoffs={[0.1, 0.3, 999]}
										textArray={["drizzle", "shower", "downpour"]}
										imperialUnit="in"
										metricUnit="cm"
									/> : null}
								{temp > 60 || expanded ? <InfoRow
									label="Humidity"
									value={humidity}
									cutoffs={[50, 70, 999]}
									textArray={["dry", "comfortable", "sticky"]}
									imperialUnit="%"
									metricUnit="%"
								/> : null}
								{expanded ? <>
									{day == 0 ? <><InfoRow
										label="Cloud Cover"
										value={cloudCover}
										cutoffs={[20, 50, 999]}
										textArray={["clear", "cloudy", "overcast"]}
										imperialUnit="%"
										metricUnit="%" />
										<InfoRow
											label="Wind Gusts"
											value={windGusts}
											cutoffs={[20, 40, 999]}
											textArray={["stable", "breezy", "gusty"]}
											imperialUnit="mph"
											metricUnit="kph" />
									</> : null}
									<InfoRow
										label="UV Index"
										value={uv}
										cutoffs={[2, 5, 8, 11, 999]}
										textArray={["low", "moderate", "high", "very high", "extreme"]}
										imperialUnit=""
										metricUnit="" />
									<InfoRow
										label="Visibility"
										value={visibility}
										cutoffs={[1, 3, 999]}
										textArray={["foggy", "misty", "clear"]}
										imperialUnit="mi"
										metricUnit="km"
									/>
									<TextRow
										label="Sunrise"
										value={weatherData.forecast.forecastday[day].astro.sunrise}
									/>
									<TextRow
										label="Sunset"
										value={weatherData.forecast.forecastday[day].astro.sunset}
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
												convertToScale(hourItem.feelslike_f, tempCutoffs) + 1
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
				<Button mode="text" onPress={() => setDay(day - 1)} disabled={day === 0} style={{ flex: 1 }}>
					Previous
				</Button>
				<Button mode="text" onPress={() => setDay(day + 1)} disabled={day === 2} style={{ flex: 1 }}>
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
		justifyContent: "center"
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
