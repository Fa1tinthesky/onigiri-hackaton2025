import { useEffect, useState } from "react";
import WeatherCard from "./WeatherCard";
import "./css/WeatherPanel.css";

export default function WeatherPanel({ data }) {
  
  if (!data.time) return false;


  // Example usage:
  


  return (
    <div className="weather-panel">
      {data.map((item, index) => (
        <WeatherCard
          key={index}
          time={item.time}
          // weather={item.weather}
          // temperature={item.weather?.temperature}
          // humidity={item.weather?.humidity}
          // aqi={item.pollution?.combined_aqi}
        />
      ))}
    </div>
  );
}
