import { useState, useEffect } from "react";

export const useMeteo = ({ lat, lon }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (lat === undefined || lon === undefined) return; // strict check

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const payload = { lat: Number(lat), lon: Number(lon) };
      console.log("📡 Fetching data with payload:", payload);

      try {
        const res = await fetch(
          "https://asia-south2-saasbusiness-49fbe.cloudfunctions.net/get_point_data",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "cors",
            body: JSON.stringify(payload),
          }
        );

       

        // Always parse JSON, but check status first
        const json = await res.json();
        console.log(json)
        if (!res.ok) {
          console.error("❌ Backend returned error:", json);
          throw new Error(json?.error || `HTTP ${res.status}`);
        }

        // Validate expected structure
        if (!json?.times || !json?.pollution) {
          console.error("⚠️ Unexpected response format:", json);
          throw new Error("Invalid response format");
        }

        const { times, pollution } = json;

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
