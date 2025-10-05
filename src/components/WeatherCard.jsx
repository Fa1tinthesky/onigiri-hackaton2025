import React from "react";
import "./css/WeatherCard.css";

export default function WeatherCard({
  time,
  weather,
}) {
  return (
    <div className="weather-card">
      <h4>
        {new Date(time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </h4>
      <p>
        {weather?.icon} {weather?.text}
      </p>
      <p>🌡 {Math.round(weather.temperature)}°C</p>
      <p>💧 {weather.humidity}%</p>
    </div>
  );
}
