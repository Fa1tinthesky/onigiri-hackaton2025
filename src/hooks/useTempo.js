import { useEffect, useState } from "react";

export function useTempo(lat, lon) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!lat || !lon) return;

    const fetchTempo = async () => {
      const url =
        "https://asia-south2-saasbusiness-49fbe.cloudfunctions.net/tempo_value";
      setLoading(true);

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lat: lat,
            lon: lon,
          }),
        });

        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        console.log("Tempo data:", json);

        setData(json);
      } catch (e) {
        console.error("useTempo error:", e.message);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTempo();
  }, [lat, lon]);

  return { data, error, loading };
}
