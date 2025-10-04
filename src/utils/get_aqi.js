/** 
    * @param {Object} pollution_data dataset fetched from OpenMeteo for some lat and lon
    * @param {Number} hours_forward
    * @returns {Number} color of a pixel on that position
    * */
function calc_aqi(pollution_data, hours_forward) {
    const us_aqi_co2 = pollution_data.pollution.us_aqi_nitrogen_dioxide[hours_forward];
    const us_aqi_pm10 = pollution_data.pollution.us_aqi_pm10[hours_forward];
    const us_aqi_pm2_5 = pollution_data.pollution.us_aqi_pm2_5[hours_forward];

    console.info(`CO2 pollution data ${hours_forward} forward`, us_aqi_co2);
    console.info(`pm_10 pollution data ${hours_forward} forward`, us_aqi_pm10);
    console.info(`pm2_5 pollution data ${hours_forward} forward`, us_aqi_pm2_5);

    const dominant_pollution = Math.max(us_aqi_co2, us_aqi_pm10, us_aqi_pm2_5);
    console.log("POLLUTION:", dominant_pollution);

    return dominant_pollution
}

/**
    * @function
    * @param {Object<Number, Number>} pos - lat and lon position for which to fetch data 
    */
export default async function(pos) {
    const url = "https://asia-south2-saasbusiness-49fbe.cloudfunctions.net/get_point_data";
    
    console.info("TRYING TO FETCH METEO DATA ON", typeof pos.lat, typeof pos.lon);
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                lat: pos.lat,
                lon: pos.lat
            })
        });

        if (!response.ok) {
            throw new Error(`Respones status: ${response.status}`);
        }

        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));

        return data;
    } catch (e) {
        console.error("Happened:", e.message);
    }
}
