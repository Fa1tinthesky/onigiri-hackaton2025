import { useEffect, useState, useRef } from "react";

/**
 * getUserLocation - simple hook using browser Geolocation API
 * returns:
 *   coords: { latitude, longitude, accuracy } | null
 *   loading: boolean
 *   error: string | null
 *   startWatch(): starts continuous tracking
 *   stopWatch(): stops continuous tracking
 */
export function getUserLocation({ enableHighAccuracy = true, timeout = 10000, maximumAge = 0 } = {}) {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  const getCurrent = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported");
      return;
    }
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCoords({ latitude, longitude, accuracy, timestamp: pos.timestamp });
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Permission denied or unavailable");
        setLoading(false);
      },
      { enableHighAccuracy, timeout, maximumAge }
    );
  };

  const startWatch = () => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation not supported");
      return;
    }
    setError(null);
    if (watchIdRef.current != null) return; // already watching
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCoords({ latitude, longitude, accuracy, timestamp: pos.timestamp });
      },
      (err) => setError(err.message || "Watch error"),
      { enableHighAccuracy, timeout, maximumAge }
    );
  };

  const stopWatch = () => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  useEffect(() => {
    // Optionally request once on mount:
    // getCurrent();
    return () => stopWatch();
  }, []);

  return { coords, loading, error, getCurrent, startWatch, stopWatch };
}

