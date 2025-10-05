import { useEffect, useState } from "react";

export function useTempo(lat, lon) {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (lat == null || lon == null) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          "https://asia-south2-saasbusiness-49fbe.cloudfunctions.net/get_point_data",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat: Number(lat), lon: Number(lon) }),
          }
        );

        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);

        const { times, pollution, weather } = json;

        if (!times) throw new Error("No times in response");

        const normalized = times.map((time, i) => {
          const pm25 = pollution?.pm2_5?.[i] ?? null;
          const no2 = pollution?.no2?.[i] ?? null;
          const aqi_pm25 = pollution?.us_aqi_pm2_5?.[i] ?? null;
          const aqi_no2 = pollution?.us_aqi_no2?.[i] ?? null;

          const wc = weather?.weathercode?.[i];
          const temp = weather?.temperature_2m?.[i];
          const rh = weather?.relative_humidity_2m?.[i];
          const wind = weather?.windspeed_10m?.[i];
          const prec = weather?.precipitation?.[i];
          const cloud = weather?.cloudcover?.[i];

          const { text, icon } = getWeatherTextIcon(wc, cloud, prec);

          return {
            time,
            pollution: { pm25, no2, aqi_pm25, aqi_no2 },
            weather: {
              code: wc ?? null,
              text,
              icon,
              temperature: temp ?? null,
              humidity: rh ?? null,
              windspeed: wind ?? null,
              precipitation: prec ?? null,
              cloudcover: cloud ?? null,
            },
          };
        });

        setData(normalized);
      } catch (err) {
        console.error("❌ fetch error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lat, lon]);

  
  return { data, error, loading };
}


const weatherCodeMap = {
  0: { text: "clear", icon: "☀️" },
  1: { text: "mainly clear", icon: "🌤" },
  2: { text: "partly cloudy", icon: "⛅" },
  3: { text: "overcast", icon: "☁️" },
  45: { text: "fog", icon: "🌫" },
  48: { text: "rime fog", icon: "🌫" },
  51: { text: "light drizzle", icon: "🌦" },
  53: { text: "moderate drizzle", icon: "🌦" },
  55: { text: "dense drizzle", icon: "🌧" },
  56: { text: "light freezing drizzle", icon: "🌧❄️" },
  57: { text: "dense freezing drizzle", icon: "🌧❄️" },
  61: { text: "slight rain", icon: "🌧" },
  63: { text: "moderate rain", icon: "🌧" },
  65: { text: "heavy rain", icon: "🌧" },
  66: { text: "light freezing rain", icon: "🌧❄️" },
  67: { text: "heavy freezing rain", icon: "🌧❄️" },
  71: { text: "slight snow", icon: "❄️" },
  73: { text: "moderate snow", icon: "❄️" },
  75: { text: "heavy snow", icon: "❄️" },
  77: { text: "snow grains", icon: "❄️" },
  80: { text: "slight rain showers", icon: "🌦" },
  81: { text: "moderate rain showers", icon: "🌦" },
  82: { text: "violent rain showers", icon: "⛈" },
  85: { text: "slight snow showers", icon: "❄️" },
  86: { text: "heavy snow showers", icon: "❄️" },
  95: { text: "thunderstorm", icon: "⛈" },
  96: { text: "thunderstorm w/ hail (light)", icon: "⛈" },
  99: { text: "thunderstorm w/ hail (heavy)", icon: "⛈" },
};

function getWeatherTextIcon(wc, cloud = 0, prec = 0) {
  // Use exact weather code if available
  if (wc != null && weatherCodeMap[wc]) return weatherCodeMap[wc];

  // Fallback: base on cloud fraction
  let text, icon;
  if (cloud < 0.1) {
    text = "clear";
    icon = "☀️";
  } else if (cloud < 0.3) {
    text = "slightly cloudy";
    icon = "🌤";
  } else if (cloud < 0.6) {
    text = "partly cloudy";
    icon = "⛅";
  } else if (cloud < 0.8) {
    text = "mostly cloudy";
    icon = "🌥";
  } else {
    text = "overcast";
    icon = "☁️";
  }

  // Add precipitation info if present
  if (prec > 0) {
    if (prec < 2) {
      text += " 🌦";
      icon = "🌦";
    } else if (prec < 5) {
      text += " 🌧";
      icon = "🌧";
    } else {
      text += " ⛈";
      icon = "⛈";
    }
  }

  return { text, icon };
}
