import { useEffect, useState } from "react";
import WeatherCard from "./WeatherCard";
import PollutionCard from "./PollutionCard";
import "./css/WeatherPanel.css";

export default function WeatherPanel({ data }) {
  if (!data) return false;
  // const [normalized, setNormalized] = useState([]);

  // useEffect(() => {
  //   if (data) {
  //     const result = normalizeData(data);
  //     setNormalized(result);
  //   }
  // }, [data]);

  // console.log(data)

  // const weatherCodeMap = {
  //   0: { text: "clear", icon: "☀️" },
  //   1: { text: "mainly clear", icon: "🌤" },
  //   2: { text: "partly cloudy", icon: "⛅" },
  //   3: { text: "overcast", icon: "☁️" },
  //   45: { text: "fog", icon: "🌫" },
  //   48: { text: "rime fog", icon: "🌫" },
  //   51: { text: "light drizzle", icon: "🌦" },
  //   53: { text: "moderate drizzle", icon: "🌦" },
  //   55: { text: "dense drizzle", icon: "🌧" },
  //   56: { text: "light freezing drizzle", icon: "🌧❄️" },
  //   57: { text: "dense freezing drizzle", icon: "🌧❄️" },
  //   61: { text: "slight rain", icon: "🌧" },
  //   63: { text: "moderate rain", icon: "🌧" },
  //   65: { text: "heavy rain", icon: "🌧" },
  //   66: { text: "light freezing rain", icon: "🌧❄️" },
  //   67: { text: "heavy freezing rain", icon: "🌧❄️" },
  //   71: { text: "slight snow", icon: "❄️" },
  //   73: { text: "moderate snow", icon: "❄️" },
  //   75: { text: "heavy snow", icon: "❄️" },
  //   77: { text: "snow grains", icon: "❄️" },
  //   80: { text: "slight rain showers", icon: "🌦" },
  //   81: { text: "moderate rain showers", icon: "🌦" },
  //   82: { text: "violent rain showers", icon: "⛈" },
  //   85: { text: "slight snow showers", icon: "❄️" },
  //   86: { text: "heavy snow showers", icon: "❄️" },
  //   95: { text: "thunderstorm", icon: "⛈" },
  //   96: { text: "thunderstorm w/ hail (light)", icon: "⛈" },
  //   99: { text: "thunderstorm w/ hail (heavy)", icon: "⛈" },
  // };

  // const normalizeData = (data) => {
  //   const { times, weather, ...metrics } = data;

  //   return times.map((time, i) => {
  //     const entry = { time };

  //     // pull pollution values
  //     const pm25 = metrics.pm2_5?.[i] ?? null;
  //     const no2 = metrics.no2?.[i] ?? null;

  //     // calculate AQIs
  //     const pm25_aqi = pm25 !== null ? calcPM25AQI(pm25) : null;
  //     const no2_aqi = no2 !== null ? calcNO2AQI(no2) : null;
  //     const combined_aqi =
  //       pm25_aqi && no2_aqi ? Math.max(pm25_aqi, no2_aqi) : pm25_aqi || no2_aqi;

  //     entry.pollution = {
  //       pm25,
  //       no2,
  //       pm25_aqi,
  //       no2_aqi,
  //       combined_aqi,
  //     };

  //     // add weather data
  //     if (weather && typeof weather === "object") {
  //       const wc = weather.weathercode?.[i];
  //       const rh = weather.relative_humidity_2m?.[i];
  //       const temp = weather.temperature_2m?.[i];
  //       const wind = weather.windspeed_10m?.[i];
  //       const prec = weather.precipitation?.[i];
  //       const cloud = weather.cloudcover?.[i];
  //       const mapped = weatherCodeMap[wc] || {};

  //       entry.weather = {
  //         code: wc ?? null,
  //         text: mapped.text || getCloudinessText(cloud ?? 0),
  //         icon: mapped.icon || getCloudinessIcon(cloud ?? 0),
  //         temperature: temp ?? null,
  //         humidity: rh ?? null,
  //         windspeed: wind ?? null,
  //         precipitation: prec ?? null,
  //         cloudcover: cloud ?? null,
  //       };
  //     }

  //     return entry;
  //   });
  // };

  // // AQI calculation (EPA scale)
  // function calcPM25AQI(pm25) {
  //   const breakpoints = [
  //     [0, 12, 0, 50],
  //     [12.1, 35.4, 51, 100],
  //     [35.5, 55.4, 101, 150],
  //     [55.5, 150.4, 151, 200],
  //     [150.5, 250.4, 201, 300],
  //     [250.5, 350.4, 301, 400],
  //     [350.5, 500.4, 401, 500],
  //   ];
  //   return interpolateAQI(pm25, breakpoints);
  // }

  // function calcNO2AQI(no2) {
  //   const breakpoints = [
  //     [0, 53, 0, 50],
  //     [54, 100, 51, 100],
  //     [101, 360, 101, 150],
  //     [361, 649, 151, 200],
  //     [650, 1249, 201, 300],
  //     [1250, 1649, 301, 400],
  //     [1650, 2049, 401, 500],
  //   ];
  //   return interpolateAQI(no2, breakpoints);
  // }

  // function interpolateAQI(value, breakpoints) {
  //   for (const [Clow, Chigh, Ilow, Ihigh] of breakpoints) {
  //     if (value >= Clow && value <= Chigh) {
  //       return Math.round(
  //         ((Ihigh - Ilow) / (Chigh - Clow)) * (value - Clow) + Ilow
  //       );
  //     }
  //   }
  //   return null;
  // }

  // function getCloudinessText(cloudFraction) {
  //   if (cloudFraction < 0.1) return "clear";
  //   if (cloudFraction < 0.3) return "slightly cloudy";
  //   if (cloudFraction < 0.6) return "partly cloudy";
  //   if (cloudFraction < 0.8) return "mostly cloudy";
  //   return "overcast";
  // }

  // function getCloudinessIcon(cloudFraction) {
  //   if (cloudFraction < 0.1) return "☀️";
  //   if (cloudFraction < 0.3) return "🌤";
  //   if (cloudFraction < 0.6) return "⛅";
  //   if (cloudFraction < 0.8) return "🌥";
  //   return "☁️";
  // }

  // Example usage:

  return (
    <div className="weather-panel">
      {/* {data.map((item, index) => (
        <WeatherCard weather={item.weather} key={index} time={item.time} />
      ))} */}
      {data.map((item, index) => (
        <PollutionCard pollution={item.pollution} key={index} time={item.time} />
      ))}
      
    </div>
  );
}
