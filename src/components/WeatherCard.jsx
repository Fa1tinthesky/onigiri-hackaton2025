import React from "react";
import "./css/WeatherCard.css";

export default function WeatherCard({
  time,
  // weather,
  // temperature,
  // humidity,
  // aqi,
}) {
  return (
    <div className="weather-card">
      <h4>
        {new Date(time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </h4>
      {/* <p>
        {weather?.icon} {weather?.text}
      </p>
      <p>🌡 {Math.round(temperature)}°C</p>
      <p>💧 {humidity}%</p>
      <p>🌫 AQI: {aqi}</p> */}
    </div>
  );
}
