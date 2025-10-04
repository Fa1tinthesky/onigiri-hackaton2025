export default async function get_tiles_url() { 
    const url = "https://asia-south2-saasbusiness-49fbe.cloudfunctions.net/tj_tiles";
    console.log(url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Respones status: ${response.status}`);
        }
        const result = await response.json();
        console.log("URL:", result.urlTemplate)

        return (result.urlTemplate);
    } catch (error) {
        console.error("Error from get_tiles:", error.message);
    }
}
