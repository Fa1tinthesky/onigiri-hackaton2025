import "./css/PollutionCard.css";

export default function PollutionCard({ pollution, time }) {
  if (!pollution) return null;

  // ---- AQI conversion (US EPA standard) ----
  function calcAQI_PM25(pm25) {
    if (pm25 == null) return null;
    const breakpoints = [
      { cLow: 0, cHigh: 12, iLow: 0, iHigh: 50 },
      { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
      { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
      { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
      { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
      { cLow: 250.5, cHigh: 500.4, iLow: 301, iHigh: 500 },
    ];

    const bp = breakpoints.find((b) => pm25 >= b.cLow && pm25 <= b.cHigh);
    if (!bp) return 500;
    return Math.round(
      ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow
    );
  }

  function calcAQI_NO2(no2) {
    if (no2 == null) return null;
    // µg/m³ conversion (approximate)
    const breakpoints = [
      { cLow: 0, cHigh: 53, iLow: 0, iHigh: 50 },
      { cLow: 54, cHigh: 100, iLow: 51, iHigh: 100 },
      { cLow: 101, cHigh: 360, iLow: 101, iHigh: 150 },
      { cLow: 361, cHigh: 649, iLow: 151, iHigh: 200 },
      { cLow: 650, cHigh: 1249, iLow: 201, iHigh: 300 },
      { cLow: 1250, cHigh: 2049, iLow: 301, iHigh: 400 },
      { cLow: 2050, cHigh: 4049, iLow: 401, iHigh: 500 },
    ];

    const bp = breakpoints.find((b) => no2 >= b.cLow && no2 <= b.cHigh);
    if (!bp) return 500;
    return Math.round(
      ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (no2 - bp.cLow) + bp.iLow
    );
  }

  // ---- Determine what to use ----
  const aqi_pm25 = pollution.aqi_pm25 ?? calcAQI_PM25(pollution.pm25);
  const aqi_no2 = pollution.aqi_no2 ?? calcAQI_NO2(pollution.no2);
  const aqi = aqi_pm25 || aqi_no2 || null;

  // ---- Get descriptive level ----
  function getAQILevel(aqi) {
    if (aqi == null)
      return { level: "N/A", msg: "No readings... breathe at your own risk 🌫" };

    if (aqi <= 25)
      return {
        level: "Pristine",
        msg: "Air so pure it could kiss your lungs 💨",
      };

    if (aqi <= 50)
      return {
        level: "Decent",
        msg: "Still clean, but the purity’s fading — enjoy it while it lasts.",
      };

    if (aqi <= 75)
      return {
        level: "Mildly Polluted",
        msg: "The invisible dust has entered the chat — sensitive folks, tread easy.",
      };

    if (aqi <= 100)
      return {
        level: "Noticeably Polluted",
        msg: "You can almost taste the smog now. Maybe skip that jog, champ.",
      };

    if (aqi <= 150)
      return {
        level: "Unhealthy for Sensitive Groups",
        msg: "The air stings a bit — kids, elders, and anyone fragile, stay in.",
      };

    if (aqi <= 200)
      return {
        level: "Unhealthy",
        msg: "Every breath now costs you a few brain cells. Mask up or stay home.",
      };

    if (aqi <= 300)
      return {
        level: "Very Unhealthy",
        msg: "The sky looks fine, but it’s lying — this air bites deep. Stay inside.",
      };

    return {
      level: "Hazardous",
      msg: "Apocalyptic. Windows closed, filters on, and maybe say your prayers 🫠",
    };

  }

  const info = getAQILevel(aqi);

  // ---- UI ----
  return (
    <div className="pollution-card">
      <h4>
        {new Date(time).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </h4>
      <p>
        AQI: <strong>{Math.round(aqi)}</strong> ({info.level})
      </p>
      <p className="pollution-suggestion">{info.msg}</p>
    </div>
  );
}
