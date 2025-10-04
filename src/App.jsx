import { useEffect, useState } from "react";
import CesiumMap from "./components/CesiumMap";
import Layers from "./components/Layers";
import PollutionPanel from "./components/pollutionPanel";
import WeatherPanel from "./components/weatherPanel";
import { getUserLocation } from "./components/getUserLocation";
import "./App.css";
import { useMeteo } from "./hooks/useMeteo";
import useTempo from "./hooks/useTempo";

function App() {
      const { coords, getCurrent, startWatch, stopWatch, loadingUserLocation, errorUserLocation } = getUserLocation();
  const [userLocation, setUserLocation] = useState(null);

  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);

  const {data, loading, error} = useMeteo(lon, lat);
  const {dataTempo, loadingTempo, errorTempo} = useTempo(lon, lat);
  const [layer, setLayer] = useState({
    NA: true,
    TJ: true,
  });

    useEffect(() => {
        if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("✅ Got location:", latitude, longitude);
      },
      (error) => {
        console.error("❌ Error getting location:", error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.error("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            console.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            console.error("The request to get user location timed out.");
            break;
          default:
            console.error("An unknown error occurred.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }, []);

    console.log(dataTempo);
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
          <PollutionPanel data={dataTempo} />
        </div>
      </div>
    </div>
  );
}

export default App;
