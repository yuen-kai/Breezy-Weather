import WeatherApiResponse from '../types/weather';
import { WEATHER_API_KEY } from './apikey';

const getWeatherData = async (location: string): Promise<WeatherApiResponse> => {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${location}&days=14&aqi=no&alerts=no`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }
  const data = await response.json();
  return data;
};

const locationAutocomplete = async (location: string): Promise<WeatherApiResponse["location"][]> => {
  if (location == "") return [];
  const url = `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${location}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to autocomplete location');
  }
  const data = await response.json();
  return data;
};

export { getWeatherData, locationAutocomplete };
