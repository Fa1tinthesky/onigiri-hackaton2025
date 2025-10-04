export default function(lat, lon) {
    const R = 6371;

    let x = R * Math.cos(lat) * Math.cos(lon);
    let y = R * Math.cos(lat) * Math.sin(lon);
    let z = R * Math.sin(lat);

    return([x, y, z]);
}
