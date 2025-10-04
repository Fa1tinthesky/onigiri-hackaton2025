export default async function() { 
    const url = `https://asia-south2-saasbusiness-49fbe.cloudfunctions.net/ee_tempo`;
    console.log(url);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Respones status: ${response.status}`);
        }
        console.log(response)
        const result = await response.json();
        console.log("url: ", result.url_template);
        return(url + result.url_template); 
    } catch (error) {
        console.error("Error from get_tiles:", error.message);
    }
}
