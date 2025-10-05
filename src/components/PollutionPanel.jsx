export default function PollutionPanel({ data }) {
  if (!data) return null;

  function no2ToAQI(no2) {
    const breakpoints = [
      { aqiLo: 0, aqiHi: 50, cLo: 0, cHi: 53 },
      { aqiLo: 51, aqiHi: 100, cLo: 54, cHi: 100 },
      { aqiLo: 101, aqiHi: 150, cLo: 101, cHi: 360 },
      { aqiLo: 151, aqiHi: 200, cLo: 361, cHi: 649 },
      { aqiLo: 201, aqiHi: 300, cLo: 650, cHi: 1249 },
      { aqiLo: 301, aqiHi: 400, cLo: 1250, cHi: 1649 },
      { aqiLo: 401, aqiHi: 500, cLo: 1650, cHi: 2049 },
    ];

    for (const bp of breakpoints) {
      if (no2 >= bp.cLo && no2 <= bp.cHi) {
        return Math.round(
          ((bp.aqiHi - bp.aqiLo) / (bp.cHi - bp.cLo)) * (no2 - bp.cLo) +
            bp.aqiLo
        );
      }
    }

    return null; // out of range
  }

  const aqi = no2ToAQI(data.no2_vertical_column_troposphere);
  console.log(aqi)

  function get_aqi_level(aqi) {
    if (aqi <= 50) return "good";
    else if (aqi <= 100) return "moderate";
    else if (aqi <= 150) return "Unhealty for Sensitive Groups";
    else if (aqi <= 200) return "Unhealty";
    else if (aqi <= 300) return "Very unhealthy";
    else {
      return "Hazardous";
    }
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
      style={{ borderLeftColor: getColor(aqi) }}
    >
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
