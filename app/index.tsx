// app/index.tsx
import React, { useState } from "react";
import WeatherApiResponse from '../types/weather';
import { getWeatherData, locationAutocomplete } from '../services/weatherApi';
import * as Location from 'expo-location';
import { View, StyleSheet, ScrollView, Image, Alert, RefreshControl } from "react-native";
import {
	Text,
	Button,
	Card,
	Divider,
	Appbar,
	SegmentedButtons,
	useTheme,
	IconButton
} from "react-native-paper";
import { router } from "expo-router";
import useSettingsStore from "../store/settingsStore";
import HourlyWeatherCard from "../components/HourlyWeatherCard";
import ClothingSuggestion from "../components/ClothingSuggestion";
import BoxRow from "@/components/boxRow";
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cutoffs, defaultCutoffs } from "@/types/cutoffs";


const HomeScreen = () => {
	//States
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

	const [cutoffs, setCutoffs] = useState<Cutoffs>(defaultCutoffs)

	//Setup (settings, time of day, location, weather data)
	async function getCutoffs() {
		try {
			const value = await AsyncStorage.getItem('cutoffs');
			if (value !== null) {
				setCutoffs(JSON.parse(value));
			} else {
				await AsyncStorage.setItem('cutoffs', JSON.stringify(defaultCutoffs));
			}
		} catch (e) {
			// error reading value
		}
	}
	
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

	//runs at start
	useState(() => {
		getCutoffs();
		fetchWeather(location);
		getCurrentLocation();

		const intervalId = setInterval(() => {
			fetchWeather(location);
		}, 1800000); // 30 minutes

		return () => clearInterval(intervalId); // Cleanup when unmounting
	})


	function getWeatherTimeOfDay() {
		return weatherData?.forecast.forecastday[day].hour.filter(({ time }) => {
			const h = new Date(time).getHours();
			const curr = new Date().getHours();
			return (day === 0 ? h >= curr : true) &&
				((h >= 0 && h < 7) ? timeOfDay.includes('earlyMorning') :
				(h >= 7 && h < 11) ? timeOfDay.includes('morning') :
					(h >= 11 && h < 15) ? timeOfDay.includes('noon') :
						(h >= 15 && h < 20) ? timeOfDay.includes('evening') :
							(h >= 20 && h < 24) ? timeOfDay.includes('night') : false);
		});
	}

	const filteredWeather = getWeatherTimeOfDay();
	const dailyWeather = filteredWeather?.length == 0 && day != 0
	const weather = filteredWeather?.length > 0 ? filteredWeather : (day == 0 ? [weatherData?.current] : [weatherData?.forecast.forecastday[day].day]);
	const feelsLike = !dailyWeather ? weather?.reduce((acc, curr) => acc + curr?.feelslike_f, 0) / weather?.length : weather[0]?.avgtemp_f;

	const minTemp = weatherData?.forecast.forecastday[day].day.mintemp_f;
	const maxTemp = weatherData?.forecast.forecastday[day].day.maxtemp_f;

	const temp = !dailyWeather ? weather?.reduce((acc, curr) => acc + curr?.temp_f, 0) / weather?.length : weather[0]?.avgtemp_f;
	const wind = !dailyWeather ? weather?.reduce((acc, curr) => acc + curr?.wind_mph, 0) / weather?.length : weather[0]?.maxwind_mph;
	const precipProb = filteredWeather?.length > 0 ? weather?.reduce((acc, curr) => acc + curr?.chance_of_rain, 0) / weather?.length : (day == 0 ? weatherData?.forecast.forecastday[day].hour[new Date().getHours()].chance_of_rain : weather[0]?.daily_chance_of_rain);
	const precip = !dailyWeather ? weather?.reduce((acc, curr) => acc + curr?.precip_in, 0) / weather?.length : weather[0]?.totalprecip_in;
	const humidity = !dailyWeather ? weather?.reduce((acc, curr) => acc + curr?.humidity, 0) / weather?.length : weather[0]?.avghumidity;
	const cloudCover = day == 0 ? weatherData?.current.cloud : 50;
	const windGusts = day == 0 ? weatherData?.current.gust_mph : wind;
	const uv = !dailyWeather ? weather?.reduce((acc, curr) => acc + curr?.uv, 0) / weather?.length : weather[0]?.uv;
	const visibility = !dailyWeather ? weather?.reduce((acc, curr) => acc + curr?.vis_miles, 0) / weather?.length : weather[0]?.avgvis_miles;

	function getWeightedAvg() {
		if (dailyWeather) return feelsLike;
		const weightedSum = weather?.reduce((acc, curr) => acc + curr?.feelslike_f * Math.max(0.3 * (feelsLike - curr?.temp_f), 1), 0);
		const totalWeight = weather?.reduce((acc, curr) => acc + Math.max(0.3 * (feelsLike - curr?.temp_f), 1), 0);
		return weightedSum / totalWeight;
	}


	//Info rows
	const tempCutoffs = cutoffs["Temp"];
	const windCutoffs = cutoffs["Wind"];
	const precipProbCutoffs = cutoffs["Precip Prob"];
	const precipCutoffs = cutoffs["Precip Inches"];
	const humidityCutoffs = cutoffs["Humidity"];
	const uvCutoffs = cutoffs["Uv"];
	const visibilityCutoffs = cutoffs["Visibility"];
	const cloudCoverCutoffs = cutoffs["Cloud Cover"];

	const windLabels = ["calm", "breezy", "windy"];

	function convertToScale(value: number, cutoffs: number[]): number {
		for (let i = 0; i < cutoffs.length; i++) {
			if (value <= cutoffs[i]) return i;
		}
		return cutoffs.length;
	}

	function roundWeatherValue(value: number) {
		if (value > 10) return Math.round(value);
		return value?.toPrecision(2);
	}

	interface InfoRowProps {
		label: string;
		value: number;
		cutoffs: number[];
		textArray: string[];
		imperialUnit: string;
		metricUnit: string;
		hasZeroValue?: boolean;
		zeroText?: string;
	}

	const InfoRow: React.FC<InfoRowProps> = ({
		label,
		value,
		cutoffs,
		textArray,
		imperialUnit,
		metricUnit,
		hasZeroValue,
		zeroText
	}) => {
		return (
			<View style={styles.infoRow}>
				<Text variant="bodyLarge" style={{ flex: 2 }}>
					{label}:
				</Text>
				<Text variant="bodyLarge" style={{ flex: 1.5 }}>
					{value == 0 && hasZeroValue ? zeroText : textArray[convertToScale(value, cutoffs)]}
				</Text>
				<View style={[styles.infoColn, { flex: 2.8 }]}>
					<BoxRow
						numBoxes={cutoffs.length}
						selectedBox={value == 0 && hasZeroValue ? -1 : convertToScale(value, cutoffs)}
					/>
					<Text variant="labelSmall">
						{roundWeatherValue(value)}{" "}
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
			<Appbar.Header>
				<Appbar.Content title="Minimal Weather" />
				<Appbar.Action icon="cog" onPress={() => router.push("/settings")} />
			</Appbar.Header>
			<ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false} refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={() => fetchWeather(location)} />
			} >
				{/* Location picker */}
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
						<Text variant="headlineMedium" style={styles.locationText}>
							{day == 0 ? "Today" : day == 1 ? "Tomorrow" : "Day After Tomorrow"}
						</Text>

						{/* Time of Day Selector */}
						<SegmentedButtons
							style={{ marginTop: 16, marginBottom: 32 }}
							value={timeOfDay}
							onValueChange={(value) => setTimeOfDay(value)}
							buttons={[
								{ value: 'earlyMorning', label: 'Early', disabled: day == 0 && new Date().getHours() >= 7, }, // 12 am - 7 am
								{ value: 'morning', label: 'Morning', disabled: day == 0 && new Date().getHours() >= 11 }, // 7 am - 11 am
								{ value: 'noon', label: 'Noon', disabled: day == 0 && new Date().getHours() >= 15 }, // 11 am - 3 pm
								{ value: 'evening', label: 'Evening', disabled: day == 0 && new Date().getHours() >= 20 }, // 3 pm - 8 pm
								{ value: 'night', label: 'Night' }, // 8 pm - 12 am
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
									temperature={getWeightedAvg()}
								/>
							</View>
						)}

						{/* Weather Details */}
						<Card style={styles.weatherCard}>
							<Card.Content>

								<InfoRow
									label="Overall"
									value={feelsLike}
									cutoffs={tempCutoffs}
									textArray={["freezing", "cold", "mild", "warm", "hot"]}
									imperialUnit="°F"
									metricUnit="°C"
								/>

								<View style={styles.conditionRow}>
									<Image
										source={{ uri: `https:${weatherData?.current.condition.icon}` }}
										style={styles.weatherIcon}
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
									cutoffs={precipProbCutoffs}
									textArray={["unlikely", "possible", "likely"]}
									imperialUnit="%"
									metricUnit="%"
									hasZeroValue={!weatherData?.forecast.forecastday[day].day.daily_will_it_rain && !weatherData?.forecast.forecastday[day].day.daily_will_it_snow}
									zeroText="none" />
								{precipProb > 0 ?
									<InfoRow
										label={temp < 32 ? "Snow" : "Rain"}
										value={precip}
										cutoffs={precipCutoffs}
										textArray={["drizzle", "shower", "downpour"]}
										imperialUnit="in"
										metricUnit="cm"
									/> : null}
								{temp > 60 || expanded ? <InfoRow
									label="Humidity"
									value={humidity}
									cutoffs={humidityCutoffs}
									textArray={["dry", "comfort", "sticky"]}
									imperialUnit="%"
									metricUnit="%"
								/> : null}
								{expanded ?
									<>
										<InfoRow
											label="UV Index"
											value={uv}
											cutoffs={uvCutoffs}
											textArray={["safe", "caution", "danger"]}
											imperialUnit=""
											metricUnit="" />
										<InfoRow
											label="Visibility"
											value={visibility}
											cutoffs={visibilityCutoffs}
											textArray={["foggy", "misty", "clear"]}
											imperialUnit="mi"
											metricUnit="km"
										/>
										{day == 0 ?
											<InfoRow
												label="Cloud Cover"
												value={cloudCover}
												cutoffs={cloudCoverCutoffs}
												textArray={["clear", "cloudy", "overcast"]}
												imperialUnit="%"
												metricUnit="%" />
											: null}
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
										/>
									</> : null}
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
											time={time}
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
	weatherCard: {
		marginTop: 16,
		padding: 16,
		borderRadius: 8,
	},
	conditionRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center"
	},
	weatherIcon: {
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