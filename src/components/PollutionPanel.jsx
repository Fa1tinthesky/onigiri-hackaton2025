export default function PollutionPanel({ data }) {
  if (!data || data.length === 0) return null;

  // Get current local time in ISO format, truncated to hour
  const now = new Date();
  const currentHourISO = now.toISOString().slice(0, 13); // "2025-10-05T14"

  // Find the data object matching the current hour
  const currentData = data.find((d) => d.time.startsWith(currentHourISO));


  if (!currentData) return null;

  const aqi = Math.round(currentData.pollution.aqi_pm25); // adjust if your field name is different

  function get_aqi_level(aqi) {
    if (aqi <= 50) return "Good";
    else if (aqi <= 100) return "Moderate";
    else if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    else if (aqi <= 200) return "Unhealthy";
    else if (aqi <= 300) return "Very Unhealthy";
    else return "Hazardous";
  }

  const getColor = (aqi) => {
    if (aqi <= 50) return "#4CAF50";
    if (aqi <= 100) return "#CDDC39";
    if (aqi <= 150) return "#FFC107";
    if (aqi <= 200) return "#FF5722";
    return "#F44336";
  };

  return (
    <div className="pollution-panel" style={{ borderLeftColor: getColor(aqi) }}>
      <h3>💨 Air Quality</h3>
      <p>
        <b>AQI:</b> {aqi}
      </p>
      <p>
        <b>Status:</b> {get_aqi_level(aqi)}
      </p>
    </div>
  );
}
