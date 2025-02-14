// app/index.tsx
import React, { useState, useEffect } from "react";
import WeatherApiResponse from '../types/weather';
import { getWeatherData, locationAutocomplete } from '../services/weatherApi';
import * as Location from 'expo-location';
import { View, StyleSheet, ScrollView, Image, Alert, RefreshControl } from "react-native";
import {
	Text,
	TextInput,
	Button,
	ActivityIndicator,
	Card,
	Divider,
	Appbar,
	SegmentedButtons,
	useTheme,
	IconButton
} from "react-native-paper";
import { Link, router } from "expo-router";
import useSettingsStore from "../store/settingsStore";
import HourlyWeatherCard from "../components/HourlyWeatherCard";
import ClothingSuggestion from "../components/ClothingSuggestion";
import BoxRow from "@/components/boxRow";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Updates from 'expo-updates';
import { StatusBar } from "expo-status-bar";
import DropDownPicker from 'react-native-dropdown-picker';
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";



const HomeScreen = () => {
	// useEffect(() => {
	// 	async function checkForUpdate() {
	// 		try {
	// 			const update = await Updates.checkForUpdateAsync();
	// 			if (update.isAvailable) {
	// 				await Updates.fetchUpdateAsync();
	// 				Updates.reloadAsync();  // Reloads the app with the latest update
	// 			}
	// 		} catch (e) {
	// 			console.error('Error checking for update:', e);
	// 		}
	// 	}

	// 	checkForUpdate();
	// }, []);


	const theme = useTheme()
	const { unit } = useSettingsStore();

	const [location, setLocation] = useState("Boston, Massachusetts");
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [items, setItems] = useState([{ label: "Boston, Massachusetts", value: "Boston, Massachusetts" }, { label: "New York, New York", value: "New York, New York" }, { label: "Los Angeles, California", value: "Los Angeles, California" }]);
	const [dropDownLoading, setDropdownLoading] = useState(false);

	const [refreshing, setRefreshing] = useState(false);
	const [timeOfDay, setTimeOfDay] = useState<string[]>(getTimeOfDay);
	const [expanded, setExpanded] = useState<boolean>(false);
	const [day, setDay] = useState<number>(0);

	const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);


	function getTimeOfDay() {
		const h = new Date().getHours();
		if (h >= 20 && h < 24) return ["night"];
		let tempTimeOfDay = [];
		if (h < 7) tempTimeOfDay.push("earlyMorning");
		if (h < 11) tempTimeOfDay.push("morning");
		if (h < 15) tempTimeOfDay.push("noon");
		if (h < 20) tempTimeOfDay.push("evening");
		return tempTimeOfDay;
	}

	const fetchWeather = async (location: string) => {
		if (loading) return;
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
		getCurrentLocation();

		const intervalId = setInterval(() => {
			fetchWeather(location);
		}, 1800000); // 30 minutes

		return () => clearInterval(intervalId); // Cleanup when unmounting
	})


	// const weather = (day == 0 ? weatherData?.current : weatherData?.forecast.forecastday[day].day)
	// const feelsLike = day == 0
	// 	? weather?.feelslike_f
	// 	: weather?.avgtemp_f - (weather?.maxwind_mph / 5);

	// const minTemp = weatherData?.forecast.forecastday[day].day.mintemp_f;
	// const maxTemp = weatherData?.forecast.forecastday[day].day.maxtemp_f;

	// const temp = day == 0 ? weather?.temp_f : weather?.avgtemp_f;
	// const wind = day == 0 ? weather?.wind_mph : weather?.maxwind_mph;
	// const precipProb = day == 0 ? weatherData?.forecast.forecastday[day].hour[new Date().getHours()]?.chance_of_rain : weather?.daily_chance_of_rain;
	// const precip = day == 0 ? weather?.precip_in : weather?.totalprecip_in;
	// const humidity = day == 0 ? weather?.humidity : weather?.avghumidity;
	// const cloudCover = day == 0 ? weather?.cloud : null;
	// const windGusts = day == 0 ? weather?.gust_mph : null;
	// const uv = day == 0 ? weather?.uv : weather?.uv;
	// const visibility = day == 0 ? weather?.vis_miles : weather?.avgvis_miles;

	const tempCutoffs = [15, 30, 45, 60, 999];
	const windCutoffs = [8, 16, 999];
	const windLabels = ["calm", "breezy", "windy"];

	function getWeatherTimeOfDay() {
		return weatherData?.forecast.forecastday[day].hour.filter(({ time }) => {
			const h = new Date(time).getHours();
			const curr = new Date().getHours();
			return (day === 0 ? h >= curr : true) &&
				(h >= 12 && h < 7) ? timeOfDay.includes('earlyMorning') :
				(h >= 7 && h < 11) ? timeOfDay.includes('morning') :
					(h >= 11 && h < 15) ? timeOfDay.includes('noon') :
						(h >= 15 && h < 20) ? timeOfDay.includes('evening') :
							(h >= 20 && h < 24) ? timeOfDay.includes('night') : false;
		});
	}

	const weather = getWeatherTimeOfDay()?.length > 0 ? getWeatherTimeOfDay() : (day == 0? [weatherData?.current]: [weatherData?.forecast.forecastday[day].day]);
	const feelsLike = weather?.reduce((acc, curr) => acc + curr?.feelslike_f, 0) / weather?.length || weather[0]?.avgtemp_f;

	const minTemp = weatherData?.forecast.forecastday[day].day.mintemp_f;
	const maxTemp = weatherData?.forecast.forecastday[day].day.maxtemp_f;

	const temp = weather?.reduce((acc, curr) => acc + curr?.temp_f, 0) / weather?.length || weather[0]?.avgtemp_f;
	const wind = weather?.reduce((acc, curr) => acc + curr?.wind_mph, 0) / weather?.length || weather[0]?.maxwind_mph;
	const precipProb = weather?.reduce((acc, curr) => acc + curr?.chance_of_rain, 0) / weather?.length || weather[0]?.daily_chance_of_rain || 0;
	const precip = weather?.reduce((acc, curr) => acc + curr?.precip_in, 0) / weather?.length || weather[0]?.totalprecip_in || 0;
	const humidity = weather?.reduce((acc, curr) => acc + curr?.humidity, 0) / weather?.length || weather[0]?.avghumidity;
	const cloudCover = day == 0 ? weatherData?.current.cloud : 50;
	const windGusts = day == 0 ? weatherData?.current.gust_mph : wind;
	const uv = weather?.reduce((acc, curr) => acc + curr?.uv, 0) / weather?.length || weather[0]?.uv;
	const visibility = weather?.reduce((acc, curr) => acc + curr?.vis_miles, 0) / weather?.length || weather[0]?.avgvis_miles;

	function convertToScale(value: number, cutoffs: number[]): number {
		for (let i = 0; i < cutoffs.length; i++) {
			if (value <= cutoffs[i]) return i;
		}
		return cutoffs.length;
	}

	// const uvIndex = day == 0 ? weather?.uv : weather?.day.uv;

	async function getCurrentLocation() {
		let { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('Permission to access location was denied');
			return;
		}

		let location = (await Location.getCurrentPositionAsync()).coords;
		let locations = await locationAutocomplete(location.latitude + "," + location.longitude);
		setLocation(locations[0].name + ", " + locations[0].region);
		fetchWeather(location.latitude + "," + location.longitude)
	}

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
				<Text variant="bodyLarge" style={{ flex: 2 }}>
					{label}:
				</Text>
				<Text variant="bodyLarge" style={{ flex: 1.5 }}>
					{textArray[convertToScale(value, cutoffs)]}
				</Text>
				<View style={[styles.infoColn, { flex: 2.8 }]}>
					<BoxRow
						numBoxes={cutoffs.length}
						selectedBox={convertToScale(value, cutoffs)}
					/>
					<Text variant="labelSmall">
						{value?.toPrecision(2)}{" "}
						{unit === "imperial" ? imperialUnit : metricUnit}
					</Text>
				</View>
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
		<View style={[styles.container, { backgroundColor: theme.colors.background }]}>
			{/* <StatusBar style={theme.dark?"light":"dark"} /> */}
			<Appbar.Header>
				<Appbar.Content title="Minimal Weather" />
				<Appbar.Action icon="cog" onPress={() => router.push("/settings")} />
			</Appbar.Header>
			<ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false} refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={() => fetchWeather(location)} />
			} >
				<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
					<DropDownPicker
						listMode="SCROLLVIEW"
						open={dropdownOpen}
						setOpen={setDropdownOpen}
						value={location}
						searchable
						items={items.some(item => item.value === location)
							? items
							: [{ label: location, value: location }, ...items]}
						setItems={setItems}
						setValue={setLocation}
						onSelectItem={(item) => fetchWeather(item.value)}
						loading={dropDownLoading}
						disableLocalSearch={true} // required for remote search
						onChangeSearchText={(text) => {
							// Show the loading animation
							setDropdownLoading(true);

							// Get items from API
							locationAutocomplete(text)
								.then((items) => {

									// {weatherData.location.name}, {weatherData.location.region}
									let newItems = items.map((item) => {
										let locationString = item.name + ", " + item.region;
										return { label: locationString, value: locationString }
									})
									setItems(newItems);
								})
								.catch((err) => {
									console.error(err);
								})
								.finally(() => {
									// Hide the loading animation
									setDropdownLoading(false);
								});
						}}
						containerStyle={{ flex: 1 }}
						style={{
							backgroundColor: theme.colors.elevation.level1, // Paper background color
							borderColor: theme.colors.outline, // Primary color for border
						}}
						textStyle={{
							color: theme.colors.onSurface, // Adapts to dark mode
						}}
						dropDownContainerStyle={{
							backgroundColor: theme.colors.elevation.level1, // Dropdown background
							borderColor: theme.colors.outline,
						}}
						placeholderStyle={{
							color: theme.colors.onSurfaceDisabled, // Muted text color
						}}
						arrowIconStyle={{
							tintColor: theme.colors.onSurface, // Arrow color
						}}
						listItemLabelStyle={{
							color: theme.colors.onSurface,
							fontSize: 16,
						}}
						listItemLabelStyleActive={{
							color: theme.colors.onSurface,
							fontWeight: "bold",
						}}
						tickIconStyle={{
							tintColor: theme.colors.onSurface,
						}}
						// Search bar container
						searchContainerStyle={{
							borderBottomColor: theme.colors.outline,
							borderBottomWidth: 1,
						}}

						// Search input text
						searchTextInputStyle={{
							color: theme.colors.onSurface,
							borderRadius: theme.roundness,
							borderColor: theme.colors.outline,
							fontSize: 16,
						}}
						searchPlaceholder="Search location"
					/>
					<IconButton icon="crosshairs-gps" onPress={getCurrentLocation} />
				</View>
				{error && <Text style={styles.errorText}>{error}</Text>}

				{weatherData && weather && (
					<>
					{/* <Text>{weather[0].}</Text> */}
						<Text variant="headlineMedium" style={styles.locationText}>
							{day == 0 ? "Today" : day == 1 ? "Tomorrow" : "Day After Tomorrow"}
						</Text>
						<SegmentedButtons
							style={{ marginTop: 16, marginBottom: 32 }}
							value={timeOfDay}
							onValueChange={(value) => setTimeOfDay(value)}
							buttons={[
								{ value: 'earlyMorning', label: 'Early', disabled: day == 0 && new Date().getHours() >= 7 },
								{ value: 'morning', label: 'Morning', disabled: day == 0 && new Date().getHours() >= 11 },
								{ value: 'noon', label: 'Noon', disabled: day == 0 && new Date().getHours() >= 15 },
								{ value: 'evening', label: 'Evening', disabled: day == 0 && new Date().getHours() >= 20 },
								{ value: 'night', label: 'Night' },
							]}
							multiSelect
							theme={{
								fonts: {
									labelLarge: { fontSize: 12 }, // Adjust text size
								}
							}}

						/>
						{/* Clothing Suggestion */}
						{feelsLike !== undefined && (
							<View style={{ height: 190 }}>
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
										source={{ uri: `https:${weatherData?.current.condition.icon}` }}
										style={styles.currentWeatherIcon}
										resizeMode="contain"
									/>
									<Text variant="titleMedium" style={styles.conditionText}>
										{weatherData?.current.condition.text}
									</Text>
								</View>

								<Divider style={styles.divider} />
								<InfoRow
									label="Temp"
									value={temp}
									cutoffs={tempCutoffs}
									textArray={["freezing", "cold", "mild", "warm", "hot"]}
									imperialUnit="°F"
									metricUnit="°C"
								/>
								<InfoRow
									label="Wind"
									value={wind}
									cutoffs={windCutoffs}
									textArray={windLabels}
									imperialUnit="mph"
									metricUnit="kph"
								/>
								{day == 0 && windGusts > wind + 10 ?
									<InfoRow
										label="Wind Gusts"
										value={windGusts}
										cutoffs={windCutoffs}
										textArray={windLabels}
										imperialUnit="mph"
										metricUnit="kph" /> : null}
								<InfoRow
									label="Precip"
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
									textArray={["dry", "comfort", "sticky"]}
									imperialUnit="%"
									metricUnit="%"
								/> : null}
								{expanded ? <>

									<InfoRow
										label="UV Index"
										value={uv}
										cutoffs={[2, 5, 999]}
										textArray={["safe", "caution", "danger"]}
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
									{day == 0 ?
										<InfoRow
											label="Cloud Cover"
											value={cloudCover}
											cutoffs={[20, 50, 999]}
											textArray={["clear", "cloudy", "overcast"]}
											imperialUnit="%"
											metricUnit="%" /> : null}
									{day == 0 && windGusts <= wind + 10 ?
										<InfoRow
											label="Wind Gusts"
											value={windGusts ? windGusts : wind}
											cutoffs={windCutoffs}
											textArray={windLabels}
											imperialUnit="mph"
											metricUnit="kph" />
										: null}
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
		</View>
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
		// backgroundColor: "transparent",
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