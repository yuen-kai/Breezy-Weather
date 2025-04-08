// app/index.tsx
import React, { useState, useEffect } from "react";
import WeatherApiResponse from '../types/weather';
import { getWeatherData, locationAutocomplete } from '../services/weatherApi';
import * as Location from 'expo-location';
import { View, StyleSheet, ScrollView, Image, Alert, RefreshControl, AppState } from "react-native";
import {
	Text,
	Button,
	Card,
	Divider,
	Appbar,
	SegmentedButtons,
	IconButton,
	Tooltip
} from "react-native-paper";
import { useAppTheme } from "../theme";
import { router, useNavigation } from "expo-router";
import useSettingsStore from "../store/settingsStore";
import HourlyWeatherCard from "../components/HourlyWeatherCard";
import ClothingSuggestion from "../components/ClothingSuggestion";
import BoxRow from "@/components/boxRow";
import DropDownPicker from 'react-native-dropdown-picker';
import { TimeOfDay } from "@/types/timeOfDay";
import { InfoRow, convertToScale } from "@/components/infoRow";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
	useSharedValue,
	withTiming,
	useAnimatedStyle,
	Easing,
	useAnimatedProps,
} from 'react-native-reanimated';

let first = true;


const AnimatedInfoRow = Animated.createAnimatedComponent(InfoRow);

const HomeScreen = () => {
	//States
	const theme = useAppTheme()
	const navigation = useNavigation();
	const { unit, cutoffs, timeOfDay, timeOfDaySettings, weatherData, lastRefresh, pinnedLocations, setTimeOfDay, setWeatherData, setLastRefresh, addPinnedLocation, removePinnedLocation } = useSettingsStore();

	const [options, setOptions] = useState(false);
	const [locationName, setLocationName] = useState("Boston, Massachusetts");
	const [locationCoords, setLocationCoords] = useState<string>("");
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [locationItems, setLocationItems] = useState<{ label: string, value: string }[]>([
		{ label: "Boston, Massachusetts", value: "Boston, Massachusetts" },
		{ label: "New York, New York", value: "New York, New York" },
		{ label: "Los Angeles, California", value: "Los Angeles, California" }
	]);
	const [dropDownLoading, setDropdownLoading] = useState(false);

	const [refreshing, setRefreshing] = useState(false);
	const [expanded, setExpanded] = useState<boolean>(false);
	const [day, setDay] = useState<number>(0);

	const [error, setError] = useState<string | null>(null);

	//Setup (settings, location, weather data)


	async function fetchWeather(location?: string) {
		try {
			const data = await getWeatherData(location || locationCoords || locationName);
			setLastRefresh(new Date().getTime());
			setWeatherData(data);
		} catch (err) {
			setError((err as Error).message);
		}
	};

	async function getCurrentLocation() {
		let { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('Permission to access location was denied');
			return;
		}

		try {
			// Get last known location while waiting for current position
			let lastLocation = await Location.getLastKnownPositionAsync();
			if (lastLocation) {
				setLocationDetails(lastLocation);
			}
			// Get current position (this may take time)
			let currentLocation = await Location.getCurrentPositionAsync();
			if (lastLocation && (currentLocation.coords.latitude !== lastLocation.coords.latitude || currentLocation.coords.longitude !== lastLocation.coords.longitude)) {
				setLocationDetails(currentLocation);
			}
		} catch (error) {
			console.error("Error getting location:", error);
			Alert.alert("Location Error", "Failed to get your location.");
		}
	}

	async function setLocationDetails(location: Location.LocationObject) {
		let locations = await locationAutocomplete(location.coords.latitude + "," + location.coords.longitude);
		setLocationName(locations[0].name + ", " + locations[0].region);
		setLocationCoords(location.coords.latitude + "," + location.coords.longitude);
		fetchWeather(location.coords.latitude + "," + location.coords.longitude);
	}

	function distance(coord1: string, coord2lat: number, coord2lon: number): number {
		return Math.sqrt(Math.pow(parseFloat(coord1.split(",")[0]) - coord2lat, 2) + Math.pow(parseFloat(coord1.split(",")[1]) - coord2lon, 2));
	}

	function getTimeOfDay(): TimeOfDay[] {
		const h = new Date().getHours();
		if (h >= 20 && h < 24) return ["night"];
		let tempTimeOfDay: TimeOfDay[] = [];
		if (h < 7) tempTimeOfDay.push("earlyMorning");
		if (h < 11) tempTimeOfDay.push("morning");
		if (h < 15) tempTimeOfDay.push("noon");
		if (h < 20) tempTimeOfDay.push("evening");
		return tempTimeOfDay;
	}

	//runs only once
	useEffect(() => {
		if (!first) return
		first = false;
		getCurrentLocation();
		setTimeOfDay(getTimeOfDay());
	}, []);

	//reload weather if app opened after 30 minutes
	useEffect(() => {
		const subscription = AppState.addEventListener('change', nextAppState => {
			if (nextAppState === 'active' && new Date().getTime() - lastRefresh > 1000 * 60 * 30) {
				// Reload if app is opened after 30 minutes
				reloadWeather();
			}
		});

		return () => {
			subscription.remove();
		};
	}, [lastRefresh]); //because stale state issues


	function reloadWeather() {
		if (locationCoords) {
			getCurrentLocation();
		} else {
			fetchWeather();
		}
	}

	function getWeatherTimeOfDay() {
		return weatherData?.forecast.forecastday[day]?.hour.filter(({ time }) => {
			const h = new Date(time).getHours();
			const curr = new Date().getHours();

			return (day === 0 ? h >= curr : true) &&
				timeOfDaySettings.some(setting =>
					timeOfDay.includes(setting.label) && h >= setting.start && h < setting.end
				);
		});
	}

	const filteredWeather = getWeatherTimeOfDay();
	const dailyWeather = filteredWeather?.length == 0 && day != 0
	const dayWeather = weatherData?.forecast.forecastday[day]
	const weather = filteredWeather?.length > 0 ? filteredWeather : (day == 0 ? [weatherData?.current] : [dayWeather?.day]);

	// const feelsLikeSelected = useSharedValue(0);
	// const tempSelected = useSharedValue(0);
	// const windSelected = useSharedValue(0);
	// const precipProbSelected = useSharedValue(0);
	// const precipSelected = useSharedValue(0);
	// const humiditySelected = useSharedValue(0);
	// const uvSelected = useSharedValue(0);
	// const visibilitySelected = useSharedValue(0);


	// Calculate current values
	const feelsLikeTemps = weather?.map(curr => curr?.feelslike_f) ?? [];
	const feelsLike = !dailyWeather ? getAverage(feelsLikeTemps) : weather?.[0]?.avgtemp_f;

	const temps = weather?.map(curr => curr?.temp_f) ?? [];
	const temp = !dailyWeather ? getAverage(temps) : weather?.[0]?.avgtemp_f;
	const windSpeeds = weather?.map(curr => curr?.wind_mph) ?? [];
	const wind = !dailyWeather ? weightWind(windSpeeds) : weather?.[0]?.maxwind_mph;
	const precipProbs = filteredWeather?.length > 0 ? weather?.map(curr => curr?.chance_of_rain) ?? [] : [day === 0 ? dayWeather?.hour[new Date().getHours()].chance_of_rain : weather?.[0]?.daily_chance_of_rain];
	const precipProb = !dailyWeather ? weightPrecipProb(precipProbs) : precipProbs[0];

	const precipInches = weather?.map(curr => curr?.precip_in).filter(v => v > 0) ?? [];
	const precip = !dailyWeather ? weightPrecip(precipInches) : weather?.[0]?.totalprecip_in;

	const humidityLevels = weather?.map(curr => curr?.humidity) ?? [];
	const humidity = !dailyWeather ? getAverage(humidityLevels) : weather?.[0]?.avghumidity;
	const cloudCover = day === 0 ? weatherData?.current.cloud : 50;
	const windGusts = day === 0 ? weatherData?.current.gust_mph : wind;
	const uvs = weather?.map(curr => curr?.uv) ?? [];
	const uv = !dailyWeather ? getAverage(uvs) : weather?.[0]?.uv;
	const visibilities = weather?.map(curr => curr?.vis_miles) ?? [];
	const visibility = !dailyWeather ? weightVisibility(visibilities) : weather[0]?.avgvis_miles;

	const conditionIcon = day === 0 ? weatherData?.current.condition.icon : dayWeather?.day.condition.icon;
	const conditionText = day === 0 ? weatherData?.current.condition.text : dayWeather?.day.condition.text;

	function getAverage(values: number[]): number {
		if (!values || values.length === 0) return 0;
		return values.reduce((a, b) => a + b) / values.length;
	}

	function weightVisibility(vis: number[]): number {
		if (!vis || vis.length === 0) return 0;
		// Sort values from lowest to highest (favor lower visibility)
		const sorted = [...vis].sort((a, b) => a - b);
		// Apply weighted average with more weight to lower values
		let totalWeight = 0;
		let weightedSum = 0;
		sorted.forEach((value, index) => {
			const weight = 2 ** (sorted.length - index);
			weightedSum += value * weight;
			totalWeight += weight;
		});
		return weightedSum / totalWeight;
	}

	function weightWind(winds: number[]): number {
		if (!winds || winds.length === 0) return 0;
		// Sort values from highest to lowest (favor higher wind)
		const sorted = [...winds].sort((a, b) => b - a);
		// Apply weighted average with more weight to higher values
		let totalWeight = 0;
		let weightedSum = 0;
		sorted.forEach((value, index) => {
			const weight = 2 ** (sorted.length - index);
			weightedSum += value * weight;
			totalWeight += weight;
		});
		return weightedSum / totalWeight;
	}

	function weightPrecipProb(precips: number[]): number {
		if (!precips || precips.length === 0) return 0;
		// Sort values from highest to lowest (favor higher precipitation)
		const sorted = [...precips].sort((a, b) => b - a);
		// Apply weighted average with more weight to higher values
		let totalWeight = 0;
		let weightedSum = 0;
		sorted.forEach((value, index) => {
			const weight = 1.5 ** (sorted.length - index);
			weightedSum += value * weight;
			totalWeight += weight;
		});
		return weightedSum / totalWeight;
	}

	function weightPrecip(precips: number[]): number {
		if (!precips || precips.length === 0) return 0;
		// Sort values from highest to lowest (favor higher precipitation)
		const sorted = [...precips].sort((a, b) => b - a);
		// Apply weighted average with more weight to higher values
		let totalWeight = 0;
		let weightedSum = 0;
		sorted.forEach((value, index) => {
			const weight = 1.05 ** (sorted.length - index);
			weightedSum += value * weight;
			totalWeight += weight;
		});
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


	// Custom hook to track value changes with animated shared values
	function useScaledValue(
		value: number,
		cutoffs: number[],
		hasZeroValue: boolean = false,
	) {
		const valueSelected = useSharedValue(5); //start at 5 because that is what happens before it is loaded

		useEffect(() => {
			valueSelected.value = convertToScale(value, cutoffs);
		}, [value, cutoffs]);

		const animatedStyle = useAnimatedStyle(() => ({
			width: withTiming(value == 0 && hasZeroValue ? 0 : `${(valueSelected.value + 1) / cutoffs.length * 100}%`, {
				duration: 500,
				easing: Easing.inOut(Easing.ease),
			}),
		}));

		return animatedStyle
	}

	let animatedFeelsLikeProps = useScaledValue(feelsLike, tempCutoffs);
	let animatedTempProps = useScaledValue(temp, tempCutoffs);
	let animatedWindProps = useScaledValue(wind, windCutoffs);
	let animatedWindGustsProps = useScaledValue(windGusts, windCutoffs);
	let animatedPrecipProbProps = useScaledValue(precipProb, precipProbCutoffs, !dayWeather?.day.daily_will_it_rain && !dayWeather?.day.daily_will_it_snow);
	let animatedPrecipProps = useScaledValue(precip, precipCutoffs);
	let animatedHumidityProps = useScaledValue(humidity, humidityCutoffs);
	let animatedUvProps = useScaledValue(uv, uvCutoffs);
	let animatedVisibilityProps = useScaledValue(visibility, visibilityCutoffs);
	let animatedCloudProps = useScaledValue(cloudCover, cloudCoverCutoffs);


	const windLabels = ["calm", "breezy", "windy"];

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
		<View style={{ flex: 1, backgroundColor: theme.colors.background }}>
			<Appbar.Header>
				<Appbar.Content title="Breezy" onPress={() => setOptions(!options)} />
				<Appbar.Action icon="cog" onPress={() => navigation.navigate("settings/index")} />
			</Appbar.Header>
			<ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false} refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={reloadWeather} />
			} >
				{/* Location picker */}
				<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
					<DropDownPicker
						listMode="SCROLLVIEW"
						open={dropdownOpen}
						setOpen={setDropdownOpen}
						value={locationName}
						searchable
						items={locationItems.some(item => item.label === locationName)
							? locationItems
							: [{ label: locationName, value: locationName }, ...locationItems]} // Add current location to items if it's not already there
						setItems={setLocationItems}
						setValue={(value) => { setLocationName(value); setLocationCoords(""); setLocationItems(pinnedLocations); }}
						onSelectItem={(item) => fetchWeather(item.value)}
						loading={dropDownLoading}
						disableLocalSearch={true} // required for remote search
						onChangeSearchText={(text) => {
							// Show the loading animation
							setDropdownLoading(true);

							// Get items from API
							locationAutocomplete(text)
								.then((items) => {
									if (locationCoords !== "") {
										items.sort((a, b) => {
											let distanceA = distance(locationCoords, a.lat, a.lon);
											let distanceB = distance(locationCoords, b.lat, b.lon);
											return distanceA - distanceB;
										});
									}

									setLocationItems(items.map((item) => {
										let locationString = item.name + ", " + item.region;
										return {
											label: locationString,
											value: locationString,
											icon: () => (
												<IconButton
													icon="pin"
													size={16}
													onPress={() => pinnedLocations.some(loc => loc.value === locationString)
														? removePinnedLocation({ label: locationString, value: locationString })
														: addPinnedLocation({ label: locationString, value: locationString })}
													iconColor={pinnedLocations.some(loc => loc.value === locationString)
														? theme.colors.primary
														: theme.colors.onSurfaceDisabled}
												/>
											)
										}
									}));
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
							backgroundColor: theme.colors.elevation.level1,
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
				<Text variant="headlineMedium" style={{ textAlign: "center", marginTop: 16 }}>
					{day == 0 ? "Today" : day == 1 ? "Tomorrow" : "Day After Tomorrow"}
				</Text>

				{/* Time of Day Selector */}
				<SegmentedButtons
					style={{ marginTop: 16, marginBottom: !error ? 32 : 16 }}
					value={timeOfDay}
					onValueChange={(value) => { setTimeOfDay(value) }}
					buttons={timeOfDaySettings.map(setting => ({
						value: setting.label,
						label: setting.displayName,
						disabled: day === 0 && new Date().getHours() >= setting.end,
					}))}
					multiSelect
					theme={{
						fonts: {
							labelLarge: { fontSize: 12 },
						},
					}}
				/>
				{error && <Text style={{ color: "red", textAlign: "center", marginBottom: 16 }}>{error}</Text>}
				{weatherData && dayWeather && (
					<>
						<Card style={{ padding: 16, borderRadius: 32, backgroundColor: theme.colors.elevation.level1, paddingBottom: 0, marginBottom: 16 }} elevation={0}>
							{/* Clothing Suggestion */}
							{feelsLike !== undefined && (
								<View style={{ height: 200 }}>
									<ClothingSuggestion
										temperature={feelsLike}
										textVariant="titleLarge"
									/>
								</View>
							)}
							<AnimatedInfoRow
								label="Feels like"
								value={feelsLike}
								cutoffs={tempCutoffs}
								textArray={["freezing", "cold", "mild", "warm", "hot"]}
								imperialUnit=" °F"
								metricUnit=" °C"
								animatedProps={animatedFeelsLikeProps}
							/>
							<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
								<Image
									source={{ uri: `https:${conditionIcon}` }}
									style={styles.weatherIcon}
									resizeMode="contain"
								/>
								<Text variant="titleMedium" style={styles.conditionText}>
									{conditionText}
								</Text>
							</View>
							{/* </Card.Content> */}
						</Card>
						{/* Weather Details */}
						<View style={{ padding: 16 }}>
							<Text variant="titleMedium" style={{ textAlign: "center" }} >
								Details
							</Text>
							<Divider style={{ margin: 16, marginTop: 8 }} />
							{/* <Card.Content> */}
							<AnimatedInfoRow
								animatedProps={animatedTempProps}
								label="Temp"
								value={temp}
								valuesArray={temps}
								cutoffs={tempCutoffs}
								textArray={["freezing", "cold", "mild", "warm", "hot"]}
								imperialUnit=" °F"
								metricUnit=" °C"
							/>
							<AnimatedInfoRow
								animatedProps={animatedWindProps}
								label="Wind"
								value={wind}
								valuesArray={windSpeeds}
								cutoffs={windCutoffs}
								textArray={windLabels}
								imperialUnit=" mph"
								metricUnit=" kph"
							/>
							{day == 0 && windGusts > wind + 10 ?
								<AnimatedInfoRow
									animatedProps={animatedWindGustsProps}
									label="Wind Gusts"
									value={windGusts}
									cutoffs={windCutoffs}
									textArray={windLabels}
									imperialUnit=" mph"
									metricUnit=" kph" /> : null}
							<AnimatedInfoRow
								animatedProps={animatedPrecipProbProps}
								label="Precip"
								value={precipProb}
								valuesArray={precipProbs}
								cutoffs={precipProbCutoffs}
								textArray={["unlikely", "possible", "likely"]}
								imperialUnit="%"
								metricUnit="%"
								hasZeroValue={!dayWeather?.day.daily_will_it_rain && !dayWeather?.day.daily_will_it_snow}
								zeroText="none" />
							{precipProb > 0 || precip > 0 ?
								<AnimatedInfoRow
									animatedProps={animatedPrecipProps}
									label={temp < 32 ? "Snow" : "Rain"}
									value={precip}
									valuesArray={precipInches}
									cutoffs={precipCutoffs}
									textArray={["drizzle", "shower", "downpour"]}
									imperialUnit=" in/hr"
									metricUnit=" cm/hr"
								/> : null}
							{temp >= 60 ? <AnimatedInfoRow
								animatedProps={animatedHumidityProps}
								label="Humidity"
								value={humidity}
								valuesArray={humidityLevels}
								cutoffs={humidityCutoffs}
								textArray={["dry", "comfort", "sticky"]}
								imperialUnit="%"
								metricUnit="%"
							/> : null}
							{expanded ?
								<>
									{day == 0 && windGusts <= wind + 10 ?
										<AnimatedInfoRow
											animatedProps={animatedWindGustsProps}
											label="Wind Gusts"
											value={windGusts ? windGusts : wind}
											cutoffs={windCutoffs}
											textArray={windLabels}
											imperialUnit=" mph"
											metricUnit=" kph" />
										: null}
									{temp < 60 ? <AnimatedInfoRow
										animatedProps={animatedHumidityProps}
										label="Humidity"
										value={humidity}
										valuesArray={humidityLevels}
										cutoffs={humidityCutoffs}
										textArray={["dry", "comfort", "sticky"]}
										imperialUnit="%"
										metricUnit="%"
									/> : null}
									<AnimatedInfoRow
										animatedProps={animatedUvProps}
										label="UV Index"
										value={uv}
										valuesArray={uvs}
										cutoffs={uvCutoffs}
										textArray={["safe", "caution", "danger"]}
										imperialUnit=""
										metricUnit="" />
									<AnimatedInfoRow
										animatedProps={animatedVisibilityProps}
										label="Visibility"
										value={visibility}
										valuesArray={visibilities}
										cutoffs={visibilityCutoffs}
										textArray={["foggy", "misty", "clear"]}
										imperialUnit=" mi"
										metricUnit=" km"
									/>
									{day == 0 && cloudCover ?
										<AnimatedInfoRow
											animatedProps={animatedCloudProps}
											label="Cloud Cover"
											value={cloudCover}
											cutoffs={cloudCoverCutoffs}
											textArray={["clear", "cloudy", "overcast"]}
											imperialUnit="%"
											metricUnit="%" />
										: null}

									<TextRow
										label="Sunrise"
										value={dayWeather?.astro.sunrise.replace(/^0/, '')}
									/>
									<TextRow
										label="Sunset"
										value={dayWeather?.astro.sunset.replace(/^0/, '')}
									/>
								</> : null}
							<Button onPress={() => setExpanded(!expanded)} style={{ alignSelf: "center", marginTop: 16 }} mode="contained">
								{expanded ? "Collapse" : "Expand"}
							</Button>
						</View>

						{/* Hourly Forecast */}
						<Text variant="titleMedium" style={styles.sectionTitle}>
							Hourly Forecast
						</Text>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ marginBottom: 30, paddingHorizontal: 8 }}
							contentOffset={{
								x: day !== 0 ? 152 * timeOfDaySettings.find(setting => timeOfDay.includes(setting.label))?.start : 0,
								y: 0
							}}
						>
							{(day == 0 ? dayWeather?.hour
								.slice(new Date().getHours()) : dayWeather?.hour)
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
			{
				weatherData && <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
					<Button mode="text" onPress={() => { setDay(day - 1) }} disabled={day === 0} style={{ flex: 1 }}>
						Previous Day
					</Button>
					<Button mode="text" onPress={() => { setDay(day + 1) }} disabled={day === (weatherData?.forecast.forecastday.length - 1)} style={{ flex: 1 }}>
						Next Day
					</Button>
				</View>
			}
		</View >
	);
};

const styles = StyleSheet.create({
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
	link: {
		marginTop: 24,
		textAlign: "center",
		color: "blue",
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
		alignItems: "center",
		marginVertical: 2,
	},
	sectionTitle: {
		marginTop: 24,
		marginBottom: 8,
		textAlign: "center",
	},
});

export default HomeScreen;