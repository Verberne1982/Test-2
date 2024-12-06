window.onload = () => {
    let downloaded = false; // Variabele om bij te houden of POI-data al is gedownload

    // Selecteer het GPS-camera-element uit de A-Frame scène
    const el = document.querySelector("[gps-new-camera]");

    // Luister naar updates van de GPS-camera (bijvoorbeeld nieuwe locaties van de gebruiker)
    el.addEventListener("gps-camera-update-position", async (e) => {
        if (!downloaded) { // Controleer of data al is opgehaald
            const latitude = e.detail.position.latitude; // Huidige breedtegraad van de gebruiker
            const longitude = e.detail.position.longitude; // Huidige lengtegraad van de gebruiker

            alert(`Got first GPS position: lon ${longitude}, lat ${latitude}`); // Debugging: Eerste GPS-positie tonen

            // Haal POI-data (Points of Interest) op van de API
            const response = await fetch("https://fontys-geolocation-api.onrender.com/");
            const pois = await response.json(); // Converteer de respons naar JSON

            // Verwerk elk POI-object dat van de server is ontvangen
            pois.forEach((poi) => {
                const { coordinates } = poi.location; // Haal GPS-coördinaten van de POI op
                const { name } = poi; // Haal de naam van de POI op

                // Bereken de afstand van de huidige locatie van de gebruiker naar het POI
                const distance = calculateDistance(latitude, longitude, coordinates[0], coordinates[1]);

                // Stel de schaal van de objecten in op basis van de afstand (grotere objecten als ze verder weg zijn)
                const scale = distance > 5000 ? 100 : 20; // 5 km als drempelwaarde

                // Maak een compound entity voor het POI, die zowel een box als een tekstlabel bevat
                const compoundEntity = document.createElement("a-entity");
                compoundEntity.setAttribute("gps-new-entity-place", {
                    latitude: coordinates[0], // Breedtegraad van de POI
                    longitude: coordinates[1], // Lengtegraad van de POI
                });

                // Maak een box-entiteit die het POI visualiseert
                const box = document.createElement("a-box");
                box.setAttribute("scale", { x: scale, y: scale, z: scale }); // Stel de grootte van de box in
                box.setAttribute("material", { color: "blue" }); // Geef de box een blauwe kleur
                box.setAttribute("position", { x: 0, y: scale / 2, z: 0 }); // Positioneer de box iets boven de grond

                // Maak een tekst-entiteit die de naam van het POI toont
                const text = document.createElement("a-text");
                const textScale = scale / 5; // Schaal de tekst relatief aan de box
                text.setAttribute("value", name || "Unknown POI"); // Stel de naam in of gebruik een fallback
                text.setAttribute("look-at", "[gps-new-camera]"); // Laat de tekst altijd naar de camera kijken
                text.setAttribute("scale", { x: textScale, y: textScale, z: textScale }); // Stel de grootte van de tekst in
                text.setAttribute("align", "center"); // Centreer de tekst
                text.setAttribute("position", { x: 0, y: scale + 10, z: 0 }); // Positioneer de tekst boven de box

                // Voeg de box en tekst toe aan de compound entity
                compoundEntity.appendChild(box);
                compoundEntity.appendChild(text);

                // Voeg de compound entity toe aan de A-Frame scène
                document.querySelector("a-scene").appendChild(compoundEntity);
            });

            downloaded = true; // Markeer dat de data is gedownload
        }
    });

    /**
     * Bereken de afstand tussen twee GPS-punten in meters
     * @param {number} lat1 - Breedtegraad van het eerste punt
     * @param {number} lon1 - Lengtegraad van het eerste punt
     * @param {number} lat2 - Breedtegraad van het tweede punt
     * @param {number} lon2 - Lengtegraad van het tweede punt
     * @returns {number} - Afstand in meters
     */
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Radius van de aarde in meters
        const phi1 = (lat1 * Math.PI) / 180; // Breedtegraad omzetten naar radialen
        const phi2 = (lat2 * Math.PI) / 180; // Breedtegraad van het tweede punt omzetten naar radialen
        const deltaPhi = ((lat2 - lat1) * Math.PI) / 180; // Verschil in breedtegraad
        const deltaLambda = ((lon2 - lon1) * Math.PI) / 180; // Verschil in lengtegraad

        // Haversine-formule om de afstand tussen twee punten op een bol te berekenen
        const a =
            Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Afstand in meters
    }
};
