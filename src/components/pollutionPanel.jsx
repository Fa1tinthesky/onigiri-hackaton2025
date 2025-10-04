import { useMeteo } from "../hooks/useMeteo";
import get_aqi from "../utils/get_aqi";

/** 
    * @function
    * @param {Object} param0 Object with positions with lat lon
    * @param {*} param0.lat 
    * @param {*} param0.lon */
export default function pollutionPanel({ lat, lon }) {
  const { data, loading, error } = useMeteo(lat, lon);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching data</p>;

  return (
    <div>
      {data.map((hour) => (
        <div key={hour.time}>
          <p>{hour.time}</p>
          <p>{hour.weather.icon} {hour.weather.text}</p>
          <p>Temp: {hour.temperature}°C</p>
          <p>Wind: {hour.windspeed} m/s</p>
          <p>PM2.5: {hour.pm25}</p>
          <p>NO2: {hour.no2}</p>
        </div>
      ))}
    </div>
  );
};

