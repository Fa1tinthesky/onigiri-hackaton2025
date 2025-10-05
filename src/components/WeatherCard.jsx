import React from "react";
import "./css/WeatherCard.css";

const formatTime = (timeValue) => {
  if (!timeValue) return "N/A";
  
  // Remove the trailing 'Z' if there's already a timezone offset
  const cleanedTime = timeValue.replace(/(\+\d{2}:\d{2})Z$/, '$1');
  
  const date = new Date(cleanedTime);
  
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }
  
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function WeatherCard({
  time,
  weather,
}) {
  return (
    <div className="weather-card">
      <h4>
        {formatTime(time)}
      </h4>
      <p>
        {weather?.icon} {weather?.text}
      </p>
      <p>🌡 {Math.round(weather.temperature)}°C</p>
      <p>💧 {weather.humidity}%</p>
    </div>
  );
}
