import { useEffect, useState } from "react";
import useUserLocation from "./hooks/useUserLocation";
import CesiumMap from "./components/CesiumMap";
import Layers from "./components/Layers";
import PollutionPanel from "./components/PollutionPanel";
import WeatherPanel from "./components/WeatherPanel";

// import { getUserLocation } from "./components/getUserLocation";
import "./App.css";
import { useTempo } from "./hooks/useTempo";

function App() {
  // const { coords, getCurrent, startWatch, stopWatch, loadingUserLocation, errorUserLocation } = getUserLocation();
  const [userLocation, setUserLocation] = useState(null);
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const { coords, coordsError, CoordsLoading } = useUserLocation();

  const { data, loading, error } = useTempo(lat, lon);

  const [layers, setLayers] = useState({
    "North America": true,
    Tajikistan: true,
  });

  useEffect(() => {
    if (coords) {
      console.log("✅ My location:", coords.latitude, coords.longitude);
      setLat(coords.latitude)
      setLon(coords.longitude)
      // You can setLat/SetLon here if you want
    }
  }, [coords]);

  const handleMapClick = (lat, lon) => {
    setLat(lat);
    setLon(lon);

    console.log(lon, lat, data);
  };

  const toggleLayer = (key) => {
    console.log({ ...layers, [key]: !layers[key] });
    setLayers({ ...layers, [key]: !layers[key] });
  };

  return (
    <div className="map-container">
      <CesiumMap coords={coords} layers={layers} handler={handleMapClick} />
      <div className="floating-panels">
        <div className="top-right-panel">
          <Layers layers={layers} toggleLayer={toggleLayer} />
        </div>

        <div className="top-left">
          <PollutionPanel data={data} />
        </div>

        <div className="bottom-panel">
          <WeatherPanel data={data} />
        </div>
      </div>
    </div>
  );
}

export default App;
