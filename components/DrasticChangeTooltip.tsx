import React, { useState } from "react";
import { Text, IconButton } from "react-native-paper";
import { Tooltip } from "@rneui/themed";
import { useAppTheme } from "@/theme";

interface DrasticChangeTooltipProps {
  message: string;
  sortedTimeOfDay: any[];
  width?: number;
}

export const DrasticChangeTooltip: React.FC<DrasticChangeTooltipProps> = ({
  message,
  sortedTimeOfDay,
  width = 140,
}) => {
  const theme = useAppTheme();
  const [open, setOpen] = useState(false);

  if (!message) return null;

  return (
    <Tooltip
      popover={<Text style={{ color: theme.colors.surface }}>{message}</Text>}
      visible={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      height={25 * sortedTimeOfDay.length + 15}
      width={width}
      backgroundColor={theme.colors.onSurface}
    >
      <IconButton
        icon="swap-vertical-bold"
        iconColor={theme.colors.error}
        style={{ height: 30, aspectRatio: 1 }}
      />
    </Tooltip>
  );
};

export default DrasticChangeTooltip;
