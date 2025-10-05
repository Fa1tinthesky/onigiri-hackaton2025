import { useState } from "react";
import WeatherCard from "./WeatherCard";
import PollutionCard from "./PollutionCard";
import "./css/WeatherPanel.css";

export default function WeatherPanel({ data }) {
  const [showWeather, setShowWeather] = useState(false);

  if (!data) return null;

  return (
    <div className="weather-panel-wrapper">
      <div className="wp-toggle" onClick={() => setShowWeather(!showWeather)}>
        <div className={`wp-toggle-thumb ${showWeather ? "wp-right" : ""}`}>
          {showWeather ? "☁" : "🌫"}
        </div>
        <span className="wp-toggle-label">
          {showWeather ? "Weather" : "Pollution"}
        </span>
      </div>

      <div className="weather-panel">
        {showWeather
          ? data.map((item, index) => (
              <WeatherCard
                weather={item.weather}
                key={index}
                time={item.time}
              />
            ))
          : data.map((item, index) => (
              <PollutionCard
                pollution={item.pollution}
                key={index}
                time={item.time}
              />
            ))}
      </div>
    </div>
  );
}
