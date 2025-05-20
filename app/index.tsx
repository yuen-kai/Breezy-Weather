import React, { useState, useEffect, useRef } from "react";
import { getWeatherData, locationAutocomplete } from "../services/weatherApi";
import * as Location from "expo-location";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
  AppState,
  TouchableOpacity,
} from "react-native";
import { Text, Button, Card, Divider, Appbar, IconButton } from "react-native-paper";
import { Tooltip } from "@rneui/themed";
import { useAppTheme } from "../theme";
import { router } from "expo-router";
import useSettingsStore from "../store/store";
import HourlyWeatherCard from "../components/HourlyWeatherCard";
import ClothingSuggestion from "../components/ClothingSuggestion";
import { TimeOfDay } from "@/types/timeOfDay";
import TimeOfDaySelector from "../components/TimeOfDaySelector";
import { InfoRow, convertToScale } from "@/components/InfoRow";
import { TextRow } from "@/components/TextRow";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  interpolate,
  withSpring,
} from "react-native-reanimated";
import {
  getAverage,
  weightPrecip,
  weightWind,
  weightVisibility,
  weightPrecipProb,
} from "@/functions/average";
import {
  convertTemperature,
  convertWindSpeed,
  convertPrecip,
  convertVisibility,
} from "@/functions/conversions";
import { ThemedDropDownPicker } from "@/components/ThemedDropDownPicker";
import { checkIfInTimeOfDay } from "@/functions/timeOfDayFunctions";
import { adjustHourPrecip, adjustHourPrecipProb } from "@/functions/adjustPrecip";
import AlertRow from "../components/AlertRow";
import ExpandableContent from "../components/ExpandableContent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import * as SplashScreen from "expo-splash-screen";

let first = true;
const AnimatedInfoRow = Animated.createAnimatedComponent(InfoRow);

const HomeScreen = () => {
  const theme = useAppTheme();
  const {
    unit,
    cutoffs,
    timeOfDay,
    timeOfDaySettings,
    defaultTimeOfDay,
    weatherData,
    lastRefresh,
    pinnedLocations,
    locationName,
    locationCoords,
    setTimeOfDay,
    setWeatherData,
    setLastRefresh,
    addPinnedLocation,
    removePinnedLocation,
    setPinnedLocations,
    setLocationName,
    setLocationCoords,
  } = useSettingsStore();

  const [locationItems, setLocationItems] = useState<{ label: string; value: string }[]>([]);
  const [dropDownLoading, setDropdownLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [day, setDay] = useState<number>(0);

  const [error, setError] = useState<string>("");

  const [firstTime, setFirstTime] = useState<boolean>(false);

  async function fetchWeather(location?: string) {
    try {
      const data = await getWeatherData(location || locationCoords || locationName);
      setLastRefresh(new Date().getTime());

      // Check for and filter out duplicate alerts
      const uniqueAlerts = data.alerts?.alert
        ? data.alerts.alert.filter(
            (alert, index, self) => index === self.findIndex((a) => a.headline === alert.headline)
          )
        : [];
      data.alerts.alert = uniqueAlerts;

      for (const alert of data.alerts.alert) {
        // Clean up alert messages
        const cleanupFunction = (str: string) =>
          str
            ?.replace(/([^\n])\n([^\n])/g, "$1 $2")
            .replace(/[ \t]+/g, " ")
            .trim();
        alert.headline = cleanupFunction(alert.headline);
        alert.desc = cleanupFunction(alert.desc);
        alert.instruction = cleanupFunction(alert.instruction);
      }

      // Remove outdated alerts
      data.alerts.alert = data.alerts.alert.filter(
        (alert) => new Date(alert.expires).getTime() > Date.now()
      );

      setWeatherData(data);
      setError("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function getCurrentLocation(noError?: boolean) {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      if (!noError) setError("Turn on location permissions to get your current location.");
      return false;
    }
    try {
      let lastLocation = await Location.getLastKnownPositionAsync();
      if (lastLocation) {
        setLocationDetails(lastLocation);
      }

      // Get current position (this may take time)
      async function getNewCurrentLocation(lastLocation: Location.LocationObject | null) {
        let currentLocation = await Location.getCurrentPositionAsync();
        if (
          lastLocation &&
          (currentLocation.coords.latitude !== lastLocation.coords.latitude ||
            currentLocation.coords.longitude !== lastLocation.coords.longitude)
        ) {
          setLocationDetails(currentLocation);
        }
      }
      getNewCurrentLocation(lastLocation);
      return true;
    } catch (error) {
      console.error("Error getting location:", error);
      setError("Failed to get your location.");
      return false;
    }
  }

  async function setLocationDetails(location: Location.LocationObject) {
    try {
      const locations = await locationAutocomplete(
        location.coords.latitude + "," + location.coords.longitude
      );
      if (locations && locations.length > 0) {
        setLocationName(locations[0].name + ", " + locations[0].region);
      }
    } catch (error) {
      setLocationName("Current Location (error getting name)");
    }
    setLocationCoords(location.coords.latitude + "," + location.coords.longitude);
    fetchWeather(location.coords.latitude + "," + location.coords.longitude);
  }

  function distance(coord1: string, coord2lat: number, coord2lon: number): number {
    return Math.sqrt(
      Math.pow(parseFloat(coord1.split(",")[0]) - coord2lat, 2) +
        Math.pow(parseFloat(coord1.split(",")[1]) - coord2lon, 2)
    );
  }

  async function checkForUpdate() {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync(); //causing problems with initial dark mode setting?
      } else {
        setUpFirstTimeUsingDate();
        SplashScreen.hideAsync();
      }
    } catch (error) {
      console.warn(`Error fetching latest Expo update: ${error}`);
      setUpFirstTimeUsingDate();
      SplashScreen.hideAsync();
    }
  }

  async function setUpFirstTimeUsingDate() {
    const openedBefore = await AsyncStorage.getItem("firstTime");
    if (openedBefore) return;
    setTimeout(() => {
      setFirstTime(true);
    }, 3000);
    await AsyncStorage.setItem("firstTime", JSON.stringify(new Date().getTime()));
  }

  async function getPinnedLocations() {
    const pinnedLocations = await AsyncStorage.getItem("pinnedLocations");
    if (!pinnedLocations) AsyncStorage.setItem("pinnedLocations", JSON.stringify([]));
    const parsedJSON = pinnedLocations ? JSON.parse(pinnedLocations) : [];
    setPinnedLocations(parsedJSON);
    return parsedJSON;
  }

  function reloadWeather() {
    if (locationCoords) {
      getCurrentLocation();
    } else if (locationName) {
      fetchWeather();
    }
  }

  useEffect(() => {
    if (first) {
      checkForUpdate();

      getCurrentLocation(true).then((success) => {
        getPinnedLocations().then((pinnedLocations) => {
          if (!success && !locationName) {
            if (pinnedLocations.length > 0) {
              setLocationName(pinnedLocations[0].label);
              fetchWeather(pinnedLocations[0].value);
            } else {
              setError("Turn on location permissions to get your current location.");
            }
          }
        });
      });
    }

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        if (first) {
          first = false;
          return;
        }
        // Reload if app is opened after 30 minutes
        if (new Date().getTime() - lastRefresh > 1000 * 60 * 30) {
          reloadWeather();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [lastRefresh]);

  const filteredWeather = weatherData?.forecast.forecastday[day]?.hour.filter(({ time }) =>
    checkIfInTimeOfDay(new Date(time), day, timeOfDaySettings, timeOfDay)
  );
  const dailyWeather = filteredWeather?.length == 0 && day != 0;
  const dayWeather = weatherData?.forecast.forecastday[day];
  const weather =
    filteredWeather?.length ?? 0 > 0
      ? filteredWeather
      : day == 0
      ? [weatherData?.current]
      : [dayWeather?.day];

  const feelsLikeTemps = weather?.map((curr) => curr?.feelslike_f) ?? [];
  const feelsLike = !dailyWeather ? getAverage(feelsLikeTemps) : weather?.[0]?.avgtemp_f;

  const temps = weather?.map((curr) => curr?.temp_f) ?? [];
  const temp = !dailyWeather ? getAverage(temps) : weather?.[0]?.avgtemp_f;
  const windSpeeds = weather?.map((curr) => curr?.wind_mph) ?? [];
  const wind = !dailyWeather ? weightWind(windSpeeds) : weather?.[0]?.maxwind_mph;
  const precipProbs =
    filteredWeather?.length > 0
      ? weather?.map((curr) => adjustHourPrecipProb(curr)) ?? []
      : [
          day === 0
            ? dayWeather?.hour[new Date().getHours()].chance_of_rain
            : weather?.[0]?.daily_chance_of_rain,
        ];
  const precipProb = !dailyWeather ? weightPrecipProb(precipProbs) : precipProbs[0];
  const precipInches = weather?.map((curr) => adjustHourPrecip(curr)) ?? [];
  const precip = !dailyWeather
    ? weightPrecip(precipInches.filter((v) => v > 0))
    : weather?.[0]?.totalprecip_in;

  const humidityLevels = weather?.map((curr) => curr?.humidity) ?? [];
  const humidity = !dailyWeather ? getAverage(humidityLevels) : weather?.[0]?.avghumidity;
  const cloudCover = day === 0 ? weatherData?.current.cloud : 50;
  const windGusts = day === 0 ? weatherData?.current.gust_mph : wind;
  const uvs = weather?.map((curr) => curr?.uv) ?? [];
  const uv = !dailyWeather ? getAverage(uvs) : weather?.[0]?.uv;
  const visibilities = weather?.map((curr) => curr?.vis_miles) ?? [];
  const visibility = !dailyWeather ? weightVisibility(visibilities) : weather?.[0]?.avgvis_miles;

  const conditionIcon =
    day === 0 ? weatherData?.current.condition.icon : dayWeather?.day.condition.icon;
  const conditionText =
    day === 0 ? weatherData?.current.condition.text : dayWeather?.day.condition.text;

  const tempCutoffs = cutoffs["Temp"];
  const windCutoffs = cutoffs["Wind"];
  const precipProbCutoffs = cutoffs["Precip Prob"];
  const precipCutoffs = cutoffs["Precip Inches"];
  const humidityCutoffs = cutoffs["Humidity"];
  const uvCutoffs = cutoffs["Uv"];
  const visibilityCutoffs = cutoffs["Visibility"];
  const cloudCoverCutoffs = cutoffs["Cloud Cover"];

  function useScaledValue(value: number, cutoffs: number[], hasZeroValue: boolean = false) {
    const valueSelected = useSharedValue(5); //start at 5 because that is what happens before it is loaded

    useEffect(() => {
      valueSelected.value = convertToScale(value, cutoffs);
    }, [value, cutoffs]);

    const animatedStyle = useAnimatedStyle(() => ({
      width: withTiming(
        value == 0 && hasZeroValue ? 0 : `${((valueSelected.value + 1) / cutoffs.length) * 100}%`,
        {
          duration: 500,
          easing: Easing.inOut(Easing.ease),
        }
      ),
    }));

    return animatedStyle;
  }

  const precipProbHasZeroValue = weatherData?.forecast.forecastday[day]?.hour.every(
    (hour) => adjustHourPrecipProb(hour) === 0
  );

  let animatedFeelsLikeProps = useScaledValue(feelsLike, tempCutoffs);
  let animatedTempProps = useScaledValue(temp, tempCutoffs);
  let animatedWindProps = useScaledValue(wind, windCutoffs);
  let animatedWindGustsProps = useScaledValue(windGusts, windCutoffs);
  let animatedPrecipProbProps = useScaledValue(
    precipProb,
    precipProbCutoffs,
    precipProbHasZeroValue
  );
  let animatedPrecipProps = useScaledValue(precip, precipCutoffs);
  let animatedHumidityProps = useScaledValue(humidity, humidityCutoffs);
  let animatedUvProps = useScaledValue(uv ?? 0, uvCutoffs);
  let animatedVisibilityProps = useScaledValue(visibility, visibilityCutoffs);
  let animatedCloudProps = useScaledValue(cloudCover ?? 0, cloudCoverCutoffs);

  const tempLabels = ["freezing", "cold", "mild", "warm", "hot"];
  const windLabels = ["calm", "breezy", "windy"];

  const scrollViewRef = useRef<ScrollView>(null);

  const togglePinnedLocation = (locationName: string) => {
    if (pinnedLocations.some((loc) => loc.value === locationName)) {
      removePinnedLocation({ label: locationName, value: locationName });
    } else {
      addPinnedLocation({ label: locationName, value: locationName });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Appbar.Content title="Breezy" />
        <Tooltip
          visible={firstTime}
          popover={
            <Text style={{ color: theme.colors.surface, textAlign: "center" }}>
              Tap here to customize your weather preferences and clothing recommendations
            </Text>
          }
          height={100}
          onClose={() => setFirstTime(false)}
          width={220}
          backgroundColor={theme.colors.primary}
        >
          <Appbar.Action icon="cog" onPress={() => router.navigate("/settings")} />
        </Tooltip>
      </Appbar.Header>
      <ScrollView
        style={{ flex: 1, padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reloadWeather} />}
      >
        {/* Location picker */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <ThemedDropDownPicker
            open={dropdownOpen}
            setOpen={setDropdownOpen}
            onClose={() => setLocationItems(pinnedLocations)}
            listMode="SCROLLVIEW"
            value={locationName}
            placeholder="Select a location"
            searchable
            items={
              locationItems.length == 0
                ? pinnedLocations.some((item) => item.label === locationName) || !locationName
                  ? pinnedLocations
                  : [{ label: locationName, value: locationName }, ...pinnedLocations]
                : locationItems.some((item) => item.label === locationName) || !locationName
                ? locationItems
                : [{ label: locationName, value: locationName }, ...locationItems]
            } // Add current location to items if it's not already there (needed for selected value box to work)
            setItems={setLocationItems}
            setValue={(value) => {
              setLocationName(value);
              setLocationCoords("");
              setLocationItems(pinnedLocations);
            }}
            onSelectItem={(item) => fetchWeather(item.value)}
            disableLocalSearch={true} // required for remote search
            loading={dropDownLoading}
            renderListItem={(item) => (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 8,
                  backgroundColor:
                    item.label === locationName
                      ? theme.colors.secondaryContainer
                      : theme.colors.elevation.level1,
                }}
                onPress={() => {
                  setLocationName(item.value);
                  setLocationCoords("");
                  setLocationItems(pinnedLocations);
                  fetchWeather(item.value);
                  setDropdownOpen(false);
                }}
              >
                <Text variant="bodyLarge" style={{ fontSize: 15 }}>
                  {item.label}
                </Text>
                <IconButton
                  icon={
                    pinnedLocations.some((loc) => loc.value === item.value) ? "pin" : "pin-outline"
                  }
                  size={16}
                  onPress={() => togglePinnedLocation(item.value)}
                  iconColor={
                    pinnedLocations.some((loc) => loc.value === item.value)
                      ? theme.colors.primary
                      : theme.colors.onSurfaceDisabled
                  }
                />
              </TouchableOpacity>
            )}
            onChangeSearchText={(text) => {
              // Show the loading animation
              setDropdownLoading(true);

              // Get items from API
              locationAutocomplete(text)
                .then((items) => {
                  // If we have locationCoords, identify nearby locations and move them to the top
                  if (locationCoords) {
                    const nearbyThreshold = 1; // About a few cities away in lat/lon distance

                    // Separate nearby and distant items
                    const nearbyItems = [];
                    const distantItems = [];

                    for (const item of items) {
                      const dist = distance(locationCoords, item.lat, item.lon);
                      if (dist < nearbyThreshold) {
                        nearbyItems.push(item);
                      } else {
                        distantItems.push(item);
                      }
                    }

                    // Sort nearby items by distance
                    nearbyItems.sort((a, b) => {
                      const distanceA = distance(locationCoords, a.lat, a.lon);
                      const distanceB = distance(locationCoords, b.lat, b.lon);
                      return distanceA - distanceB;
                    });

                    // Combine lists: nearby items first, then distant items in their original order
                    items = [...nearbyItems, ...distantItems];
                  }

                  setLocationItems(
                    items.map((item) => {
                      let locationString = item.name + ", " + item.region;
                      return {
                        label: locationString,
                        value: locationString,
                      };
                    })
                  );
                })
                .catch((err) => {
                  console.error(err);
                  setLocationItems([{ label: text, value: text }]);
                })
                .finally(() => {
                  // Hide the loading animation
                  setDropdownLoading(false);
                });
            }}
            containerStyle={{ flex: 1 }}
            searchPlaceholder="Search location"
          />
          <IconButton icon="crosshairs-gps" onPress={() => getCurrentLocation()} />
        </View>
        {weatherData && weatherData.alerts.alert.length > 0 && (
          <View style={{ marginTop: 16 }}>
            {weatherData.alerts.alert.map((alert, index) => (
              <AlertRow key={index} alert={alert} />
            ))}
          </View>
        )}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 16,
          }}
        >
          <IconButton
            icon="chevron-left"
            onPress={() => setDay(Math.max(0, day - 1))}
            disabled={day <= 0}
            size={30}
          />
          <Text variant="headlineMedium" style={{ textAlign: "center" }}>
            {day === 0
              ? "Today"
              : day === 1
              ? "Tomorrow"
              : new Date(new Date().setDate(new Date().getDate() + day)).toLocaleDateString(
                  undefined,
                  { weekday: "long", month: "short", day: "numeric" }
                )}
          </Text>
          <IconButton
            icon="chevron-right"
            onPress={() => setDay(Math.min(weatherData?.forecast.forecastday.length - 1, day + 1))}
            disabled={weatherData != null && day === weatherData.forecast.forecastday.length - 1}
            size={30}
          />
        </View>

        {/* Time of Day Selector */}
        <TimeOfDaySelector
          style={{ marginTop: 16, marginBottom: !error ? 32 : 16 }}
          value={timeOfDay}
          onValueChange={setTimeOfDay}
          disabledFunction={(setting) => day === 0 && new Date().getHours() >= setting.end}
        />
        {error && (
          <Text style={{ color: "red", textAlign: "center", marginBottom: 16 }}>{error}</Text>
        )}
        {weatherData && dayWeather && (
          <>
            <Card
              style={{
                padding: 16,
                borderRadius: 32,
                backgroundColor: theme.colors.elevation.level1,
                paddingBottom: 0,
                marginBottom: 16,
              }}
              elevation={0}
            >
              {feelsLike !== undefined && (
                <View style={{ height: 200 }}>
                  <ClothingSuggestion
                    temperature={feelsLike}
                    textVariant="titleLarge"
                    valuesArray={feelsLikeTemps}
                  />
                </View>
              )}
              <AnimatedInfoRow
                label="Feels like"
                value={feelsLike}
                metricConversion={convertTemperature}
                cutoffs={tempCutoffs}
                textArray={tempLabels}
                imperialUnit=" °F"
                metricUnit=" °C"
                animatedProps={animatedFeelsLikeProps as React.RefAttributes<View>}
                day={day}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  source={{ uri: `https:${conditionIcon}` }}
                  style={styles.weatherIcon}
                  resizeMode="contain"
                />
                <Text variant="titleMedium" style={styles.conditionText}>
                  {conditionText}
                </Text>
              </View>
              {weatherData.current.vis_miles < 1 && (
                <Text
                  style={{
                    color: theme.colors.error,
                    textAlign: "center",
                    fontWeight: "bold",
                    marginVertical: 8,
                  }}
                >
                  Warning: Low visibility ({weatherData.current.vis_miles} miles)!
                </Text>
              )}
              {/* </Card.Content> */}
            </Card>
            {/* Weather Details */}
            <View style={{ padding: 16 }}>
              <Text variant="titleMedium" style={{ textAlign: "center" }}>
                Details
              </Text>
              <Divider style={{ margin: 16, marginTop: 8 }} />
              {/* <Card.Content> */}
              <AnimatedInfoRow
                animatedProps={animatedTempProps as React.RefAttributes<View>}
                label="Temp"
                value={temp}
                metricConversion={convertTemperature}
                cutoffs={tempCutoffs}
                textArray={tempLabels}
                imperialUnit=" °F"
                metricUnit=" °C"
              />
              <AnimatedInfoRow
                animatedProps={animatedWindProps as React.RefAttributes<View>}
                label="Wind"
                value={wind}
                metricConversion={convertWindSpeed}
                cutoffs={windCutoffs}
                textArray={windLabels}
                imperialUnit=" mph"
                metricUnit=" kph"
              />
              {day == 0 && windGusts > wind + 10 ? (
                <AnimatedInfoRow
                  animatedProps={animatedWindGustsProps as React.RefAttributes<View>}
                  label="Wind Gusts"
                  value={windGusts}
                  metricConversion={convertWindSpeed}
                  cutoffs={windCutoffs}
                  textArray={windLabels}
                  imperialUnit=" mph"
                  metricUnit=" kph"
                />
              ) : null}
              <AnimatedInfoRow
                animatedProps={animatedPrecipProbProps as React.RefAttributes<View>}
                label="Precip"
                value={precipProb}
                cutoffs={precipProbCutoffs}
                textArray={["unlikely", "possible", "likely"]}
                imperialUnit="%"
                metricUnit="%"
                hasZeroValue={precipProbHasZeroValue}
                zeroText="none"
              />
              {precipProb > 0 || precip > 0 ? (
                <AnimatedInfoRow
                  animatedProps={animatedPrecipProps as React.RefAttributes<View>}
                  label={temp < 32 ? "Snow" : "Rain"}
                  value={precip}
                  metricConversion={convertPrecip}
                  cutoffs={precipCutoffs}
                  textArray={["drizzle", "shower", "downpour"]}
                  imperialUnit={!dailyWeather ? " in/hr" : " in"}
                  metricUnit={!dailyWeather ? " mm/hr" : " mm"}
                />
              ) : null}
              {temp >= 60 ? (
                <AnimatedInfoRow
                  animatedProps={animatedHumidityProps as React.RefAttributes<View>}
                  label="Humidity"
                  value={humidity}
                  cutoffs={humidityCutoffs}
                  textArray={["dry", "comfort", "sticky"]}
                  imperialUnit="%"
                  metricUnit="%"
                />
              ) : null}
              <ExpandableContent initialExpanded={expanded}>
                {day == 0 && windGusts <= wind + 10 ? (
                  <AnimatedInfoRow
                    animatedProps={animatedWindGustsProps as React.RefAttributes<View>}
                    label="Wind Gusts"
                    value={windGusts ? windGusts : wind}
                    cutoffs={windCutoffs}
                    metricConversion={convertWindSpeed}
                    textArray={windLabels}
                    imperialUnit=" mph"
                    metricUnit=" kph"
                  />
                ) : null}
                {temp < 60 ? (
                  <AnimatedInfoRow
                    animatedProps={animatedHumidityProps as React.RefAttributes<View>}
                    label="Humidity"
                    value={humidity}
                    cutoffs={humidityCutoffs}
                    textArray={["dry", "comfort", "sticky"]}
                    imperialUnit="%"
                    metricUnit="%"
                  />
                ) : null}
                <AnimatedInfoRow
                  animatedProps={animatedUvProps as React.RefAttributes<View>}
                  label="UV Index"
                  value={uv ?? 0}
                  cutoffs={uvCutoffs}
                  textArray={["safe", "caution", "danger"]}
                  imperialUnit=""
                  metricUnit=""
                />
                <AnimatedInfoRow
                  animatedProps={animatedVisibilityProps as React.RefAttributes<View>}
                  label="Visibility"
                  value={visibility}
                  metricConversion={convertVisibility}
                  cutoffs={visibilityCutoffs}
                  textArray={["foggy", "misty", "clear"]}
                  imperialUnit=" mi"
                  metricUnit=" km"
                />
                {cloudCover ? (
                  <AnimatedInfoRow
                    animatedProps={animatedCloudProps as React.RefAttributes<View>}
                    label="Cloud Cover"
                    value={cloudCover}
                    cutoffs={cloudCoverCutoffs}
                    textArray={["clear", "cloudy", "overcast"]}
                    imperialUnit="%"
                    metricUnit="%"
                  />
                ) : null}

                <TextRow label="Sunrise" value={dayWeather?.astro.sunrise.replace(/^0/, "")} />
                <TextRow label="Sunset" value={dayWeather?.astro.sunset.replace(/^0/, "")} />
              </ExpandableContent>
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
                x: 0, // Initial offset is 0
                y: 0,
              }}
              ref={scrollViewRef}
              onContentSizeChange={() => {
                if (day !== 0 && timeOfDay.length > 0) {
                  const startHour =
                    timeOfDaySettings.find((setting) => timeOfDay.includes(setting.label))?.start ??
                    0;
                  scrollViewRef.current?.scrollTo({ x: 152 * 7, y: 0, animated: true });
                } else {
                  scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
                }
              }}
            >
              {(day == 0 ? dayWeather?.hour.slice(new Date().getHours()) : dayWeather?.hour).map(
                (hourItem, index) => {
                  return (
                    <HourlyWeatherCard
                      key={index}
                      time={hourItem.time}
                      overallScale={convertToScale(hourItem.feelslike_f, tempCutoffs) + 1}
                      feelsLike={hourItem.feelslike_f}
                      windSpeed={hourItem.wind_mph}
                      conditionIcon={hourItem.condition.icon}
                      day={day}
                    />
                  );
                }
              )}
            </ScrollView>
          </>
        )}
      </ScrollView>
      {weatherData && (
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          <Button
            mode="text"
            onPress={() => {
              setDay(Math.max(0, day - 1));
            }}
            disabled={day === 0}
            style={{ flex: 1 }}
          >
            Previous Day
          </Button>
          <Button
            mode="text"
            onPress={() => {
              setDay(Math.min(weatherData?.forecast.forecastday.length - 1, day + 1));
            }}
            disabled={day === weatherData?.forecast.forecastday.length - 1}
            style={{ flex: 1 }}
          >
            Next Day
          </Button>
        </View>
      )}
    </View>
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
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
    textAlign: "center",
  },
});

export default HomeScreen;
