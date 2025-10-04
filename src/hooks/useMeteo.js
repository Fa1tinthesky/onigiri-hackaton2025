import { useState, useEffect } from "react";

const weathercodemap = {
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

export const useMeteo = (lat, lon) => {
  const [data, setdata] = useState([]);
  const [loading, setloading] = useState(true);
  const [error, seterror] = useState(null);

  useEffect(() => {
    if (!lat || !lon) return;

    const fetchdata = async () => {
      setloading(true);
      seterror(null);

      try {
        const res = await fetch(
          "https://asia-south2-saasbusiness-49fbe.cloudfunctions.net/get_point_data",
          {
            method: "post",
            headers: { "content-type": "application/json" },
            mode: "cors", // <<< this ensures the browser enforces cors
            body: JSON.stringify({ lat: 38.5, lon: 68.7 }),
          }
        );

        console.log(res)

        const json = await res.json(); // now this should work!

        // ensure structure matches your backend response
        if (!json?.times || !json?.pollution) {
          throw new error("invalid response format");
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

        console.log("✅ latest aqi:", hours.at(-1)?.aqi_pm25);
        setdata(hours);
      } catch (err) {
        console.error("❌ fetch error:", err);
        seterror(err);
      } finally {
        setloading(false);
      }
    };

    fetchdata();
  }, [lat, lon]);

  return { data, loading, error };
};
