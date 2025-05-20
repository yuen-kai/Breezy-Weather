import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import BoxRow from "@/components/BoxRow";
import useSettingsStore from "@/store/store";

interface InfoRowProps {
  label: string;
  value: number;
  cutoffs: number[];
  textArray: string[];
  imperialUnit: string;
  metricUnit: string;
  metricConversion?: (value: number) => number;
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
      metricConversion,
      selectedBox,
      hasZeroValue,
      zeroText,
    },
    ref
  ) => {
    const { unit } = useSettingsStore();

    const selectedIndex = convertToScale(value, cutoffs);
    
    function roundWeatherValue(value: number) {
      value = unit === "metric" && metricConversion != undefined ? metricConversion(value) : value;
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
