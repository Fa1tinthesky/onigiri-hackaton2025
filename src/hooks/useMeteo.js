import { useState, useEffect } from "react";

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
      setError(null);

      try {
        const res = await fetch(
          "https://asia-south2-saasbusiness-49fbe.cloudfunctions.net/get_point_data",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "cors", // <<< this ensures the browser enforces CORS
            body: JSON.stringify({ lat: 38.5, lon: 68.7 }),
          }
        );

        console.log(res)

        const json = await res.json(); // Now this should work!

        // Ensure structure matches your backend response
        if (!json?.times || !json?.pollution) {
          throw new Error("Invalid response format");
        }

        const times = json.times;
        const pollution = json.pollution;

        const hours = times.map((time, i) => ({
          time,
          pm25: pollution.pm2_5?.[i] ?? null,
          pm10: pollution.pm10?.[i] ?? null,
          no2: pollution.no2?.[i] ?? null,
          so2: pollution.so2?.[i] ?? null,
          co: pollution.co?.[i] ?? null,
          o3: pollution.o3?.[i] ?? null,
          aqi_pm25: pollution.us_aqi_pm2_5?.[i] ?? null,
          aqi_pm10: pollution.us_aqi_pm10?.[i] ?? null,
          aqi_o3: pollution.us_aqi_o3?.[i] ?? null,
        }));

        console.log("✅ Latest AQI:", hours.at(-1)?.aqi_pm25);
        setData(hours);
      } catch (err) {
        console.error("❌ Fetch error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lat, lon]);

  return { data, loading, error };
};
