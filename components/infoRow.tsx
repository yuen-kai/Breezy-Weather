import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, IconButton } from "react-native-paper";
import BoxRow from "@/components/boxRow";
import { useAppTheme } from "@/theme";
import useSettingsStore from "@/store/settingsStore";
import { getAverage } from "@/functions/average";
import { Tooltip } from "@rneui/themed";

interface InfoRowProps {
  label: string;
  value: number;
  cutoffs: number[];
  textArray: string[];
  imperialUnit: string;
  metricUnit: string;
  valuesArray: number[];
  selectedBox?: number;
  hasZeroValue?: boolean;
  zeroText?: string;
}

export function convertToScale(value: number, cutoffs: number[]): number {
  for (let i = 0; i < cutoffs.length; i++) {
    if (value <= cutoffs[i]) return i;
  }
  return cutoffs.length;
}

export const InfoRow = React.forwardRef<View, InfoRowProps>(
  (
    {
      label,
      value,
      cutoffs,
      textArray,
      imperialUnit,
      metricUnit,
      valuesArray = [],
      selectedBox,
      hasZeroValue,
      zeroText,
    },
    ref
  ) => {
    const theme = useAppTheme();
    const { unit, timeOfDay, timeOfDaySettings } = useSettingsStore();
    const [open, setOpen] = React.useState(false);

    function getDrasticChangeMessage() {
      let drasticChangeMessage1 = "";
      let sortedTimeOfDay = [...timeOfDay].sort((a, b) => {
        const aIndex = timeOfDaySettings.findIndex(
          (setting) => setting.label === a
        );
        const bIndex = timeOfDaySettings.findIndex(
          (setting) => setting.label === b
        );
        return aIndex - bIndex;
      });
      let counter = 0;
      for (const time of sortedTimeOfDay) {
        const timeOfDaySetting = timeOfDaySettings.find(
          (setting) => setting.label === time
        ) ?? { label: "", start: 0, end: 0 };
        const values = valuesArray.slice(
          counter,
          counter + timeOfDaySetting.end - timeOfDaySetting.start
        );
        const filteredValues =
          label === "Rain" || label === "Snow"
            ? values.filter((val) => val > 0)
            : values;
        const average =
          filteredValues.length > 0 ? getAverage(filteredValues) : 0;
        counter += timeOfDaySetting.end - timeOfDaySetting.start;

        drasticChangeMessage1 += `${timeOfDaySetting.label}: ${
          convertToScale(average, cutoffs) + 1
        }/${cutoffs.length}\n`;
      }
      return drasticChangeMessage1;
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

    // Calculate indices based on min and max values
    const minValue = valuesArray ? Math.min(...valuesArray) : 0;
    const maxValue = valuesArray ? Math.max(...valuesArray) : 0;

    const minBoxIndex = convertToScale(minValue, cutoffs);
    const maxBoxIndex = convertToScale(maxValue, cutoffs);

    let selectedIndex = convertToScale(value, cutoffs);

    return (
      <View style={styles.infoRow}>
        <Text
          style={{
            flex: 1.9,
            marginTop: 5,
            fontSize: label === "Feels like" ? 20 : 16,
          }}
        >
          {label}:
        </Text>
        <View style={{ flex: 1.5, flexDirection: "row", alignItems: "center" }}>
          <View>
            <Text
              variant={label == "Feels like" ? "titleLarge" : "titleMedium"}
              style={{ fontWeight: "bold", marginTop: 5 }}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {value == 0 && hasZeroValue ? zeroText : textArray[selectedIndex]}
            </Text>
            <Text
              variant={label == "Feels like" ? "labelLarge" : "labelMedium"}
            >
              {roundWeatherValue(label, value)}
              {unit === "imperial" ? imperialUnit : metricUnit}
            </Text>
          </View>
          {minBoxIndex !== undefined &&
            maxBoxIndex !== undefined &&
            maxBoxIndex - minBoxIndex >= 2 && (
              <Tooltip
                popover={<Text style={{color: theme.colors.surface}}>{getDrasticChangeMessage()}</Text>}
                visible={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                height={90}
                width={120}
                backgroundColor={theme.colors.onSurface}
                // overlayColor={"rgba(0, 0, 0, 0)"}
              >
                <IconButton
                  icon="swap-vertical-bold"
                  iconColor={theme.colors.error}
                  style={{ height: 30, aspectRatio: 1 }}
                />
              </Tooltip>
            )}
        </View>

        <View style={[styles.infoColn, { flex: 2.8 }]}>
          <BoxRow numBoxes={cutoffs.length} ref={ref} />
        </View>
        <Text>{selectedBox}</Text>
      </View>
    );
  }
);

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
