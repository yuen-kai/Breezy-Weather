import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, IconButton } from "react-native-paper";
import BoxRow from "@/components/BoxRow";
import { useAppTheme } from "@/theme";
import useSettingsStore from "@/store/store";
import { getAverage } from "@/functions/average";
import { Tooltip } from "@rneui/themed";
import { getDrasticChangeMessage, getSortedTimeOfDay } from "@/functions/drasticChange";

interface InfoRowProps {
  label: string;
  value: number;
  cutoffs: number[];
  textArray: string[];
  imperialUnit: string;
  metricUnit: string;
  valuesArray?: number[];
  metricConversion?: (value: number) => number;
  getWeightedAverage?: (values: number[]) => number;
  selectedBox?: number;
  hasZeroValue?: boolean;
  zeroText?: string;
  day: number;
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
      metricConversion,
      getWeightedAverage = getAverage,
      selectedBox,
      hasZeroValue,
      zeroText,
      day,
    },
    ref
  ) => {
    const theme = useAppTheme();
    const { unit, timeOfDay, timeOfDaySettings } = useSettingsStore();
    const [open, setOpen] = React.useState(false);

    const selectedIndex = convertToScale(value, cutoffs);
    const sortedTimeOfDay = getSortedTimeOfDay(timeOfDay, timeOfDaySettings, day);
    const drasticChangeMessage = getDrasticChangeMessage(
      timeOfDaySettings,
      valuesArray,
      value,
      cutoffs,
      selectedIndex,
      day,
      hasZeroValue,
      zeroText,
      getWeightedAverage,
      label,
      convertToScale,
      textArray,
      sortedTimeOfDay
    );

    function roundWeatherValue(value: number) {
      value = unit === "metric" && metricConversion != undefined ? metricConversion(value) : value;
      // Round to max precision 2
      if (value > 10) return Math.round(value);
      return value.toPrecision(2);
    }


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
            <Text variant={label == "Feels like" ? "labelLarge" : "labelMedium"}>
              {roundWeatherValue(value)}
              {unit === "imperial" ? imperialUnit : metricUnit}
            </Text>
          </View>
          {drasticChangeMessage && (
            <Tooltip
              popover={<Text style={{ color: theme.colors.surface }}>{drasticChangeMessage}</Text>}
              visible={open}
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
              height={25 * timeOfDay.length + 15}
              width={140}
              backgroundColor={theme.colors.onSurface}
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
