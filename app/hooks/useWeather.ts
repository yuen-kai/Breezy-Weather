// app/hooks/useWeather.ts
import { useState, useEffect } from 'react';
import WeatherApiResponse from '../types/weather';
import getWeatherData from '../services/weatherApi';

const useWeather = (location: string) => {
  const [weather, setWeather] = useState<WeatherApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getWeatherData(location);
        setWeather(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  return { weather, loading, error };
};

export default useWeather;
