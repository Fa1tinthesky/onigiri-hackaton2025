import WeatherPanel from "./WeatherPanel"

export default function Sidebar({ data }) {
    return(
        <div className="sidebar">
            <WeatherPanel data={data}/>
        </div>
    )
}
