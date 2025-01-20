import WeatherApiResponse from '../types/weather';

// import { config } from 'dotenv';

// config(); // Load environment variables from .env file

const WEATHER_API_KEY = '5250cf5c5d184b48b37155515242112'

const getWeatherData = async (location: string): Promise<WeatherApiResponse> => {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${location}&days=14&aqi=no&alerts=no`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  const data = await response.json();
  return data;
};

export default getWeatherData;
