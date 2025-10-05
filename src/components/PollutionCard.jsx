export default function PollutionCard({ data }) {
    if (!data) return null;

    function get_aqi_level(aqi) {
        if (aqi <= 50) return { 
            aqi: "Good", 
            suggestion: "Air is clean. Go touch some grass"
        }
        else if (aqi <= 100) return { 
            aqi: "Moderate", 
            suggestion: "Sensitive people (children, elderly) should consider limiting long outdoor exertion."
        }
        else if (aqi <= 150) return { 
            aqi: "Unhealty for sensitive groups", 
            suggestion: "People with respiratory/heart conditions, children, and older adults should reduce prolonged outdoor exertion. Consider wearing a mask."
        }
        else if (aqi <= 200) return { 
            aqi: "Unhealty", 
            suggestion: "Everyone should limit outdoor activities, wear an N95/KN95 mask if going out. Avoid heavy exercise outdoors."
        }
        else if (aqi <= 300) return { 
            aqi: "Very unhealthy", 
            suggestion: "Stay indoors as much as possible. If outside, wear high-quality masks. Avoid strenuous activities."
        }
        else               { return { aqi: "Hazardous", suggestion: "Stay indoors, use air purifiers if available. All outdoor activities should be avoided. Emergency measures may be needed."} }
    }

  /* return (
    <div
      className="pollution-panel"
    >
      <h3>💨 Air Quality</h3>
      <p>
        <b>AQI:</b> {data.aqi}
      </p>
      <p>
        <b>Status:</b> {get_aqi_level(data.aqi)}
      </p>
    </div>
  ); */

        return <></>
}

