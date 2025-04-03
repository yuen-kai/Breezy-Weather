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
import AsyncStorage from "@react-native-async-storage/async-storage";

let first = true;

const HomeScreen = () => {
	//States
	const theme = useAppTheme()
	const navigation = useNavigation();
	const { unit, cutoffs, timeOfDay, timeOfDaySettings, weatherData, lastRefresh, setTimeOfDay, setWeatherData, setLastRefresh } = useSettingsStore();

	const [options, setOptions] = useState(false);
	const [locationName, setLocationName] = useState("Boston, Massachusetts");
	const [locationCoords, setLocationCoords] = useState<string>("");
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [items, setItems] = useState([{ label: "Boston, Massachusetts", value: "Boston, Massachusetts" }, { label: "New York, New York", value: "New York, New York" }, { label: "Los Angeles, California", value: "Los Angeles, California" }]);
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
			// await AsyncStorage.multiSet([
			// 	["weatherData", JSON.stringify(data)],
			// 	["lastRefresh", JSON.stringify(new Date().getTime())]
			// ]); // cache weather data and refresh timestamp
			setWeatherData(data);
		} catch (err) {
			// const [[, cachedData], [, cachedLastRefresh]] = await AsyncStorage.multiGet(["weatherData", "lastRefresh"]);
			// let cachedLastRefreshParsed
			// if (cachedLastRefresh) {
			// 	cachedLastRefreshParsed = JSON.parse(cachedLastRefresh);
			// 	setLastRefresh(cachedLastRefreshParsed);
			// }
			// if (cachedData) {
			// 	const lastRefreshDate = new Date(cachedLastRefreshParsed ?? lastRefresh);
			// 	const now = new Date();
			// 	const timeDiff =
			// 		(now.getFullYear() - lastRefreshDate.getFullYear()) * 365 +
			// 		(now.getMonth() - lastRefreshDate.getMonth()) * 30 +
			// 		(now.getDate() - lastRefreshDate.getDate())

			// 	if (timeDiff < 3) {
			// 		let parseCachedData: WeatherApiResponse = JSON.parse(cachedData);
			// 		let currentHour = parseCachedData.forecast.forecastday[timeDiff].hour[new Date().getHours()]
			// 		parseCachedData = {
			// 			...parseCachedData,
			// 			forecast: {
			// 				...parseCachedData.forecast,
			// 				forecastday: parseCachedData.forecast.forecastday.slice(timeDiff)
			// 			},
			// 			//fill in current as best as possible
			// 			current: {
			// 				...currentHour,
			// 				last_updated: new Date().toISOString(),
			// 				temp_c: currentHour.temp_c,
			// 				temp_f: currentHour.temp_f,
			// 				feelslike_c: currentHour.feelslike_c,
			// 				feelslike_f: currentHour.feelslike_f,
			// 				condition: currentHour.condition,
			// 				wind_mph: currentHour.wind_mph,
			// 				wind_kph: currentHour.wind_kph,
			// 				wind_degree: currentHour.wind_degree,
			// 				wind_dir: currentHour.wind_dir,
			// 				pressure_mb: currentHour.pressure_mb,
			// 				pressure_in: currentHour.pressure_in,
			// 				precip_mm: currentHour.precip_mm,
			// 				precip_in: currentHour.precip_in,
			// 				humidity: currentHour.humidity,
			// 				cloud: currentHour.cloud, uv: currentHour.uv,
			// 				gust_mph: currentHour.wind_mph,
			// 				gust_kph: currentHour.wind_kph
			// 			}
			// 		}
			// 		setWeatherData(parseCachedData);

			// 		const lastRefreshTime = timeDiff === 0
			// 			? lastRefreshDate.toLocaleTimeString([], { timeStyle: 'short' })
			// 			: lastRefreshDate.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
			// 		setError(`${(err as Error).message} - Falling back to cached weather data from ${lastRefreshTime}.`);
			// 	} else {
			// 		setError(`${(err as Error).message} - Cached data too outdated.`);
			// 	}
			// } else {
				setError((err as Error).message);
			// }
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

	function convertTemperature(temp: number): number {
		return unit === "imperial" ? temp : (temp - 32) * (5 / 9);
	}

	function convertWindSpeed(speed: number): number {
		return unit === "imperial" ? speed : speed * 1.60934;
	}

	function convertPrecip(precip: number): number {
		return unit === "imperial" ? precip : precip * 2.54;
	}

	function convertVisibility(vis: number): number {
		return unit === "imperial" ? vis : vis * 1.60934;
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

	function roundWeatherValue(label: string, value: number) {
		switch (label) {
			case "Feels like":
			case "Temp":
				value = unit === "imperial" ? value : convertTemperature(value);
				break;
			case "Wind":
			case "Wind Gusts":
				value = unit === "imperial" ? value : convertWindSpeed(value);
				break;
			case "Precip Inches":
				value = unit === "imperial" ? value : convertPrecip(value);
				break;
			case "Visibility":
				value = unit === "imperial" ? value : convertVisibility(value);
				break;
			case "Humidity":
			case "UV Index":
			case "Cloud Cover":
			default:
				break;
		}

		// Round to max precision 2
		if (value > 10) return Math.round(value);
		return value.toPrecision(2);
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
		// Determine min and max values based on weather data
		let minValue = 0;
		let maxValue = 0;

		if (label === "Feels like") {
			minValue = Math.min(...feelsLikeTemps);
			maxValue = Math.max(...feelsLikeTemps);
		} else if (label === "Temp") {
			minValue = !dailyWeather ? Math.min(...temps) : dayWeather?.day.mintemp_f ?? 0;
			maxValue = !dailyWeather ? Math.max(...temps) : dayWeather?.day.maxtemp_f ?? 0;
		} else if (label === "Wind") {
			minValue = Math.min(...windSpeeds);
			maxValue = Math.max(...windSpeeds);
		} else if (label === "Precip Inches") {
			minValue = Math.min(...precipInches);
			maxValue = Math.max(...precipInches);
		} else if (label === "Humidity") {
			minValue = Math.min(...humidityLevels);
			maxValue = Math.max(...humidityLevels);
		} else if (label === "UV Index") {
			minValue = Math.min(...uvs);
			maxValue = Math.max(...uvs);
		} else if (label === "Visibility") {
			minValue = Math.min(...visibilities);
			maxValue = Math.max(...visibilities);
		}

		// Calculate indices based on min and max values
		const minBoxIndex = convertToScale(minValue, cutoffs);
		const maxBoxIndex = convertToScale(maxValue, cutoffs);

		let selectedIndex = convertToScale(value, cutoffs);
		return (
			<View style={styles.infoRow}>
				<Text style={{ flex: 2, marginTop: 5, fontSize: label === "Feels like" ? 20 : 16 }}>{label}:</Text>
				<View style={{ flex: 1.5, flexDirection: "row", alignItems: "center" }}>
					<View>
						<Text variant={label == "Feels like" ? "titleLarge" : "titleMedium"} style={{ fontWeight: "bold", marginTop: 5 }}>
							{value == 0 && hasZeroValue ? zeroText : textArray[selectedIndex]}
						</Text>
						<Text variant={label == "Feels like" ? "labelLarge" : "labelMedium"}>
							{roundWeatherValue(label, value)}{
								unit === "imperial" ? imperialUnit : metricUnit}
						</Text></View>
					{minBoxIndex !== undefined && maxBoxIndex !== undefined && maxBoxIndex - minBoxIndex >= 2 && (
						<Tooltip title={`Min: ${minValue} ${unit === "imperial" ? imperialUnit : metricUnit}, Max: ${maxValue} ${unit === "imperial" ? imperialUnit : metricUnit}`} enterTouchDelay={0}>
							<IconButton
								icon="swap-vertical-bold"
								iconColor={theme.colors.error}
								style={{ height: 30, aspectRatio: 1 }}
							/>
						</Tooltip>
					)}
				</View>

				<View style={[styles.infoColn, { flex: 2.8 }]}>
					<BoxRow
						numBoxes={cutoffs.length}
						selectedBox={value == 0 && hasZeroValue ? -1 : selectedIndex}
					/>
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
						items={items.some(item => item.value === locationName)
							? items
							: [{ label: locationName, value: locationName }, ...items]} // Add current location to items if it's not already there
						setItems={setItems}
						setValue={(value) => { setLocationName(value); setLocationCoords(""); setItems([]); }}
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

									setItems(items.map((item) => {
										let locationString = item.name + ", " + item.region;
										return { label: locationString, value: locationString }
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
					onValueChange={(value) => setTimeOfDay(value)}
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
							<InfoRow
								label="Feels like"
								value={feelsLike}
								cutoffs={tempCutoffs}
								textArray={["freezing", "cold", "mild", "warm", "hot"]}
								imperialUnit=" °F"
								metricUnit=" °C"
							/>

							<View style={{flexDirection: "row", alignItems: "center", justifyContent: "center"}}>
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
					<InfoRow
						label="Temp"
						value={temp}
						cutoffs={tempCutoffs}
						textArray={["freezing", "cold", "mild", "warm", "hot"]}
						imperialUnit=" °F"
						metricUnit=" °C"
					/>
					<InfoRow
						label="Wind"
						value={wind}
						cutoffs={windCutoffs}
						textArray={windLabels}
						imperialUnit=" mph"
						metricUnit=" kph"
					/>
					{day == 0 && windGusts > wind + 10 ?
						<InfoRow
							label="Wind Gusts"
							value={windGusts}
							cutoffs={windCutoffs}
							textArray={windLabels}
							imperialUnit=" mph"
							metricUnit=" kph" /> : null}
					<InfoRow
						label="Precip"
						value={precipProb}
						cutoffs={precipProbCutoffs}
						textArray={["unlikely", "possible", "likely"]}
						imperialUnit="%"
						metricUnit="%"
						hasZeroValue={!dayWeather?.day.daily_will_it_rain && !dayWeather?.day.daily_will_it_snow}
						zeroText="none" />
					{precipProb > 0 || precip > 0 ?
						<InfoRow
							label={temp < 32 ? "Snow" : "Rain"}
							value={precip}
							cutoffs={precipCutoffs}
							textArray={["drizzle", "shower", "downpour"]}
							imperialUnit=" in/hr"
							metricUnit=" cm/hr"
						/> : null}
					{temp >= 60 ? <InfoRow
						label="Humidity"
						value={humidity}
						cutoffs={humidityCutoffs}
						textArray={["dry", "comfort", "sticky"]}
						imperialUnit="%"
						metricUnit="%"
					/> : null}
					{expanded ?
						<>
							{day == 0 && windGusts <= wind + 10 ?
								<InfoRow
									label="Wind Gusts"
									value={windGusts ? windGusts : wind}
									cutoffs={windCutoffs}
									textArray={windLabels}
									imperialUnit=" mph"
									metricUnit=" kph" />
								: null}
							{temp < 60 ? <InfoRow
								label="Humidity"
								value={humidity}
								cutoffs={humidityCutoffs}
								textArray={["dry", "comfort", "sticky"]}
								imperialUnit="%"
								metricUnit="%"
							/> : null}
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
								imperialUnit=" mi"
								metricUnit=" km"
							/>
							{day == 0 && cloudCover ?
								<InfoRow
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
						x: day !==0 ? 152 * timeOfDaySettings.find(setting => timeOfDay.includes(setting.label))?.start : 0,
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
			<Button mode="text" onPress={() => setDay(day - 1)} disabled={day === 0} style={{ flex: 1 }}>
				Previous Day
			</Button>
			<Button mode="text" onPress={() => setDay(day + 1)} disabled={day === (weatherData?.forecast.forecastday.length - 1)} style={{ flex: 1 }}>
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