import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { SegmentedButtons } from "react-native-paper";
import { TimeOfDay, TimeOfDaySetting } from "@/types/timeOfDay";
import useSettingsStore from "../store/store";

type SegmentedButtonItem = {
  value: string;
  label: string;
  checkedColor?: string;
  uncheckedColor?: string;
  style?: StyleProp<ViewStyle>;
  showSelectedCheck?: boolean;
  accessibilityLabel?: string;
  testID?: string;
};

interface TimeOfDaySelectorProps {
  value: TimeOfDay[];
  onValueChange: (value: TimeOfDay[]) => void;
  disabledFunction?: (setting: TimeOfDaySetting) => boolean;
  style?: StyleProp<ViewStyle>;
  theme?: {
    fonts?: {
      labelLarge?: {
        fontSize?: number;
      };
    };
  };
}

/**
 * A component for selecting time of day options using segmented buttons
 */
const TimeOfDaySelector = ({
  value,
  onValueChange,
  disabledFunction,
  style,
  theme = {
    fonts: {
      labelLarge: { fontSize: 12 },
    },
  },
}: TimeOfDaySelectorProps) => {
  // Create buttons from timeOfDaySettings
  const { timeOfDaySettings } = useSettingsStore();
  const buttons: SegmentedButtonItem[] = timeOfDaySettings.map((setting) => ({
    value: setting.label,
    label: setting.displayName,
    disabled: disabledFunction ? disabledFunction(setting) : false,
  }));

    return (
      <SegmentedButtons
        style={style}
        value={value}
        onValueChange={(value) => onValueChange(value as TimeOfDay[])}
        buttons={buttons}
        multiSelect={true}
        theme={theme}
      />
    );
};

export default TimeOfDaySelector;
