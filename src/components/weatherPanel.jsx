
export default function WeatherPanel({ data }) {
  if (!data) return null;

  return (
    <div className="weather-panel">
      <h3>🌦 Weather Info</h3>
      <p>
        <b>Temperature:</b> {data.temp}°C
      </p>
      <p>
        <b>Humidity:</b> {data.humidity}%
      </p>
      <p>
        <b>Wind:</b> {data.wind} km/h
      </p>
      <p>
        <b>Condition:</b> {data.condition}
      </p>
    </div>
  );
}
