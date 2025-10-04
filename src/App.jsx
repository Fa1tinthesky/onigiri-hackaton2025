import { useState } from "react";
import CesiumMap from "./components/CesiumMap";
import Layers from "./components/Layers";
import PollutionPanel from "./components/pollutionPanel";
import WeatherPanel from "./components/weatherPanel";
import "./App.css";
import { useMeteo } from "./hooks/useMeteo";

function App() {
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [layer, setLayer] = useState({
    NA: true,
    TJ: true,
  });
  const { data, loading, error } = useMeteo({ lon, lat });

  const handleMapClick = (lat, lon) => {
    setLat(lat);
    setLon(lon);

    console.log(lon, lat, data);
  };
  const toggleLayer = (key) => {
    setLayer({ ...layer, [key]: !layer[key] });
  };

  return (
    <div className="map-container">
      <CesiumMap layer={layer} handler={handleMapClick} />

      <div className="floating-panels">
        <div className="top-right-panel">
          <Layers layers={layer} toggleLayer={toggleLayer} />
        </div>

        <div className="bottom-right-panel">
          <WeatherPanel data={data} />
        </div>

        <div className="right-panel">
          <PollutionPanel data={data} />
        </div>
      </div>
    </div>
  );
}

export default App;
