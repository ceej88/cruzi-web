import { useState, useEffect } from 'react';

const WEATHER_CACHE_KEY = 'cruzi_weather_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const PROFILE_KEY = 'cruzi_instructor_profile';

export type WeatherAlertType = 'rain' | 'snow' | 'ice' | null;

interface WeatherAlertState {
  hasAlert: boolean;
  alertType: WeatherAlertType;
  loading: boolean;
}

export function useWeatherAlert(): WeatherAlertState {
  const [state, setState] = useState<WeatherAlertState>({
    hasAlert: false,
    alertType: null,
    loading: true,
  });

  useEffect(() => {
    const checkWeather = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem(WEATHER_CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setState({ ...data, loading: false });
            return;
          }
        }

        // Get instructor location from profile
        const profile = localStorage.getItem(PROFILE_KEY);
        if (!profile) {
          setState({ hasAlert: false, alertType: null, loading: false });
          return;
        }

        const { address } = JSON.parse(profile);
        if (!address) {
          setState({ hasAlert: false, alertType: null, loading: false });
          return;
        }

        // Extract postcode from address (UK format - last part of address)
        const postcodeMatch = address.match(/[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}/i);
        const postcode = postcodeMatch ? postcodeMatch[0] : null;

        if (!postcode) {
          setState({ hasAlert: false, alertType: null, loading: false });
          return;
        }

        // Use postcodes.io for UK postcode geocoding (free, no API key)
        const geoResponse = await fetch(
          `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.replace(/\s/g, ''))}`
        );
        
        if (!geoResponse.ok) {
          setState({ hasAlert: false, alertType: null, loading: false });
          return;
        }

        const { result } = await geoResponse.json();
        
        if (!result?.latitude || !result?.longitude) {
          setState({ hasAlert: false, alertType: null, loading: false });
          return;
        }

        // Use Open-Meteo API (free, no key required)
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${result.latitude}&longitude=${result.longitude}&current=precipitation,snowfall,temperature_2m`
        );

        if (!weatherResponse.ok) {
          setState({ hasAlert: false, alertType: null, loading: false });
          return;
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        if (!current) {
          setState({ hasAlert: false, alertType: null, loading: false });
          return;
        }

        // Determine alert type
        const hasRain = current.precipitation > 2; // >2mm/hr is moderate rain
        const hasSnow = current.snowfall > 0;
        const hasIce = current.temperature_2m < 1 && current.precipitation > 0;

        const alertType: WeatherAlertType = hasSnow
          ? 'snow'
          : hasIce
          ? 'ice'
          : hasRain
          ? 'rain'
          : null;

        const data = { hasAlert: !!alertType, alertType };

        // Cache the result
        localStorage.setItem(
          WEATHER_CACHE_KEY,
          JSON.stringify({ data, timestamp: Date.now() })
        );

        setState({ ...data, loading: false });
      } catch (error) {
        console.error('Weather alert check failed:', error);
        setState({ hasAlert: false, alertType: null, loading: false });
      }
    };

    checkWeather();
  }, []);

  return state;
}
