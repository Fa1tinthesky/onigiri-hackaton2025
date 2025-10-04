import WeatherCard from "./WeatherCard";
import "./css/WeatherPanel.css";

export default function WeatherPanel({ data }) {
    const mock_data = [
        { time: "13:00", weather: "☀️ Clear", temp: 26 },
        { time: "14:00", weather: "🌤 Partly Cloudy", temp: 25 },
        { time: "15:00", weather: "🌧 Light Rain", temp: 22 },
        { time: "15:00", weather: "🌧 Light Rain", temp: 22 },
        { time: "15:00", weather: "🌧 Light Rain", temp: 22 },
        { time: "15:00", weather: "🌧 Light Rain", temp: 22 },
        { time: "15:00", weather: "🌧 Light Rain", temp: 22 },
        { time: "15:00", weather: "🌧 Light Rain", temp: 22 },
        { time: "15:00", weather: "🌧 Light Rain", temp: 22 },
        { time: "15:00", weather: "🌧 Light Rain", temp: 22 },
    ]

    return (
        <div className="weather-panel">
        {mock_data.map((item, index) => (
            <WeatherCard
            key={index}
            time={item.time}
            weather={item.weather}
            temperature={item.temp} // notice: item.temp, not item.temperature
            />
        ))}
        </div>  );
}

