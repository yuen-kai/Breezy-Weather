// app/components/HourlyWeatherCard.tsx
import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Card, Text } from 'react-native-paper';
import useSettingsStore from '../store/settingsStore';
import ClothingSuggestion from './ClothingSuggestion';

interface HourlyWeatherCardProps {
  time: string;
  overallScale: number;
  feelsLike: number;
  windSpeed: number;
  conditionIcon: string;
}

const HourlyWeatherCard: React.FC<HourlyWeatherCardProps> = ({
  time,
  overallScale,
  feelsLike,
  windSpeed,
  conditionIcon
}) => {
  const { scale, unit } = useSettingsStore();

  return (
    <Card style={styles.container}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.timeText}>
          {time}
        </Text>
        <ClothingSuggestion temperature={feelsLike} wind_speed={windSpeed}/>
        <Image
          source={{ uri: `https:${conditionIcon}` }}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text variant="bodyMedium" style={{textAlign:'center'}}>Scale: {overallScale}</Text>
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
    height: 250,
  },
  timeText: {
    textAlign: 'center',
    marginBottom: 4,
  },
  icon: {
    flex:.5,
    aspectRatio: 1,
    alignSelf: 'center',
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
