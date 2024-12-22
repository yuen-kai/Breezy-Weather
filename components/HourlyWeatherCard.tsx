// app/components/HourlyWeatherCard.tsx
import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Card, Text } from 'react-native-paper';
import useSettingsStore from '../store/settingsStore';

interface HourlyWeatherCardProps {
  time: string;
  temp_c: number;
  temp_f: number;
  conditionIcon: string;
  conditionText: string;
  wind_speed: number;
  humidity: number;
  uv: number;
}

const HourlyWeatherCard: React.FC<HourlyWeatherCardProps> = ({
  time,
  temp_c,
  temp_f,
  conditionIcon,
  conditionText,
  wind_speed,
  humidity,
  uv,
}) => {
  const { scale, unit } = useSettingsStore();

  // Convert temperature to correct unit
  const temperature = unit === 'imperial' ? temp_f : temp_c;

  // Determine scale value (example logic)
  const getScaleValue = (temp: number) => {
    if (scale === '1-5') {
      if (temp < 32) return '1/5';
      if (temp < 50) return '2/5';
      if (temp < 70) return '3/5';
      if (temp < 85) return '4/5';
      return '5/5';
    } else {
      // '1-3' scale
      if (temp < 50) return '1/3';
      if (temp < 75) return '2/3';
      return '3/3';
    }
  };

  return (
    <Card style={styles.container}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.timeText}>
          {time}
        </Text>
        <Image
          source={{ uri: `https:${conditionIcon}` }}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text variant="headlineSmall" style={styles.tempText}>
          {Math.round(temperature)}° {unit === 'imperial' ? 'F' : 'C'}
        </Text>
        <Text variant="bodyMedium" style={styles.conditionText}>
          {conditionText}
        </Text>
        <Text variant="bodyMedium">Scale: {getScaleValue(temperature)}</Text>

        {/* Additional Weather Info */}
        <View style={styles.additionalInfo}>
          <Text variant="labelSmall">Wind: {wind_speed} {unit === 'imperial' ? 'mph' : 'kph'}</Text>
          <Text variant="labelSmall">Humidity: {humidity}%</Text>
          <Text variant="labelSmall">UV: {uv}</Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 6,
    width: 140,
    alignItems: 'center',
    padding: 8,
  },
  timeText: {
    textAlign: 'center',
    marginBottom: 4,
  },
  icon: {
    width: 40,
    height: 40,
  },
  tempText: {
    marginTop: 4,
  },
  conditionText: {
    textAlign: 'center',
  },
  additionalInfo: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
});

export default HourlyWeatherCard;
