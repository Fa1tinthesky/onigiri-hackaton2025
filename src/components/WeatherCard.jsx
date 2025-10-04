import React from "react";
import "./css/WeatherCard.css";

export default function WeatherCard({ time, weather, temperature }) {
  return (
    <div className="weather-card">
      <h3 className="weather-time">{time}</h3>
      <p className="weather-info">{weather}</p>
      {temperature && <p className="weather-temp">{temperature}°C</p>}
    </div>
  );
}

