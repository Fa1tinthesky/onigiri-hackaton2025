import { useState } from "react";
import CesiumMap from "./components/CesiumMap";
import Layers from "./components/layers";
import PollutionPanel from "./components/pollutionPanel";
import WeatherPanel from "./components/weatherPanel";
import "./App.css";

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [pollutionData, setPollutionData] = useState(null);

  const handleMapClick = (data) => {
    // Example: when user clicks map, you fetch data and update state
    setWeatherData(data.weather);
    setPollutionData(data.pollution);
  };

  return (
    <div className="map-container">
      <CesiumMap onMapClick={handleMapClick} />

      <div className="floating-panels">
        <div className="top-right-panel">
          <Layers />
        </div>

        <div className="bottom-right-panel">
          <WeatherPanel data={weatherData} />
        </div>

        <div className="right-panel">
          <PollutionPanel data={pollutionData} />
        </div>
      </div>
    </div>
  );
}

export default App;
