import { useState, useEffect } from "react";
import get_aqi from "../utils/get_aqi";

const weatherCodeMap = {
  0: { text: "Clear", icon: "☀️" },
  1: { text: "Mainly clear", icon: "🌤" },
  2: { text: "Partly cloudy", icon: "⛅" },
  3: { text: "Overcast", icon: "☁️" },
  45: { text: "Fog", icon: "🌫" },
  48: { text: "Rime fog", icon: "🌫" },
  51: { text: "Light drizzle", icon: "🌦" },
  53: { text: "Moderate drizzle", icon: "🌦" },
  55: { text: "Dense drizzle", icon: "🌧" },
  56: { text: "Light freezing drizzle", icon: "🌧❄️" },
  57: { text: "Dense freezing drizzle", icon: "🌧❄️" },
  61: { text: "Slight rain", icon: "🌧" },
  63: { text: "Moderate rain", icon: "🌧" },
  65: { text: "Heavy rain", icon: "🌧" },
  66: { text: "Light freezing rain", icon: "🌧❄️" },
  67: { text: "Heavy freezing rain", icon: "🌧❄️" },
  71: { text: "Slight snow", icon: "❄️" },
  73: { text: "Moderate snow", icon: "❄️" },
  75: { text: "Heavy snow", icon: "❄️" },
  77: { text: "Snow grains", icon: "❄️" },
  80: { text: "Slight rain showers", icon: "🌦" },
  81: { text: "Moderate rain showers", icon: "🌦" },
  82: { text: "Violent rain showers", icon: "⛈" },
  85: { text: "Slight snow showers", icon: "❄️" },
  86: { text: "Heavy snow showers", icon: "❄️" },
  95: { text: "Thunderstorm", icon: "⛈" },
  96: { text: "Thunderstorm w/ hail (light)", icon: "⛈" },
  99: { text: "Thunderstorm w/ hail (heavy)", icon: "⛈" },
};

export const useMeteo = (lat, lon) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lat || !lon) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        /* const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode,windspeed_10m&air_quality=pm10,pm2_5,no2,o3,so2,co`
        `
        );
        const json = await response.json(); */

              const json = await get_aqi({lat, lon});
          console.log("LOGIN JSON FROM useMETEO: ", json);

        const hours = json.hourly.time.map((time, i) => ({
          time,
          temperature: json.hourly.temperature_2m[i],
          windspeed: json.hourly.windspeed_10m[i],
          weatherCode: json.hourly.weathercode[i],
          weather: weatherCodeMap[json.hourly.weathercode[i]] || { text: "Unknown", icon: "❔" },
          pm25: json.hourly.pm2_5 ? json.hourly.pm2_5[i] : null,
          no2: json.hourly.no2 ? json.hourly.no2[i] : null,
          pm10: json.hourly.pm10 ? json.hourly.pm10[i] : null,
          o3: json.hourly.o3 ? json.hourly.o3[i] : null,
          so2: json.hourly.so2 ? json.hourly.so2[i] : null,
          co: json.hourly.co ? json.hourly.co[i] : null,
        }));

        setData(hours);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lat, lon]);

  return { data, loading, error };
};

