// https://wiki.openstreetmap.org/wiki/Overpass_API#The_Programmatic_Query_Language_(OverpassQL)

export class OverpassClient {

    static async getRestarauntsByGPS(lat: number, long: number) {

        // Danforth: 43.676173, -79.358705
        // node(around:25, 43.676173, -79.358705); 25meters around lat/long
        // node(around:5000, 43.676173, -79.358705)[amenity=pharmacy];

        var result = await fetch(
            "https://overpass-api.de/api/interpreter",
            {
                method: "POST",
                body: "data=" + encodeURIComponent(`
                    [out:json];
                    node(around:1000, 43.676173, -79.358705)[amenity=restaurant];
                    out;
                `)
            },
        ).then(
            (data) => data.json()
        )

        return result;
    }

}