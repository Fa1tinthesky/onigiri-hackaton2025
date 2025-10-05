export default function PollutionPanel({ data }) {
  if (!data) return null;

    function get_aqi_level(aqi) {
        if (aqi <= 50) return "good"
        else if (aqi <= 100) return "moderate";
        else if (aqi <= 150) return "Unhealty for Sensitive Groups";
        else if (aqi <= 200) return "Unhealty";
        else if (aqi <= 300) return "Very unhealthy";
        else               { return "Hazardous"; }
    }

  const getColor = (aqi) => {
    if (aqi <= 50) return "#4CAF50";
    if (aqi <= 100) return "#CDDC39";
    if (aqi <= 150) return "#FFC107";
    if (aqi <= 200) return "#FF5722";
    return "#F44336";
  };

  return (
    <div
      className="pollution-panel"
      style={{ borderLeftColor: getColor(data.aqi) }}
    >
      <h3>💨 Air Quality</h3>
      <p>
        <b>AQI:</b> {data.aqi}
      </p>
      <p>
        <b>Status:</b> {get_aqi_level(data.aqi)}
      </p>
    </div>
  );
}
