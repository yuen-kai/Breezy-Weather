import React from "react";
import { Card, Title, Paragraph, Icon, Text } from "react-native-paper";
import { View } from "react-native";
import { TouchableOpacity } from "react-native";
import { useAppTheme } from "@/theme";
import WeatherApiResponse from "@/types/weather";

const AlertRow: React.FC<{ alert: WeatherApiResponse["alerts"]["alert"][0] }> = ({ alert }) => {
  const theme = useAppTheme();
  const [expanded, setExpanded] = React.useState(false);

  const getSeverityColor = () => {
    switch (alert.severity.toLowerCase()) {
      case "extreme":
        return theme.colors.extremeWarning;
      case "severe":
        return theme.colors.severeWarning;
      case "moderate":
        return theme.colors.moderateWarning;
      default:
        return theme.colors.regularWarning;
    }
  };

  function formatDate(date: Date) {
    const day = date.getDate() - new Date().getDate();
    const dayString =
      day === 0
        ? ""
        : day === 1
        ? "Tomorrow "
        : `${date.toLocaleDateString(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric",
          })} `;

    const timeString = date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });

    return `${dayString}${timeString}`;
  }

  return (
    <Card
      style={{
        margin: 8,
        borderLeftWidth: 4,
        borderLeftColor: getSeverityColor(),
      }}
    >
      <View style={{ paddingHorizontal: 16 }}>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 10,
          }}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={{ color: getSeverityColor(), fontSize: 18 }} variant="titleMedium">
            {alert.event}
          </Text>
          <Icon source={expanded ? "chevron-up" : "chevron-down"} size={20} />
        </TouchableOpacity>
        {expanded && (
          <View style={{ paddingBottom: 16 }}>
            <Paragraph style={{ fontSize: 12, color: "#757575" }}>{alert.headline}</Paragraph>
            <Paragraph style={{ marginBottom: 8 }}>{alert.desc}</Paragraph>
            {alert.instruction && (
              <Paragraph style={{ fontStyle: "italic" }}>
                Instruction: {alert.instruction}
              </Paragraph>
            )}
          </View>
        )}
      </View>
    </Card>
  );
};

export default AlertRow;
